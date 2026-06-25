import type { Domain, ProgressState, Question } from "./types";
import { DOMAINS, EXAM } from "./constants";
import { normalizeTopic, rankWeakTopics } from "./topics";

// Re-exported so the drill builder and the assertion script reach the ranker
// through the exam module (the documented assembly contract) while the ranking
// primitive itself stays in the store-free topics module.
export { rankWeakTopics } from "./topics";
export type { WeakTopic, WeakTopicOptions } from "./topics";

// Fisher-Yates shuffle on a copy. Caller's array is not mutated.
export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function byDomain(pool: readonly Question[]): Map<Domain, Question[]> {
  const map = new Map<Domain, Question[]>();
  for (const d of DOMAINS) map.set(d.id, []);
  for (const q of pool) map.get(q.domain)?.push(q);
  return map;
}

// Translate the domain weightings into integer question counts that sum to total.
// Largest-remainder rounding keeps the split faithful to the real exam mix.
export function domainTargets(total: number): Record<Domain, number> {
  const raw = DOMAINS.map((d) => ({ id: d.id, exact: (d.weight / 100) * total }));
  const floored = raw.map((r) => ({ ...r, n: Math.floor(r.exact), rem: r.exact - Math.floor(r.exact) }));
  let assigned = floored.reduce((s, r) => s + r.n, 0);
  floored.sort((a, b) => b.rem - a.rem);
  let i = 0;
  while (assigned < total) {
    floored[i % floored.length].n += 1;
    assigned += 1;
    i += 1;
  }
  const result = {} as Record<Domain, number>;
  for (const r of floored) result[r.id] = r.n;
  return result;
}

// Pick one domain's slice of a mock. The bucket is shuffled FIRST so every
// sitting varies, then, when seen-counts are supplied, a STABLE sort by
// times-seen ascending floats never-seen (count 0) questions ahead of any seen
// one — the low-overlap guarantee while the fresh pool lasts. Because the sort
// is stable (ES2019+), equal-seen questions keep their random order, so two
// sittings over the same fully-seen tier still differ. The slice always takes
// `target`, so a short fresh pool is backfilled by the next-fewest-seen and the
// per-domain target is never returned short.
function pickForDomain(
  bucket: readonly Question[],
  target: number,
  seenCounts?: Record<string, number>,
): Question[] {
  const randomized = shuffle(bucket);
  if (seenCounts) {
    randomized.sort((a, b) => (seenCounts[a.id] ?? 0) - (seenCounts[b.id] ?? 0));
  }
  return randomized.slice(0, target);
}

// Build a full mock that mirrors the real exam: questionCount items distributed
// across domains by weight, then shuffled into one sequence. When a domain pool
// is short, all of its questions are used.
//
// With no seenCounts the per-domain draw is purely random (back-compat for the
// existing 2-arg callers). When seenCounts is supplied (question id -> times
// drawn in a finished mock), each domain draws least-recently-used: never-seen
// questions first, then fewest-seen, ties random — so repeat sittings overlap
// little while fresh questions remain, and the target is always met.
export function buildMockExam(
  pool: readonly Question[],
  total: number = EXAM.questionCount,
  seenCounts?: Record<string, number>,
): Question[] {
  const targets = domainTargets(total);
  const buckets = byDomain(pool);
  const picked: Question[] = [];
  for (const d of DOMAINS) {
    picked.push(...pickForDomain(buckets.get(d.id) ?? [], targets[d.id], seenCounts));
  }
  return shuffle(picked);
}

// Remaining seconds in a timed mock, derived from a start timestamp and an
// injected clock (no Date.now() inside) so the auto-submit decision is pure and
// testable. Goes <= 0 once now reaches startedAt + the limit, and can go
// negative — the caller treats <= 0 as time-up. Floor the elapsed so a partial
// second never reads as a whole second already gone.
export function remainingSeconds(
  timeLimitSeconds: number,
  startedAt: number,
  now: number,
): number {
  return timeLimitSeconds - Math.floor((now - startedAt) / 1000);
}

