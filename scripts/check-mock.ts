// Behavior assertion for the replayable mock-exam engine foundation. It exercises
// the SAME buildMockExam / domainTargets / remainingSeconds / mockTrend /
// scoreAttempt the engine runs through (never a reimplementation), so a pass is a
// guarantee about shipped behavior. The draw, the timer decision, the seen-count
// arithmetic, and the trend filter are all pure, so they are testable without a
// browser — this is the gate the plan calls for in place of a unit runner the
// repo does not have.
//
// Assertions (all hard failures, collected and reported together):
//   draw-weights   buildMockExam over a pool comfortably larger than 65 returns
//                  exactly 65 with per-domain counts 16/19/22/8.
//   low-overlap    two consecutive seen-aware draws over the same large fresh
//                  pool (the first sitting fed back as seenCounts = 1) overlap
//                  far below a sitting while the fresh pool lasts — the LRU
//                  prefers never-seen, so the second draw barely revisits.
//   exhaustion     when a domain's fresh (count-0) pool is smaller than its
//                  target, the draw backfills from the fewest-seen and returns
//                  the FULL per-domain target, with no duplicate ids.
//   seen-bump      the pure count arithmetic recordMockSeen embodies: from {} a
//                  sitting's 65 ids once yields each at count 1, a second sitting
//                  increments only its ids, an empty list changes nothing.
//   auto-submit-decision  remainingSeconds is > 0 before the limit, exactly <= 0
//                  at now = startedAt + limit*1000, and negative past it; and
//                  scoreAttempt over a partial answer map scores the absent
//                  questions wrong (unanswered = wrong at auto-submit).
//   trend-data     mockTrend over a newest-first attempts array (the order
//                  recordAttempt writes) returns ONLY the exam attempts, oldest
//                  -> newest, mutating nothing.
//
// Math.random drives the shuffle inside buildMockExam, so the draw assertions are
// over counts and id-set overlap, never an exact sequence. The deterministic
// arithmetic checks (seen-bump, remainingSeconds, trend order) carry the precise
// guarantees.
//
// Mirrors check-drill.ts: a self-contained tsx CLI that collects every failure,
// prints a grouped report with counts, then exits 0 (clean) or 1 (any failure).
// Run via `npm run check:mock`.

import { buildMockExam, domainTargets, remainingSeconds } from "../src/lib/exam";
import { mockTrend, scoreAttempt } from "../src/lib/scoring";
import { EXAM } from "../src/lib/constants";
import type {
  AttemptAnswer,
  AttemptSummary,
  Domain,
  Question,
  QuizMode,
} from "../src/lib/types";

class Reporter {
  private failures = new Map<string, string[]>();

  fail(rule: string, detail: string): void {
    if (!this.failures.has(rule)) this.failures.set(rule, []);
    this.failures.get(rule)!.push(detail);
  }

  hasFailures(): boolean {
    return this.failures.size > 0;
  }

  print(): void {
    if (this.failures.size === 0) {
      console.log("\nPASS: the mock draw is weighted 16/19/22/8, repeat sittings barely overlap while the pool is fresh, exhaustion never returns short, the timer decision and unanswered=wrong hold, and the trend is exam-only oldest-to-newest.");
      return;
    }
    let total = 0;
    console.error("\nFAIL: mock engine behavior violations:");
    for (const [rule, items] of this.failures) {
      total += items.length;
      console.error(`  [${rule}] ${items.length}`);
      for (const d of items) console.error(`      - ${d}`);
    }
    console.error(`\n${total} violation(s) across ${this.failures.size} rule(s).`);
  }
}

// A minimal synthetic question: only the fields the draw and scoring read (id,
// domain, correct/options) matter, the rest satisfy the type. Extended from
// check-drill.ts's factory to take a domain so a four-domain pool can be built.
function q(id: string, domain: Domain): Question {
  return {
    id,
    domain,
    type: "single",
    topic: `topic-${domain}`,
    difficulty: "easy",
    stem: `stem ${id}`,
    options: [
      { id: "a", text: "right" },
      { id: "b", text: "wrong" },
    ],
    correct: ["a"],
    explanation: "because",
    reference: { label: "ref", url: "https://docs.aws.amazon.com/" },
    lastVerified: "2026-06-24",
  };
}

// Build a pool with `per` questions in each of the four domains, ids prefixed so
// the domain is recoverable and every id is globally unique.
function fourDomainPool(per: number): Question[] {
  const pool: Question[] = [];
  for (const d of [1, 2, 3, 4] as Domain[]) {
    for (let i = 0; i < per; i++) pool.push(q(`d${d}-${i}`, d));
  }
  return pool;
}

function countByDomain(questions: Question[]): Record<Domain, number> {
  const out = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<Domain, number>;
  for (const x of questions) out[x.domain] += 1;
  return out;
}

