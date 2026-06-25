// Behavior assertion for the spaced-repetition scheduler. It exercises the SAME
// nextEntry / orderReviewQueue / MAX_BOX the store and the review engine build on
// (never a reimplementation), so a pass is a guarantee about shipped behavior.
// The scheduler is pure arithmetic over a clock passed in, so it is testable
// without a browser — this is the gate the plan calls for in place of a unit
// runner the repo does not have. A fixed `NOW` pins the clock so every due
// computation is exact, not wall-time-dependent.
//
// Assertions (all hard failures, collected and reported together):
//   promote        a correct grade from undefined lands at box 1; repeated
//                  correct grades climb and cap at MAX_BOX (never past the
//                  interval table); each due advances to the box's interval.
//   reset          a wrong grade from any box drops to box 0 with due === NOW
//                  (box 0 is due immediately — the just-missed band).
//   due-first      orderReviewQueue returns soonest-due first, then lowest box,
//                  then oldest lastReviewed.
//   never-lose-id  the queue over a set including never-scheduled ids is a
//                  permutation of the input: same length, same membership (Set
//                  equality), no id dropped or duplicated — a flagged/missed
//                  question is always served.
//
// Mirrors check-migration.ts / check-drill.ts: a self-contained tsx CLI that
// collects every failure, prints a grouped report with counts, then exits 0
// (clean) or 1 (any failure). Run via `npm run check:review`.

import {
  MAX_BOX,
  REVIEW_INTERVALS_MS,
  nextEntry,
  orderReviewQueue,
} from "../src/lib/review";
import type { ReviewEntry } from "../src/lib/types";

// A fixed clock so every `due` is exact and reproducible.
const NOW = 1_700_000_000_000;

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
      console.log("\nPASS: a correct review promotes (capped at MAX_BOX), a wrong review resets to box 0 due now, the queue orders due -> box -> lastReviewed, and no id is ever lost.");
      return;
    }
    let total = 0;
    console.error("\nFAIL: review-schedule behavior violations:");
    for (const [rule, items] of this.failures) {
      total += items.length;
      console.error(`  [${rule}] ${items.length}`);
      for (const d of items) console.error(`      - ${d}`);
    }
    console.error(`\n${total} violation(s) across ${this.failures.size} rule(s).`);
  }
}

// Set-equality over two id collections: same size, same membership. Used by the
// never-lose-id rule to assert the ordering is a true permutation of its input.
function sameMembers(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size !== a.length) return false; // input had a duplicate; guard the test itself
  if (sa.size !== sb.size) return false;
  for (const id of sa) if (!sb.has(id)) return false;
  return true;
}

function main(): void {
  const report = new Reporter();

  // ---- promote: correct climbs box by box and caps at MAX_BOX ----
  const first = nextEntry(undefined, true, NOW);
  if (first.box !== 1) {
    report.fail("promote", `a first correct grade should land at box 1, got ${first.box}`);
  }
  if (first.due !== NOW + REVIEW_INTERVALS_MS[1]) {
    report.fail("promote", `box 1 due should be NOW + interval[1], got ${first.due - NOW} after NOW`);
  }
  if (first.lastReviewed !== NOW) {
    report.fail("promote", `lastReviewed should stamp NOW, got ${first.lastReviewed}`);
  }
  // Climb from box 1 all the way up; every step must increment until the cap.
  let entry: ReviewEntry = first;
  for (let step = 2; step <= MAX_BOX; step++) {
    entry = nextEntry(entry, true, NOW);
    if (entry.box !== step) {
      report.fail("promote", `correct grade ${step} should reach box ${step}, got ${entry.box}`);
    }
    if (entry.due !== NOW + REVIEW_INTERVALS_MS[entry.box]) {
      report.fail("promote", `box ${entry.box} due should match its interval`);
    }
  }
  // At the cap, another correct grade must STAY at MAX_BOX (never index past the table).
  const capped = nextEntry({ box: MAX_BOX, due: 0, lastReviewed: 0 }, true, NOW);
  if (capped.box !== MAX_BOX) {
    report.fail("promote", `a correct grade at MAX_BOX should stay at ${MAX_BOX}, got ${capped.box}`);
  }
  if (capped.due !== NOW + REVIEW_INTERVALS_MS[MAX_BOX]) {
    report.fail("promote", `MAX_BOX due should be NOW + interval[MAX_BOX]`);
  }

  // ---- reset: a wrong grade from any box drops to box 0, due now ----
  for (const fromBox of [0, 1, 2, MAX_BOX]) {
    const reset = nextEntry({ box: fromBox, due: NOW + 999, lastReviewed: 0 }, false, NOW);
    if (reset.box !== 0) {
      report.fail("reset", `a wrong grade from box ${fromBox} should reset to box 0, got ${reset.box}`);
    }
    if (reset.due !== NOW) {
      report.fail("reset", `box 0 should be due now (NOW + interval[0]=0), got ${reset.due - NOW} after NOW`);
    }
  }

  // ---- due-first: order by due, then box, then lastReviewed ----
  // overdue (due in the past) sorts before due-later; among equal due, lowest
  // box first; among equal due+box, oldest lastReviewed first.
  const schedule: Record<string, ReviewEntry> = {
    overdue: { box: 2, due: NOW - 10_000, lastReviewed: NOW - 10_000 },
    soon: { box: 0, due: NOW + 1_000, lastReviewed: NOW },
    later: { box: 3, due: NOW + 50_000, lastReviewed: NOW },
    // same due as `soon`, but a higher box => `soon` (lower box) must come first
    soonHighBox: { box: 2, due: NOW + 1_000, lastReviewed: NOW },
    // same due+box as `soon`, but touched longer ago => sorts before `soon`
    soonOld: { box: 0, due: NOW + 1_000, lastReviewed: NOW - 5_000 },
  };
  const ordered = orderReviewQueue(
    ["later", "soon", "overdue", "soonHighBox", "soonOld"],
    schedule,
    NOW,
  );
  const expected = ["overdue", "soonOld", "soon", "soonHighBox", "later"];
  if (ordered.join(",") !== expected.join(",")) {
    report.fail("due-first", `expected [${expected.join(", ")}], got [${ordered.join(", ")}]`);
  }

  // ---- never-lose-id: a never-scheduled id is kept and sorts as box 0 / due 0 ----
  // `fresh` has no schedule entry: it must be treated as the most overdue/weakest
  // (due 0) and still appear in the output. The result must be a permutation.
  const ids = ["overdue", "fresh", "soon", "later"];
  const withFresh = orderReviewQueue(ids, schedule, NOW);
  if (!sameMembers(ids, withFresh)) {
    report.fail("never-lose-id", `ordering must be a permutation of the input; input [${ids.join(", ")}], got [${withFresh.join(", ")}]`);
  }
  if (withFresh[0] !== "fresh") {
    report.fail("never-lose-id", `a never-scheduled id (due 0) should sort first as most overdue, got [${withFresh.join(", ")}]`);
  }
  // An empty queue is a clean empty permutation, never a crash.
  if (orderReviewQueue([], schedule, NOW).length !== 0) {
    report.fail("never-lose-id", `an empty id list should order to an empty queue`);
  }

  console.log(`Review schedule: exercised nextEntry / orderReviewQueue / MAX_BOX (=${MAX_BOX}) against a fixed clock.`);
  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
