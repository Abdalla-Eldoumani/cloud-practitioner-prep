// Conservative readiness: an honest "am I ready?" signal derived ONLY from the
// questions the learner has actually answered (the rolling topicStats), never an
// average that could hide a weak domain.
//
// Two layers:
//   per-topic / per-domain  raw accuracy snapshots from topicStats, with the
//                           existing readinessFromPercent band for colour/label
//                           (one definition of "good" — no second band scale).
//   overallReady            ONE boolean, true only when EVERY domain clears a
//                           high accuracy threshold over a minimum sample. A
//                           single weak OR under-sampled domain blocks the green
//                           signal, so the verdict matches the stored data.
//
// Honesty rules baked in (non-negotiable, from quiz-integrity):
//   - The signal reads only answered questions. A domain with no attributed
//     answers is "not enough data yet", never silently ready.
//   - A tiny sample never reads ready, even at 100% (the under-sample guard).
//   - overallReady is the all-domains gate, NEVER an average.
//   - Raw percent + band only. This module never computes or surfaces the AWS
//     scaled score (100-1000 / passing 700); the ResultsPanel disclaimer copy is
//     the model for how the progress dashboard renders this.
//
// Pure and store-free / React-free, like topics.ts and scoring.ts: it takes the
// progress slice and the question pool as plain inputs, so it is deterministic
// and tsx-testable without a DOM. The pool is passed in (the real one by the
// page, a synthetic one by the check) because topicStats keys carry no domain —
// the domain is recovered by joining each topic to a pool question through the
// SAME normalizeTopic the recorder keys by.

import type { Domain, ProgressState, Question, Readiness } from "./types";
import { DOMAINS } from "./constants";
import { normalizeTopic } from "./topics";
import { readinessFromPercent } from "./scoring";

// A domain is called ready only when its accuracy clears this threshold. Aligned
// with the existing >=85 exam-ready band: the readiness bar is set deliberately
// high (~85-90), well above the ~70% real pass line, so a green signal means real
// readiness rather than a bare pass.
export const EXAM_READY_PERCENT = 85;

// ...and only over at least this many answered questions. A domain is not called
// ready on a handful of answers — 100% of three is noise, not readiness
// (so a tiny sample can never inflate the signal).
export const MIN_DOMAIN_SAMPLE = 20;

// One topic's accuracy snapshot, attributed to its domain through the pool.
export interface TopicReadiness {
  key: string; // normalizeTopic(topic) — matches recorded topicStats keys
  label: string; // first-seen human casing, for display
  domain: Domain; // resolved from the pool join
  seen: number;
  correct: number;
  percent: number; // 0-100, rounded
  band: Readiness; // readinessFromPercent — same definition of "good"
}

// One domain's rolled-up snapshot plus its ready verdict.
export interface DomainReadiness {
  domain: Domain;
  seen: number;
  correct: number;
  percent: number; // 0-100, rounded
  band: Readiness; // readinessFromPercent — reused, not a second scale
  ready: boolean; // percent >= EXAM_READY_PERCENT AND seen >= MIN_DOMAIN_SAMPLE
}

// The whole signal: the breakdowns, the single conservative boolean, and a
// human reason for a not-ready verdict (which domain blocks, and why).
export interface ReadinessReport {
  byTopic: TopicReadiness[];
  byDomain: DomainReadiness[];
  overallReady: boolean;
  reason: string;
}

// Round a count ratio to a 0-100 percent. seen 0 reads 0 (no data, not 100).
function percentOf(correct: number, seen: number): number {
  return seen === 0 ? 0 : Math.round((correct / seen) * 100);
}

// Compute the conservative readiness signal from the learner's topicStats and a
// question pool. Only the `topicStats` slice of progress is read, so callers can
// pass the whole ProgressState or a `{ topicStats }` stub.
export function computeReadiness(
  progress: Pick<ProgressState, "topicStats">,
  pool: readonly Question[],
): ReadinessReport {
  // Build the topic -> domain join from the pool. A topic belongs to one domain
  // in this bank, so first writer wins; the key is the SAME normalized form the
  // recorder writes topicStats under, or the two would fork.
  const topicDomain = new Map<string, Domain>();
  for (const q of pool) {
    const key = normalizeTopic(q.topic);
    if (!topicDomain.has(key)) topicDomain.set(key, q.domain);
  }

  // Per-topic snapshots. A topic whose key has no domain match is dropped: it
  // cannot be attributed, so it must not silently inflate any domain's roll-up.
  const byTopic: TopicReadiness[] = [];
  for (const [key, stat] of Object.entries(progress.topicStats)) {
    if (!stat) continue;
    const normKey = normalizeTopic(key);
    const domain = topicDomain.get(normKey);
    if (domain === undefined) continue;
    const percent = percentOf(stat.correct, stat.seen);
    byTopic.push({
      key: normKey,
      label: stat.topic,
      domain,
      seen: stat.seen,
      correct: stat.correct,
      percent,
      band: readinessFromPercent(percent),
    });
  }

  // Per-domain roll-up over the attributed topics. Every one of the four domains
  // gets a row; a domain with no attributed topics is seen 0 / percent 0 / not
  // ready (no data is not readiness).
  const byDomain: DomainReadiness[] = DOMAINS.map((d) => {
    let seen = 0;
    let correct = 0;
    for (const t of byTopic) {
      if (t.domain !== d.id) continue;
      seen += t.seen;
      correct += t.correct;
    }
    const percent = percentOf(correct, seen);
    return {
      domain: d.id,
      seen,
      correct,
      percent,
      band: readinessFromPercent(percent),
      // Conservative AND: clears the bar AND over enough answers. Either gap
      // keeps it not ready, so a tiny sample never reads green.
      ready: percent >= EXAM_READY_PERCENT && seen >= MIN_DOMAIN_SAMPLE,
    };
  });

  // The single signal: ready only when EVERY domain is ready. This is the
  // all-domains gate, never an average — a weak or under-sampled domain blocks
  // green even when the others are strong, so the verdict matches the data.
  const overallReady = byDomain.every((d) => d.ready);

  return {
    byTopic,
    byDomain,
    overallReady,
    reason: buildReason(byDomain, overallReady),
  };
}

// A short human reason for the verdict. When ready, an affirmative; otherwise it
// names the FIRST blocking domain (in domain order) and whether it is blocked by
// too small a sample or by accuracy below the threshold — the under-sample case
// is reported first since "not enough data yet" is a different message than
// "answers, but not accurate enough".
function buildReason(byDomain: DomainReadiness[], overallReady: boolean): string {
  if (overallReady) {
    return `Every domain is at or above ${EXAM_READY_PERCENT}% over at least ${MIN_DOMAIN_SAMPLE} answered questions.`;
  }
  const blocker = byDomain.find((d) => !d.ready);
  if (!blocker) {
    // Unreachable when overallReady is false, but keep the function total.
    return "Not ready yet.";
  }
  const name = domainLabel(blocker.domain);
  if (blocker.seen < MIN_DOMAIN_SAMPLE) {
    return `Not enough data yet in ${name}: ${blocker.seen} of ${MIN_DOMAIN_SAMPLE} questions answered.`;
  }
  return `${blocker.percent}% in ${name}, need ${EXAM_READY_PERCENT}%.`;
}

// Domain display name from DOMAINS (falls back to a generic label).
function domainLabel(id: Domain): string {
  const meta = DOMAINS.find((d) => d.id === id);
  return meta ? meta.name : `Domain ${id}`;
}