// Build a focused quiz for one domain.
export function buildDomainQuiz(
  pool: readonly Question[],
  domain: Domain,
  count: number,
): Question[] {
  const inDomain = pool.filter((q) => q.domain === domain);
  return shuffle(inDomain).slice(0, count);
}

// Build a review set from a list of question ids (flagged or previously missed).
export function buildReviewSet(pool: readonly Question[], ids: readonly string[]): Question[] {
  const wanted = new Set(ids);
  return pool.filter((q) => wanted.has(q.id));
}

// ---- Adaptive weak-area drill ----

// Attempts a topic needs before the drill will call it weak. The bank's median
// is ~2 questions/topic, so a low floor keeps real topics eligible while still
// rejecting a single-answer fluke from steering the whole drill.
export const DRILL_MIN_SEEN = 2;

// How many of the weakest topics the drill draws from. A small band keeps the
// drill focused on genuine weak spots rather than diluting across the bank.
export const DRILL_TOPIC_COUNT = 5;

// The weakest topics chosen for a drill, in rank order, by their display label.
// Surfaced so the page/engine can name them ("targeting your weakest topics: …")
// — the transparency requirement. Empty on a cold-start (weighted-draw) drill.
export interface DrillResult {
  questions: Question[];
  weakTopics: string[];
}

// Assemble an adaptive drill from the learner's weakest topics.
//
// 1. Rank topics by accuracy ascending (seen >= DRILL_MIN_SEEN guard), take the
//    bottom DRILL_TOPIC_COUNT — the weak set.
// 2. Gather pool questions whose normalized topic is in that set, putting
//    previously-missed ids (incorrectQuestions) first so the drill revisits
//    known gaps before fresh questions in the same weak topics.
// 3. shuffle, then slice to `count`.
// 4. If the weak set yields too few (strong learner / thin history), backfill
//    from the rest of the pool with a random draw.
// 5. Cold start (no qualifying weak topic): fall back to a mixed shuffle draw
//    over the whole pool.
//
// The result length is min(count, pool.length) and is NEVER 0 for a non-empty
// pool (the drill must never render a blank set). Order within
// the drill is random, so callers assert on membership/size/skew, not order.
export function buildDrill(
  pool: readonly Question[],
  progress: Pick<ProgressState, "topicStats" | "incorrectQuestions">,
  count: number,
): DrillResult {
  const target = Math.min(count, pool.length);
  if (target <= 0) return { questions: [], weakTopics: [] };

  const ranked = rankWeakTopics(progress.topicStats ?? {}, {
    minSeen: DRILL_MIN_SEEN,
  });
  const weak = ranked.slice(0, DRILL_TOPIC_COUNT);
  const weakKeys = new Set(weak.map((t) => t.key));

  // Questions whose topic is in the weak set, missed ones first so the drill
  // leads with the gaps the learner has already tripped on.
  const missedIds = new Set(progress.incorrectQuestions ?? []);
  const weakPool = pool.filter((q) => weakKeys.has(normalizeTopic(q.topic)));
  const missedWeak = shuffle(weakPool.filter((q) => missedIds.has(q.id)));
  const freshWeak = shuffle(weakPool.filter((q) => !missedIds.has(q.id)));

  const picked: Question[] = [];
  const used = new Set<string>();
  const take = (qs: readonly Question[]): void => {
    for (const q of qs) {
      if (picked.length >= target) break;
      if (used.has(q.id)) continue;
      used.add(q.id);
      picked.push(q);
    }
  };

  take(missedWeak);
  take(freshWeak);

  // Backfill from the rest of the pool (cold start lands here for the whole
  // draw, since weakPool is empty when no topic qualifies) so the result is
  // never short of `target` while the pool can supply it.
  if (picked.length < target) {
    take(shuffle(pool.filter((q) => !used.has(q.id))));
  }

  return { questions: picked, weakTopics: weak.map((t) => t.label) };
}
