// Behavior assertion for the conservative readiness signal. It exercises the SAME
// computeReadiness / EXAM_READY_PERCENT / MIN_DOMAIN_SAMPLE the readiness
// dashboard builds on (never a reimplementation), so a pass is a guarantee about
// the shipped honesty rules. The signal is pure over a progress slice and a
// question pool, so it is testable without a browser — this is the gate the plan
// calls for in place of a unit runner the repo does not have. A small synthetic
// pool covers all four domains with distinct topics so the topic -> domain join
// is exercised end to end.
//
// Assertions (all hard failures, collected and reported together):
//   per-domain        a domain's percent equals round(correct/seen*100) summed
//                     over the topics that resolve to it (the join + roll-up math).
//   under-sample      a domain at 100% but with seen < MIN_DOMAIN_SAMPLE has
//                     ready === false and is NOT counted ready — 100% of a handful
//                     is noise, not readiness (the under-sample guard).
//   all-domains-gate  overallReady is false when any single domain sits below
//                     EXAM_READY_PERCENT even though the other three are strong
//                     and well-sampled (a weak domain blocks the green signal).
//   not-averaged      with three domains strong and one at ~40%, where BOTH the
//                     simple and the seen-weighted average clear the bar,
//                     overallReady is STILL false — proving it is the all-domains
//                     gate, never an average that would hide the weak domain.
//   all-ready         every domain >= EXAM_READY_PERCENT over >= MIN_DOMAIN_SAMPLE
//                     yields overallReady true (the only path to green).
//
// Mirrors check-review-schedule.ts / check-migration.ts: a self-contained tsx CLI
// that collects every failure, prints a grouped report with counts, then exits 0
// (clean) or 1 (any failure). Run via `npm run check:readiness`.

import {
  EXAM_READY_PERCENT,
  MIN_DOMAIN_SAMPLE,
  computeReadiness,
} from "../src/lib/readiness";
import type { Domain, ProgressState, Question, TopicStat } from "../src/lib/types";

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
      console.log("\nPASS: per-domain percent matches the stats, an under-sampled domain never reads ready, a single weak domain blocks the all-domains gate (it is not an average), and only every-domain-strong-over-min-sample reads ready.");
      return;
    }
    let total = 0;
    console.error("\nFAIL: readiness behavior violations:");
    for (const [rule, items] of this.failures) {
      total += items.length;
      console.error(`  [${rule}] ${items.length}`);
      for (const d of items) console.error(`      - ${d}`);
    }
    console.error(`\n${total} violation(s) across ${this.failures.size} rule(s).`);
  }
}

// A synthetic pool: one distinct topic per domain so every topicStats key joins
// to exactly one domain. The readiness module reads only id/domain/topic, so the
// other Question fields are filled with inert placeholders to satisfy the type.
function poolQuestion(id: string, domain: Domain, topic: string): Question {
  return {
    id,
    domain,
    type: "single",
    topic,
    difficulty: "easy",
    stem: "",
    options: [],
    correct: [],
    explanation: "",
    reference: { label: "", url: "" },
    lastVerified: "2026-06-24",
  };
}

// The four-domain pool, one topic each (A=>1, B=>2, C=>3, D=>4).
const POOL: Question[] = [
  poolQuestion("q1", 1, "A"),
  poolQuestion("q2", 2, "B"),
  poolQuestion("q3", 3, "C"),
  poolQuestion("q4", 4, "D"),
];

// Build a topicStats record from per-topic [seen, correct] pairs keyed by the
// pool's topic labels, so a case reads like the domain table it models.
function stats(entries: Record<string, [number, number]>): Pick<ProgressState, "topicStats"> {
  const topicStats: Record<string, TopicStat> = {};
  for (const [topic, [seen, correct]] of Object.entries(entries)) {
    topicStats[topic] = { topic, seen, correct };
  }
  return { topicStats };
}

