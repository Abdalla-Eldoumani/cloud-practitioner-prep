// Content lint over the typed question bank and the lesson frontmatter. Imports
// the bank directly (never parses .ts source) and uses gray-matter only for
// lesson frontmatter. Every rule below is a hard failure: the script collects
// all of them, prints a grouped report, and exits 1 if any fired, else 0.
//
// Rules:
//   floor            per-domain count >= DOMAIN_QUESTION_FLOORS            (ACC-03)
//   lastVerified     every question has a non-empty lastVerified           (ACC-01)
//   lesson updated   every lesson frontmatter has an `updated` date        (ACC-01)
//   duplicate stems  no two questions share a normalized stem              (ACC-06)
//   option-letter    no explanation names an option by letter or ordinal   (ACC-06)
//   domain tag       domain in {1..4}, and the id prefix AND the source    (ACC-06)
//                    file name both agree with the question's domain
//   coverage         every incorrect option is named in the explanation    (ACC-04)
//                    (token-overlap heuristic), with an enumerated allowlist
//   rationale map    a populated distractorRationales covers every wrong    (ACC-04)
//                    option id with a non-empty reason
//
// Warnings (informational, do not change the exit code):
//   - questions lacking a complete structured distractorRationales map
//   - stale "12-month free tier" phrasing for a volatile-topic review       (ACC-02)

import { globby } from "globby";
import matter from "gray-matter";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  OPTION_LETTER_RE,
  countByDomain,
  incorrectOptionTokens,
  loadQuestions,
  resolveGlob,
} from "./content-lib";
import { DOMAIN_QUESTION_FLOORS } from "../src/lib/constants";
import type { Domain, Question } from "../src/lib/types";

// Justified exceptions to the whole-bank ACC-04 coverage gate, by question id.
// Starts EMPTY. An id is added only with a written one-line justification when a
// later content pass confirms the explanation genuinely addresses every
// distractor in prose the token heuristic cannot detect (for example a purely
// conceptual true/false distractor with no nameable distinguishing term). A bare
// warning is never an acceptable substitute for a hard failure here; this list
// is the only sanctioned escape, and every entry is tracked in the summary.
const ACC04_COVERAGE_ALLOWLIST: ReadonlySet<string> = new Set<string>([
  // (empty — populated by later content plans with a justification per id)
]);

const VALID_DOMAINS: ReadonlySet<number> = new Set([1, 2, 3, 4]);
const LESSONS_GLOB = resolveGlob("../src/content/lessons/*.mdx");
const QUESTION_FILES_GLOB = resolveGlob("../src/data/questions/domain-*.ts");

// Collects hard failures and soft warnings separately. Only failures set the
// exit code; warnings surface review items without blocking.
class Reporter {
  private failures = new Map<string, string[]>();
  private warnings = new Map<string, string[]>();

  fail(rule: string, detail: string): void {
    if (!this.failures.has(rule)) this.failures.set(rule, []);
    this.failures.get(rule)!.push(detail);
  }

  warn(rule: string, detail: string): void {
    if (!this.warnings.has(rule)) this.warnings.set(rule, []);
    this.warnings.get(rule)!.push(detail);
  }

  hasFailures(): boolean {
    return this.failures.size > 0;
  }

  print(): void {
    // LINT_FULL prints every violation id (no truncation) so a content pass can
    // enumerate and fix all of them; default output stays capped for readability.
    const full = !!process.env.LINT_FULL;
    if (this.warnings.size > 0) {
      console.log("\nWarnings (review, non-blocking):");
      for (const [rule, items] of this.warnings) {
        console.log(`  [${rule}] ${items.length}`);
        const cap = full ? items.length : 25;
        for (const d of items.slice(0, cap)) console.log(`      - ${d}`);
        if (items.length > cap) console.log(`      ... and ${items.length - cap} more`);
      }
    }

    if (this.failures.size === 0) {
      console.log("\nPASS: every hard content rule holds.");
      return;
    }

    let total = 0;
    console.error("\nFAIL: hard content rule violations:");
    for (const [rule, items] of this.failures) {
      total += items.length;
      console.error(`  [${rule}] ${items.length}`);
      const cap = full ? items.length : 50;
      for (const d of items.slice(0, cap)) console.error(`      - ${d}`);
      if (items.length > cap) console.error(`      ... and ${items.length - cap} more`);
    }
    console.error(`\n${total} hard violation(s) across ${this.failures.size} rule(s).`);
  }
}

// Normalize a stem for duplicate detection: trim, lowercase, collapse runs of
// whitespace to a single space.
function normalizeStem(stem: string): string {
  return stem.trim().toLowerCase().replace(/\s+/g, " ");
}

// The id prefix grouping, e.g. "d2-iam-basics-05" -> domain 2. Ids are
// "dN-<topic>-NN", so the domain is the digit after the leading "d".
function domainFromId(id: string): number | null {
  const m = id.match(/^d(\d)-/);
  return m ? Number(m[1]) : null;
}

// Map every question id to the domain its source file name encodes. Globs the
// per-domain files, imports each (each exports exactly one Question[]), and
// records id -> fileDomain. This validates the third domain-tag clause (the
// source file name) without parsing .ts source.
async function fileDomainById(): Promise<Map<string, number>> {
  const files = await globby(QUESTION_FILES_GLOB);
  const map = new Map<string, number>();
  for (const file of files) {
    const base = file.split("/").pop() ?? file;
    const fileDomain = Number(base.match(/^domain-(\d)/)?.[1]);
    if (!VALID_DOMAINS.has(fileDomain)) continue;
    const mod: Record<string, unknown> = await import(pathToFileURL(file).href);
    for (const value of Object.values(mod)) {
      if (!Array.isArray(value)) continue;
      for (const q of value as Question[]) {
        if (q && typeof q.id === "string") map.set(q.id, fileDomain);
      }
    }
  }
  return map;
}

