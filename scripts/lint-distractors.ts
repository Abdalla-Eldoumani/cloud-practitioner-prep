// Option-length parity lint over the typed question bank. A learner who has
// noticed that the right answer tends to be the longest, most qualified option
// can pass without knowing the material, so these rules keep length from being
// a usable tell. Every rule is a hard failure; offending ids print grouped by
// their source file, and the exit code is 1 if any rule fired, else 0.
//
// Rules (lengths are option text character counts):
//   ratio          a single-answer correct option longer than RATIO_LIMIT x
//                  its longest distractor
//   single-longest bank-wide share of single-answer questions whose correct
//                  option is strictly the longest, above SINGLE_LONGEST_LIMIT
//   multi-longest  bank-wide share of multi-answer questions whose correct set
//                  is the N longest options (no distractor is longer than
//                  any correct option; a tie at the boundary still sorts the
//                  correct set to the top), above MULTI_LONGEST_LIMIT

import { globby } from "globby";
import { pathToFileURL } from "node:url";
import { loadQuestions, resolveGlob } from "./content-lib";
import type { Question } from "../src/lib/types";

// Chance for a four-option single answer is 25%; 30% leaves room for questions
// whose correct answer is naturally the most specific.
const SINGLE_LONGEST_LIMIT = 0.3;
// Chance for choose-2-of-5 is 10%; 20% allows the same headroom.
const MULTI_LONGEST_LIMIT = 0.2;
const RATIO_LIMIT = 1.5;

const QUESTION_FILES_GLOB = resolveGlob("../src/data/questions/domain-*.ts");

// Map every question id to its source file name, so a content pass knows which
// file to open. Imports each topic file rather than parsing source.
async function fileById(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const file of await globby(QUESTION_FILES_GLOB)) {
    const base = file.split("/").pop() ?? file;
    const mod: Record<string, unknown> = await import(pathToFileURL(file).href);
    for (const value of Object.values(mod)) {
      if (!Array.isArray(value)) continue;
      for (const q of value as Question[]) {
        if (q && typeof q.id === "string") map.set(q.id, base);
      }
    }
  }
  return map;
}

function split(q: Question): { right: number[]; wrong: number[] } {
  const correct = new Set(q.correct);
  const right: number[] = [];
  const wrong: number[] = [];
  for (const o of q.options) (correct.has(o.id) ? right : wrong).push(o.text.length);
  return { right, wrong };
}

function printGrouped(title: string, ids: string[], files: Map<string, string>): void {
  const groups = new Map<string, string[]>();
  for (const id of ids) {
    const f = files.get(id) ?? "(unknown file)";
    if (!groups.has(f)) groups.set(f, []);
    groups.get(f)!.push(id);
  }
  console.log(`\n${title}`);
  const sorted = [...groups].sort((a, b) => b[1].length - a[1].length);
  for (const [f, list] of sorted) console.log(`  ${f} (${list.length}): ${list.join(", ")}`);
}

const pct = (n: number, d: number) => (d === 0 ? "0.0" : ((100 * n) / d).toFixed(1));

async function main(): Promise<void> {
  const questions = loadQuestions();
  const files = await fileById();

  const ratio: string[] = [];
  const singleLongest: string[] = [];
  const multiLongest: string[] = [];
  let singles = 0;
  let multis = 0;

  for (const q of questions) {
    const { right, wrong } = split(q);
    if (wrong.length === 0) continue;
    const maxWrong = Math.max(...wrong);
    if (q.type === "single") {
      singles++;
      if (right[0] > maxWrong) singleLongest.push(q.id);
      if (right[0] > RATIO_LIMIT * maxWrong) ratio.push(q.id);
    } else {
      multis++;
      if (Math.min(...right) >= maxWrong) multiLongest.push(q.id);
    }
  }

  const singleShare = singles === 0 ? 0 : singleLongest.length / singles;
  const multiShare = multis === 0 ? 0 : multiLongest.length / multis;
  const failures: string[] = [];

  console.log(`Distractor lint: ${questions.length} questions (${singles} single, ${multis} multi).`);
  console.log(
    `  single: correct strictly longest ${singleLongest.length}/${singles} (${pct(singleLongest.length, singles)}%, limit ${SINGLE_LONGEST_LIMIT * 100}%)`,
  );
  console.log(
    `  single: correct > ${RATIO_LIMIT}x longest distractor ${ratio.length} (limit 0)`,
  );
  console.log(
    `  multi: correct set is the N longest ${multiLongest.length}/${multis} (${pct(multiLongest.length, multis)}%, limit ${MULTI_LONGEST_LIMIT * 100}%)`,
  );

  if (ratio.length > 0) {
    failures.push("ratio");
    printGrouped(`[ratio] correct option over ${RATIO_LIMIT}x the longest distractor:`, ratio, files);
  }
  if (singleShare > SINGLE_LONGEST_LIMIT) {
    failures.push("single-longest");
    printGrouped("[single-longest] correct option strictly longest:", singleLongest, files);
  }
  if (multiShare > MULTI_LONGEST_LIMIT) {
    failures.push("multi-longest");
    printGrouped("[multi-longest] correct set is the N longest options:", multiLongest, files);
  }

  if (failures.length === 0) {
    console.log("\nPASS: option lengths give no usable tell.");
    process.exit(0);
  }
  console.error(`\nFAIL: ${failures.join(", ")}`);
  process.exit(1);
}

main().catch((err) => {
  console.error("lint-distractors crashed:", err);
  process.exit(1);
});
