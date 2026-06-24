// Correct-answer-position uniformity check for the render-time option shuffle.
// It exercises the SAME orderedOptions helper the UI renders through (never a
// reimplementation), so a pass is a guarantee about shipped behavior, not a
// parallel mock. Two assertions, both hard failures:
//
//   permutation   every produced ordering is a valid permutation of the
//                 question's options: same id set, no duplicate, no drop.
//   uniformity    for each single-answer question, the render index of the
//                 correct option is approximately uniform across many samples.
//                 Each of the N positions must land within a tolerance band of
//                 1/N, so the authored "correct first" convention cannot leak a
//                 detectable position bias into what the learner sees.
//
// Multi-answer questions have no single correct position, so they are checked
// for permutation validity only and excluded from the position tally.
//
// Math.random is correct here: this is statistical fairness, not security. Do
// not swap to crypto under a misread of the requirement (fairness != secrecy).
//
// Mirrors lint-content.ts: a self-contained tsx CLI that collects every failure,
// prints a grouped report with counts, then exits 0 (clean) or 1 (any failure).
// Run via `npm run lint:shuffle`.

import { orderedOptions } from "../src/lib/options";
import { loadQuestions } from "./content-lib";
import type { Question } from "../src/lib/types";

// Samples per single-answer question. Large enough that a fair shuffle's
// per-position frequency concentrates tightly around 1/N (the standard error of
// a proportion at p=1/N is sqrt(p(1-p)/n); at n=2000 and the smallest N=2 that
// is ~1.1pp, well inside the tolerance below), while staying fast over the bank.
const SAMPLES = 2000;

// Allowed absolute deviation of any position's observed frequency from the ideal
// 1/N. At 2000 samples this sits several standard errors above the sampling
// noise for the option counts this exam uses (N is 3-5 in practice, N=2 at the
// extreme), so a fair shuffle passes comfortably and a real bias (e.g. correct
// always first => one position near 1.0) fails hard. A flat bound is chosen over
// a chi-square test for a legible, single-number threshold.
const TOLERANCE = 0.05;

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
      console.log("\nPASS: every ordering is a valid permutation and the correct-option position is uniform within tolerance.");
      return;
    }
    let total = 0;
    console.error("\nFAIL: shuffle integrity violations:");
    for (const [rule, items] of this.failures) {
      total += items.length;
      console.error(`  [${rule}] ${items.length}`);
      for (const d of items.slice(0, 50)) console.error(`      - ${d}`);
      if (items.length > 50) console.error(`      ... and ${items.length - 50} more`);
    }
    console.error(`\n${total} violation(s) across ${this.failures.size} rule(s).`);
  }
}

// A produced ordering is valid when it is the same multiset of ids as the
// question's options: same length, same id set, no duplicate, no drop.
function isValidPermutation(question: Question, orderedIds: string[]): boolean {
  if (orderedIds.length !== question.options.length) return false;
  const want = new Set(question.options.map((o) => o.id));
  const seen = new Set<string>();
  for (const id of orderedIds) {
    if (!want.has(id)) return false; // foreign or dropped-then-padded id
    if (seen.has(id)) return false; // duplicate
    seen.add(id);
  }
  return seen.size === want.size;
}

function main(): void {
  const questions = loadQuestions();
  const report = new Reporter();

  let singleChecked = 0;
  let multiChecked = 0;

  for (const q of questions) {
    const n = q.options.length;
    const isSingle = q.type === "single" && q.correct.length === 1;
    const correctId = isSingle ? q.correct[0] : null;

    // Tally the correct option's render index across samples (single only).
    const positionCounts = new Array<number>(n).fill(0);
    let permutationBroken = false;

    for (let s = 0; s < SAMPLES; s++) {
      // A distinct instanceKey per sample documents per-instance ordering and
      // guards against any accidental memoization in the helper.
      const order = orderedOptions(q, `${q.id}#${s}`).map((o) => o.id);

      if (!permutationBroken && !isValidPermutation(q, order)) {
        report.fail(
          "permutation",
          `${q.id}: produced an ordering that is not a permutation of its options`,
        );
        permutationBroken = true; // report once per question, keep sampling cheap
      }

      if (correctId !== null) {
        const idx = order.indexOf(correctId);
        if (idx >= 0) positionCounts[idx] += 1;
      }
    }

    if (correctId !== null) {
      singleChecked += 1;
      const ideal = 1 / n;
      for (let i = 0; i < n; i++) {
        const freq = positionCounts[i] / SAMPLES;
        if (Math.abs(freq - ideal) > TOLERANCE) {
          report.fail(
            "uniformity",
            `${q.id}: correct option lands at position ${i} ${(freq * 100).toFixed(1)}% of the time (ideal ${(ideal * 100).toFixed(1)}%, tolerance +/-${(TOLERANCE * 100).toFixed(0)}pp)`,
          );
        }
      }
    } else {
      multiChecked += 1;
    }
  }

  console.log(
    `Shuffle uniformity: ${questions.length} questions (${singleChecked} single-answer position-checked, ${multiChecked} multi-answer permutation-only), ${SAMPLES} samples each.`,
  );
  console.log(
    `  tolerance: +/-${(TOLERANCE * 100).toFixed(0)}pp absolute deviation from the ideal 1/N position frequency.`,
  );

  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
