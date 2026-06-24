import type { TopicStat } from "./types";

// Topic key for the rolling per-topic stats. The bank has casing collisions
// (e.g. "Consolidated billing" vs "Consolidated Billing") that would otherwise
// fork into two buckets, so a topic is keyed by its trimmed, lowercased form.
// The human-readable label is kept on the stored stat (first-seen casing).
//
// This lives in its own store-free module so both the recorder (store.ts, which
// pulls in nanostores) and the pure assembly layer (exam.ts, which must stay
// React/store-free) import the SAME function and so agree on every key. Without
// one shared definition a drill could rank a topic the recorder never wrote.
export function normalizeTopic(topic: string): string {
  return topic.trim().toLowerCase();
}

// Options for ranking weak topics. `minSeen` is the floor of attempts a topic
// needs before it can be called weak, so a never-seen (or barely-seen) topic is
// not mislabeled the weakest spot.
export interface WeakTopicOptions {
  minSeen: number;
}

// One ranked weak topic: the normalized key (for matching questions) plus the
// human label (for naming it on the setup view) and the accuracy that ranked it.
export interface WeakTopic {
  key: string; // normalizeTopic(topic) — matches recorded topicStats keys
  label: string; // first-seen human casing, for display
  accuracy: number; // correct / seen, 0..1
  seen: number;
}

// Rank a learner's weakest topics from the rolling per-topic stats. Returns the
// qualifying topics (seen >= minSeen) sorted by accuracy ascending, ties broken
// by fewer attempts first (least-practiced surfaces sooner), then by most-recent
// activity. Topics below the seen floor are excluded entirely: an untouched
// topic is not weak, just unmeasured (RESEARCH Pitfall 4). With no qualifying
// topics (cold start) this returns [] and the caller falls back to a mixed draw.
export function rankWeakTopics(
  topicStats: Record<string, TopicStat>,
  opts: WeakTopicOptions,
): WeakTopic[] {
  const minSeen = Math.max(1, opts.minSeen);
  const ranked: WeakTopic[] = [];
  for (const [key, stat] of Object.entries(topicStats)) {
    if (!stat || stat.seen < minSeen) continue;
    ranked.push({
      key,
      label: stat.topic,
      accuracy: stat.correct / stat.seen,
      seen: stat.seen,
    });
  }
  ranked.sort((a, b) => {
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy; // worst first
    if (a.seen !== b.seen) return a.seen - b.seen; // least-practiced first
    const aLast = topicStats[a.key]?.lastSeen ?? 0;
    const bLast = topicStats[b.key]?.lastSeen ?? 0;
    return bLast - aLast; // most-recently-touched first
  });
  return ranked;
}
