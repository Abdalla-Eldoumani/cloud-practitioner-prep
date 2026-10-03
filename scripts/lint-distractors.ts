// Option-length parity lint over the typed question bank. A learner who has
// noticed that the right answer tends to be the longest, most qualified option
// can pass without knowing the material, and so can one who has noticed it is
// never the longest or never the shortest. These rules keep every length rank
// close to chance. Every rule is a hard failure; offending ids print grouped by
// their source file, and the exit code is 1 if any rule fired, else 0.
//
// Rules (lengths are option text character counts):
//   ratio           a single-answer correct option longer than RATIO_LIMIT x
//                   its longest distractor
//   single-longest  among four-option single-answer questions, the share whose
//                   correct option is strictly the longest, outside SINGLE_RANK
//   single-shortest the same share for strictly the shortest, outside
//                   SINGLE_RANK
//   multi-longest   bank-wide share of multi-answer questions whose correct set
//                   is the N longest options (no distractor is longer than
//                   any correct option; a tie at the boundary still sorts the
//                   correct set to the top), outside MULTI_LONGEST

import { globby } from "globby";
import { pathToFileURL } from "node:url";
import { loadQuestions, resolveGlob } from "./content-lib";
import type { Question } from "../src/lib/types";

// Chance for either end of a four-option single answer is 25%. The band leaves
// room for answers that are naturally the most or least specific, while a share
// far below chance would let a learner rule an end out.
const SINGLE_RANK = { min: 0.18, max: 0.32 };
// Chance for choose-2-of-5 is 10%. The ceiling allows the same headroom, and the
// floor keeps "never pick the longest pair" from becoming a rule of thumb.
const MULTI_LONGEST = { min: 0.03, max: 0.2 };
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
  const singleShortest: string[] = [];
  const multiLongest: string[] = [];
  let singles = 0;
  let fourOption = 0;
  let multis = 0;

  for (const q of questions) {
    const { right, wrong } = split(q);
    if (wrong.length === 0) continue;
    const maxWrong = Math.max(...wrong);
    if (q.type === "single") {
      singles++;
      if (right[0] > RATIO_LIMIT * maxWrong) ratio.push(q.id);
      // Rank shares are only comparable across questions with the same option
      // count, since chance for each end depends on it.
      if (q.options.length !== 4) continue;
      fourOption++;
      if (right[0] > maxWrong) singleLongest.push(q.id);
      if (right[0] < Math.min(...wrong)) singleShortest.push(q.id);
    } else {
      multis++;
      if (Math.min(...right) >= maxWrong) multiLongest.push(q.id);
    }
  }

  const share = (n: number, d: number) => (d === 0 ? 0 : n / d);
  const band = (b: { min: number; max: number }) => `${b.min * 100}-${b.max * 100}%`;
  const failures: string[] = [];

  console.log(`Distractor lint: ${questions.length} questions (${singles} single, ${multis} multi).`);
  console.log(
    `  single: correct > ${RATIO_LIMIT}x longest distractor ${ratio.length} (limit 0)`,
  );
  console.log(
    `  single (4 options): correct strictly longest ${singleLongest.length}/${fourOption} (${pct(singleLongest.length, fourOption)}%, band ${band(SINGLE_RANK)})`,
  );
  console.log(
    `  single (4 options): correct strictly shortest ${singleShortest.length}/${fourOption} (${pct(singleShortest.length, fourOption)}%, band ${band(SINGLE_RANK)})`,
  );
  console.log(
    `  multi: correct set is the N longest ${multiLongest.length}/${multis} (${pct(multiLongest.length, multis)}%, band ${band(MULTI_LONGEST)})`,
  );

  // An upper breach lists the questions to fix; a lower breach has no single
  // offender, so it only names the rank that needs more questions.
  const checkBand = (rule: string, ids: string[], total: number, b: { min: number; max: number }, title: string) => {
    const s = share(ids.length, total);
    if (s > b.max) {
      failures.push(rule);
      printGrouped(`[${rule}] above ${b.max * 100}%, ${title}:`, ids, files);
    } else if (s < b.min) {
      failures.push(rule);
      console.log(`
[${rule}] below ${b.min * 100}%: ${ids.length}/${total}, ${title}.`);
    }
  };

  if (ratio.length > 0) {
    failures.push("ratio");
    printGrouped(`[ratio] correct option over ${RATIO_LIMIT}x the longest distractor:`, ratio, files);
  }
  checkBand("single-longest", singleLongest, fourOption, SINGLE_RANK, "correct option strictly longest");
  checkBand("single-shortest", singleShortest, fourOption, SINGLE_RANK, "correct option strictly shortest");
  checkBand("multi-longest", multiLongest, multis, MULTI_LONGEST, "correct set is the N longest options");

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