async function main(): Promise<void> {
  const questions = loadQuestions();
  const report = new Reporter();

  // ACC-03: per-domain floor. Regression guard; current counts already clear it.
  const counts = countByDomain(questions);
  for (const domainKey of Object.keys(DOMAIN_QUESTION_FLOORS)) {
    const d = Number(domainKey) as Domain;
    const have = counts[d] ?? 0;
    const floor = DOMAIN_QUESTION_FLOORS[d];
    if (have < floor) {
      report.fail("floor", `domain ${d}: ${have} questions, below floor ${floor}`);
    }
  }

  // Source-file-name -> domain map for the domain-tag rule.
  const fileDomain = await fileDomainById();

  const seenStems = new Map<string, string>();

  for (const q of questions) {
    // ACC-01: every question carries a non-empty lastVerified date.
    if (!q.lastVerified || q.lastVerified.trim() === "") {
      report.fail("lastVerified", `${q.id}: missing lastVerified`);
    }

    // ACC-06: no duplicate stems across the bank.
    const key = normalizeStem(q.stem);
    if (seenStems.has(key)) {
      report.fail(
        "duplicate-stem",
        `${q.id} duplicates ${seenStems.get(key)}`,
      );
    } else {
      seenStems.set(key, q.id);
    }

    // ACC-06: no option-letter or ordinal reference in the explanation.
    if (OPTION_LETTER_RE.test(q.explanation)) {
      report.fail("option-letter", `${q.id}: explanation names an option by letter/ordinal`);
    }

    // ACC-06: domain tag agrees three ways — range, id prefix, source file name.
    if (!VALID_DOMAINS.has(q.domain)) {
      report.fail("domain-tag", `${q.id}: domain ${q.domain} not in {1,2,3,4}`);
    }
    const idDomain = domainFromId(q.id);
    if (idDomain !== null && idDomain !== q.domain) {
      report.fail(
        "domain-tag",
        `${q.id}: id prefix domain ${idDomain} != domain field ${q.domain}`,
      );
    }
    const srcDomain = fileDomain.get(q.id);
    if (srcDomain !== undefined && srcDomain !== q.domain) {
      report.fail(
        "domain-tag",
        `${q.id}: source-file domain ${srcDomain} != domain field ${q.domain}`,
      );
    }

    // ACC-04 whole-bank coverage (hard). For each incorrect option, at least one
    // distinguishing token must appear in the prose explanation. Options with no
    // distinguishing token (their text fully overlaps the correct answer) are
    // not checkable by this heuristic and are skipped. Allowlisted ids are
    // skipped entirely but tracked in the summary.
    if (!ACC04_COVERAGE_ALLOWLIST.has(q.id)) {
      const explanationLower = q.explanation.toLowerCase();
      const tokensByOption = incorrectOptionTokens(q);
      for (const [optionId, tokens] of Object.entries(tokensByOption)) {
        if (tokens.length === 0) continue; // nothing distinguishing to require
        const covered = tokens.some((t) => explanationLower.includes(t));
        if (!covered) {
          report.fail(
            "acc04-coverage",
            `${q.id}: explanation does not name distractor "${optionId}" (none of: ${tokens.slice(0, 6).join(", ")})`,
          );
        }
      }
    }

    // ACC-04 structured completeness (hard, where a map exists). A populated
    // distractorRationales must cover every incorrect option id with a non-empty
    // reason. The correct ids are excluded.
    if (q.distractorRationales && Object.keys(q.distractorRationales).length > 0) {
      const correct = new Set(q.correct);
      for (const opt of q.options) {
        if (correct.has(opt.id)) continue;
        const reason = q.distractorRationales[opt.id];
        if (reason === undefined) {
          report.fail("rationale-map", `${q.id}: distractorRationales missing option "${opt.id}"`);
        } else if (reason.trim() === "") {
          report.fail("rationale-map", `${q.id}: distractorRationales has an empty reason for "${opt.id}"`);
        }
      }
    } else {
      // Informational: how many questions still lack a complete structured map.
      report.warn("rationale-map-missing", q.id);
    }

    // ACC-02 (warning): stale "12-month free tier" phrasing for review.
    const stale = /12[\s-]?month.*free tier/i;
    if (stale.test(q.stem) || stale.test(q.explanation)) {
      report.warn("stale-free-tier", q.id);
    }
  }

  // ACC-01: every lesson frontmatter carries an `updated` date.
  const lessonFiles = await globby(LESSONS_GLOB);
  for (const file of lessonFiles) {
    const base = file.split("/").pop() ?? file;
    const { data } = matter(readFileSync(file, "utf8"));
    if (!data.updated) {
      report.fail("lesson-updated", `${base}: frontmatter missing updated date`);
    }
  }

  // Summary header before the detail report.
  console.log(
    `Content lint: ${questions.length} questions, ${lessonFiles.length} lessons.`,
  );
  console.log(
    `  domain counts: ${JSON.stringify(counts)} (floors ${JSON.stringify(DOMAIN_QUESTION_FLOORS)})`,
  );
  console.log(
    `  ACC-04 coverage allowlist: ${ACC04_COVERAGE_ALLOWLIST.size}${ACC04_COVERAGE_ALLOWLIST.size > 0 ? ` (${[...ACC04_COVERAGE_ALLOWLIST].join(", ")})` : " (empty)"}`,
  );

  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main().catch((err) => {
  console.error("lint-content crashed:", err);
  process.exit(1);
});