function main(): void {
  const report = new Reporter();

  // ---- per-domain: percent equals round(correct/seen*100) over the topic ----
  // Domain 2 has 17 of 20 correct => 85; assert the roll-up math and the join.
  const perDomain = computeReadiness(
    stats({ A: [20, 18], B: [20, 17], C: [20, 19], D: [20, 16] }),
    POOL,
  );
  const expectPercent: Record<number, number> = { 1: 90, 2: 85, 3: 95, 4: 80 };
  for (const d of perDomain.byDomain) {
    const want = expectPercent[d.domain];
    if (d.percent !== want) {
      report.fail("per-domain", `domain ${d.domain} percent should be ${want} (round(correct/seen*100)), got ${d.percent}`);
    }
  }

  // ---- under-sample: 100% but below MIN_DOMAIN_SAMPLE is NOT ready ----
  // Domain 1 is perfect but on too few answers; it must read not-ready, and that
  // alone must block the overall signal even though the others are strong.
  const fewSeen = Math.max(1, MIN_DOMAIN_SAMPLE - 1);
  const underSample = computeReadiness(
    stats({ A: [fewSeen, fewSeen], B: [25, 24], C: [25, 24], D: [25, 24] }),
    POOL,
  );
  const d1 = underSample.byDomain.find((d) => d.domain === 1);
  if (!d1) {
    report.fail("under-sample", "domain 1 missing from the report");
  } else {
    if (d1.percent !== 100) {
      report.fail("under-sample", `domain 1 should be at 100% in this case, got ${d1.percent}`);
    }
    if (d1.ready !== false) {
      report.fail("under-sample", `domain 1 at 100% but seen ${d1.seen} (< ${MIN_DOMAIN_SAMPLE}) must NOT be ready`);
    }
  }
  if (underSample.overallReady !== false) {
    report.fail("under-sample", "an under-sampled domain must block overallReady even at 100%");
  }

  // ---- all-domains-gate: one domain below threshold blocks, others strong ----
  // Three domains well over the bar and well-sampled, one at 50% over 30. The
  // single weak domain must force overallReady false.
  const gate = computeReadiness(
    stats({ A: [30, 29], B: [30, 28], C: [30, 29], D: [30, 15] }),
    POOL,
  );
  const gateD4 = gate.byDomain.find((d) => d.domain === 4);
  if (gateD4 && gateD4.percent >= EXAM_READY_PERCENT) {
    report.fail("all-domains-gate", `test setup: domain 4 should be below ${EXAM_READY_PERCENT}%, got ${gateD4.percent}`);
  }
  if (gate.overallReady !== false) {
    report.fail("all-domains-gate", `overallReady must be false when one domain is below ${EXAM_READY_PERCENT}% though the others are strong`);
  }

  // ---- not-averaged: averages clear the bar but one domain sits at ~40% ----
  // Three domains at 100% over 30 and one at 40% over 30. The simple average is
  // (100+100+100+40)/4 = 85, and the seen-weighted average is also 85 (equal
  // samples) — both AT the bar. An averaging implementation would read this ready;
  // the all-domains gate must still read it NOT ready because one domain is at 40%.
  const weakDomainStats = stats({ A: [30, 30], B: [30, 30], C: [30, 30], D: [30, 12] });
  const notAveraged = computeReadiness(weakDomainStats, POOL);
  // Prove the averages really do clear the bar, so the assertion is meaningful
  // (not vacuously failing because the averages were below it anyway).
  const percents = notAveraged.byDomain.map((d) => d.percent);
  const simpleAvg = percents.reduce((s, p) => s + p, 0) / percents.length;
  const totalSeen = notAveraged.byDomain.reduce((s, d) => s + d.seen, 0);
  const totalCorrect = notAveraged.byDomain.reduce((s, d) => s + d.correct, 0);
  const weightedAvg = Math.round((totalCorrect / totalSeen) * 100);
  if (simpleAvg < EXAM_READY_PERCENT || weightedAvg < EXAM_READY_PERCENT) {
    report.fail("not-averaged", `test setup: both averages must clear ${EXAM_READY_PERCENT}% so the property is non-trivial (simple=${simpleAvg}, weighted=${weightedAvg})`);
  }
  if (notAveraged.overallReady !== false) {
    report.fail("not-averaged", `overallReady must be false: a 40% domain blocks readiness even though both the simple (${simpleAvg}) and weighted (${weightedAvg}) averages clear ${EXAM_READY_PERCENT}% — the signal is the all-domains gate, not an average`);
  }
  // And the weak domain itself must be the one reported as not ready.
  const weak = notAveraged.byDomain.find((d) => d.domain === 4);
  if (weak && weak.ready !== false) {
    report.fail("not-averaged", `the 40% domain must be the not-ready one, got ready=${weak.ready} at ${weak.percent}%`);
  }

  // ---- all-ready: every domain strong over min sample => ready ----
  // The only path to green: all four clear EXAM_READY_PERCENT over MIN_DOMAIN_SAMPLE.
  const allReady = computeReadiness(
    stats({ A: [25, 24], B: [25, 24], C: [25, 24], D: [25, 24] }),
    POOL,
  );
  for (const d of allReady.byDomain) {
    if (!d.ready) {
      report.fail("all-ready", `domain ${d.domain} should be ready at ${d.percent}% over ${d.seen} answers`);
    }
  }
  if (allReady.overallReady !== true) {
    report.fail("all-ready", "overallReady must be true when every domain clears the threshold over the minimum sample");
  }

  console.log(`Readiness: exercised computeReadiness against a four-domain pool (EXAM_READY_PERCENT=${EXAM_READY_PERCENT}, MIN_DOMAIN_SAMPLE=${MIN_DOMAIN_SAMPLE}).`);
  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