// The pure bump recordMockSeen embodies, lifted out so the check asserts the
// arithmetic without driving the global atom (recordMockSeen mutates $progress).
function bumpSeen(seen: Record<string, number>, ids: string[]): Record<string, number> {
  const next = { ...seen };
  for (const id of ids) next[id] = (next[id] ?? 0) + 1;
  return next;
}

// A representative recorded attempt, the shape recordAttempt writes.
function attempt(id: string, mode: QuizMode, percent: number, finishedAt: number): AttemptSummary {
  return { id, mode, domain: "all", percent, total: 65, finishedAt, durationSeconds: 600 };
}

function main(): void {
  const report = new Reporter();
  const targets = domainTargets(EXAM.questionCount); // { 1:16, 2:19, 3:22, 4:8 }

  // ---- draw-weights: 16/19/22/8 summing to 65 ----
  // 60 per domain is comfortably above every target, so the random draw fills
  // each domain to its exact target.
  const weightsPool = fourDomainPool(60);
  const drawn = buildMockExam(weightsPool, EXAM.questionCount);
  if (drawn.length !== EXAM.questionCount) {
    report.fail("draw-weights", `a mock should be ${EXAM.questionCount} questions, got ${drawn.length}`);
  }
  const drawnCounts = countByDomain(drawn);
  for (const d of [1, 2, 3, 4] as Domain[]) {
    if (drawnCounts[d] !== targets[d]) {
      report.fail("draw-weights", `domain ${d} should draw ${targets[d]}, got ${drawnCounts[d]}`);
    }
  }
  if (new Set(drawn.map((x) => x.id)).size !== drawn.length) {
    report.fail("draw-weights", `a single draw must not duplicate a question`);
  }

  // ---- low-overlap: two consecutive fresh-pool draws barely intersect ----
  // 60 per domain comfortably exceeds 2x every target (max target 22, 2x = 44 <
  // 60), so after the first sitting's per-domain pick the count-0 remainder still
  // exceeds each target. With seenCounts = 1 on the first 65, the LRU floats those
  // never-seen remainders ahead, so the second draw should revisit almost none of
  // the first. The bound is well under half a sitting; the fresh-pool math makes
  // the real intersection ~0, so a regression that ignores seenCounts (and so
  // re-collides ~half) trips this immediately.
  const overlapPool = fourDomainPool(60);
  const first = buildMockExam(overlapPool, EXAM.questionCount);
  const firstIds = new Set(first.map((x) => x.id));
  const seenAfterFirst = bumpSeen({}, [...firstIds]);
  const second = buildMockExam(overlapPool, EXAM.questionCount, seenAfterFirst);
  const secondIds = second.map((x) => x.id);
  const overlap = secondIds.filter((id) => firstIds.has(id)).length;
  const OVERLAP_BOUND = 5; // generous; the fresh-pool math makes it 0 in practice
  if (overlap > OVERLAP_BOUND) {
    report.fail("low-overlap", `two consecutive fresh-pool draws should overlap <= ${OVERLAP_BOUND}, got ${overlap} (LRU not preferring never-seen?)`);
  }
  if (second.length !== EXAM.questionCount) {
    report.fail("low-overlap", `the second sitting must still be a full ${EXAM.questionCount}, got ${second.length}`);
  }

  // ---- exhaustion: a short fresh pool still fills the full per-domain target ----
  // Domain 4's target is 8. Give it 10 questions total but mark 5 as seen, so the
  // fresh (count-0) pool is 5 < 8: the draw must backfill from the 5 fewest-seen
  // and still return 8, never short, never a duplicate. The other domains have
  // ample fresh supply.
  const exhaustPool: Question[] = [
    ...Array.from({ length: 60 }, (_, i) => q(`d1-${i}`, 1)),
    ...Array.from({ length: 60 }, (_, i) => q(`d2-${i}`, 2)),
    ...Array.from({ length: 60 }, (_, i) => q(`d3-${i}`, 3)),
    ...Array.from({ length: 10 }, (_, i) => q(`d4-${i}`, 4)),
  ];
  // Five of domain 4's ten are already seen, shrinking its fresh pool below 8.
  const exhaustSeen = bumpSeen({}, ["d4-0", "d4-1", "d4-2", "d4-3", "d4-4"]);
  const exhausted = buildMockExam(exhaustPool, EXAM.questionCount, exhaustSeen);
  const exhaustedCounts = countByDomain(exhausted);
  if (exhaustedCounts[4] !== targets[4]) {
    report.fail("exhaustion", `domain 4 should still return its full target ${targets[4]} from a short fresh pool, got ${exhaustedCounts[4]}`);
  }
  if (exhausted.length !== EXAM.questionCount) {
    report.fail("exhaustion", `the sitting must still total ${EXAM.questionCount} despite a short fresh pool, got ${exhausted.length}`);
  }
  if (new Set(exhausted.map((x) => x.id)).size !== exhausted.length) {
    report.fail("exhaustion", `a draw that backfills from seen questions must not duplicate an id`);
  }

  // ---- seen-bump: the once-per-finished-sitting count arithmetic ----
  const sittingA = first.map((x) => x.id); // a real 65-id sitting
  const afterA = bumpSeen({}, sittingA);
  if (Object.keys(afterA).length !== sittingA.length) {
    report.fail("seen-bump", `a first sitting should record ${sittingA.length} distinct seen ids, got ${Object.keys(afterA).length}`);
  }
  if (!sittingA.every((id) => afterA[id] === 1)) {
    report.fail("seen-bump", `every id in the first sitting should be at count 1 after one bump`);
  }
  // A second sitting that shares some ids with the first increments only those.
  const sittingB = [sittingA[0], sittingA[1], "fresh-x", "fresh-y"];
  const afterB = bumpSeen(afterA, sittingB);
  if (afterB[sittingA[0]] !== 2 || afterB[sittingA[1]] !== 2) {
    report.fail("seen-bump", `an id drawn in two finished sittings should reach count 2`);
  }
  if (afterB[sittingA[2]] !== 1) {
    report.fail("seen-bump", `an id in only the first sitting should stay at count 1 after the second`);
  }
  if (afterB["fresh-x"] !== 1 || afterB["fresh-y"] !== 1) {
    report.fail("seen-bump", `a newly-drawn id should start at count 1`);
  }
  // An empty sitting is a no-op (the recordMockSeen early-return).
  const afterEmpty = bumpSeen(afterB, []);
  if (Object.keys(afterEmpty).length !== Object.keys(afterB).length) {
    report.fail("seen-bump", `an empty sitting must not change any count`);
  }

  // ---- auto-submit-decision: remainingSeconds boundary + unanswered = wrong ----
  const limit = EXAM.timeLimitSeconds;
  const startedAt = 1_000_000; // arbitrary epoch ms
  // Before the limit: strictly positive.
  if (!(remainingSeconds(limit, startedAt, startedAt + (limit - 1) * 1000) > 0)) {
    report.fail("auto-submit-decision", `remaining should be > 0 one second before the limit`);
  }
  // Exactly at the limit: <= 0 (the auto-submit trigger), and precisely 0 here.
  const atLimit = remainingSeconds(limit, startedAt, startedAt + limit * 1000);
  if (atLimit > 0) {
    report.fail("auto-submit-decision", `remaining should be <= 0 at exactly startedAt + limit, got ${atLimit}`);
  }
  if (atLimit !== 0) {
    report.fail("auto-submit-decision", `remaining should be exactly 0 at the limit boundary, got ${atLimit}`);
  }
  // Past the limit: negative.
  if (!(remainingSeconds(limit, startedAt, startedAt + (limit + 5) * 1000) < 0)) {
    report.fail("auto-submit-decision", `remaining should go negative past the limit`);
  }
  // Unanswered = wrong: score three single-answer questions, answer only one
  // correctly, leave the other two absent. percent must reflect 1/3 correct.
  const submitQs = [q("s1", 1), q("s2", 1), q("s3", 1)];
  const partial: AttemptAnswer[] = [{ questionId: "s1", selected: ["a"], flagged: false }];
  const scored = scoreAttempt(submitQs, partial, "exam", 600);
  if (scored.correct !== 1) {
    report.fail("auto-submit-decision", `only the one answered-correct question should count; got ${scored.correct} correct`);
  }
  if (scored.percent !== Math.round((1 / 3) * 100)) {
    report.fail("auto-submit-decision", `unanswered questions must score wrong (expected ${Math.round((1 / 3) * 100)}%, got ${scored.percent}%)`);
  }

  // ---- trend-data: exam-only, oldest -> newest, input unmutated ----
  // recordAttempt stores newest-first, so the array here is newest-first across a
  // mix of modes. mockTrend must drop the non-exam attempts and reverse to oldest
  // -> newest.
  const newestFirst: AttemptSummary[] = [
    attempt("exam-3", "exam", 80, 300),
    attempt("review-1", "review", 50, 250),
    attempt("exam-2", "exam", 70, 200),
    attempt("practice-1", "practice", 90, 150),
    attempt("exam-1", "exam", 60, 100),
  ];
  const snapshot = JSON.parse(JSON.stringify(newestFirst));
  const trend = mockTrend(newestFirst);
  if (!trend.every((a) => a.mode === "exam")) {
    report.fail("trend-data", `the trend must contain only exam attempts; got modes [${trend.map((a) => a.mode).join(", ")}]`);
  }
  const trendIds = trend.map((a) => a.id);
  if (trendIds.join(",") !== "exam-1,exam-2,exam-3") {
    report.fail("trend-data", `the trend must be oldest -> newest [exam-1, exam-2, exam-3], got [${trendIds.join(", ")}]`);
  }
  if (JSON.stringify(newestFirst) !== JSON.stringify(snapshot)) {
    report.fail("trend-data", `mockTrend must not mutate its input array`);
  }

  console.log("Mock engine: exercised buildMockExam / remainingSeconds / scoreAttempt / mockTrend against synthetic pools, seen maps, clocks, and attempts.");
  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
