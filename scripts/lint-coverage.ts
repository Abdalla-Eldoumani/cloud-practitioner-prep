// Coverage completeness lint over the exam blueprint. Imports the real
// TASK_STATEMENTS (never parses .ts source), the real question bank, and the real
// normalizeTopic key, then globs the lesson files for the set of slugs that
// actually exist. Mirrors lint-catalog.ts: every rule is a hard failure, the
// script collects them all, prints a grouped report, and exits 1 if any fired,
// else 0.
//
// The point of this gate is to make the coverage map honest rather than
// vacuous: a statement is "covered" only if it resolves to a real
// lesson AND a real question, and every authored slug/topic must resolve to
// something, so a typo is a hard failure rather than a silent zero.
//
// Rules (each a named hard-failure group):
//   manifest          all 19 expected ids present, no unexpected, no duplicate
//   domain-matches    a statement's leading id digit equals its domain
//   lessons-nonempty  lessonSlugs is non-empty
//   questions-nonempty resolved questions (domain + normalized topic) > 0
//   lesson-resolves   every authored lessonSlug is a real lesson slug
//   lesson-domain     a lessonSlug's lesson sits in the statement's domain,
//                     unless the pair is on CROSS_DOMAIN_LESSONS
//   topic-resolves    every authored topic resolves to >=1 question IN its domain
//   topic-covered     the reverse: every question's topic joins >=1 statement in
//                     the question's OWN domain, so no question is unreachable
//                     from the coverage map
//
// The 19 ids are fixed exam facts authored in one pass, so a missing id is ALWAYS
// a hard failure: there is no CATALOG_COMPLETE-style escape hatch here (the
// catalog lint has one only because its content is authored incrementally).

import { globby } from "globby";
import matter from "gray-matter";
import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { TASK_STATEMENTS } from "../src/data/blueprint";
import { ALL_QUESTIONS } from "../src/data/questions/index";
import { normalizeTopic } from "../src/lib/topics";

// The 19 official CLF-C02 task statement ids, in guide order. This is the
// completeness manifest: TASK_STATEMENTS must match it exactly.
const EXPECTED_IDS: readonly string[] = [
  "1.1",
  "1.2",
  "1.3",
  "1.4",
  "2.1",
  "2.2",
  "2.3",
  "2.4",
  "3.1",
  "3.2",
  "3.3",
  "3.4",
  "3.5",
  "3.6",
  "3.7",
  "3.8",
  "4.1",
  "4.2",
  "4.3",
];

// The "<statement id>:<lesson slug>" pairs where a lesson deliberately covers a
// statement outside its own domain. Some lessons teach across the domain line:
// the cloud-computing primer defines the deployment and operating models
// statement 3.1 asks for, and the monitoring lesson teaches X-Ray for 3.8 and the
// AWS Health Dashboard for 4.3. Every other cross-domain pairing is a mis-join
// (usually a slug pasted under the wrong statement) and fails, so this list stays
// short and each entry is a deliberate teaching decision, not a convenience.
const CROSS_DOMAIN_LESSONS: ReadonlySet<string> = new Set<string>([
  "3.1:what-is-cloud-computing",
  "3.8:monitoring-cloudwatch-cloudtrail",
  "4.3:monitoring-cloudwatch-cloudtrail",
]);

// Resolve a path relative to this module into a glob pattern globby accepts on
// every platform. new URL().pathname yields a leading-slash, drive-letter form
// (/C:/...) that fast-glob does not match on Windows; fileURLToPath gives native
// separators, so normalize the backslashes to forward slashes for globby. Mirrors
// content-lib.ts so the lessons are read the same way the content lints read them.
function resolveGlob(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url)).replace(/\\/g, "/");
}

// Mirrors the loader pattern in src/content.config.ts (["**/*.{md,mdx}",
// "!**/[A-Z]*"]): a lesson file is a lowercase kebab-case slug, so an
// uppercase-named file next to the lessons is notes, not a lesson. Counting one
// would inflate the slug set and let a blueprint slug "resolve" to a non-lesson.
const LESSONS_GLOB = [
  resolveGlob("../src/content/lessons/**/*.{md,mdx}"),
  `!${resolveGlob("../src/content/lessons/**/[A-Z]*")}`,
];

// Collects hard failures (set the exit code) and soft notes (informational).
// Mirrors lint-catalog.ts's Reporter so the report shape is identical.
class Reporter {
  private failures = new Map<string, string[]>();
  private notes: string[] = [];

  fail(rule: string, detail: string): void {
    if (!this.failures.has(rule)) this.failures.set(rule, []);
    this.failures.get(rule)!.push(detail);
  }

  note(detail: string): void {
    this.notes.push(detail);
  }

  hasFailures(): boolean {
    return this.failures.size > 0;
  }

  print(): void {
    const full = !!process.env.LINT_FULL;

    if (this.notes.length > 0) {
      console.log("\nNotes (informational, non-blocking):");
      for (const n of this.notes) console.log(`  - ${n}`);
    }

    if (this.failures.size === 0) {
      console.log("\nPASS: every statement resolves to a real lesson and question.");
      return;
    }

    let total = 0;
    console.error("\nFAIL: hard coverage rule violations:");
    for (const [rule, items] of this.failures) {
      total += items.length;
      console.error(`  [${rule}] ${items.length}`);
      const cap = full ? items.length : 50;
      for (const d of items.slice(0, cap)) console.error(`      - ${d}`);
      if (items.length > cap)
        console.error(`      ... and ${items.length - cap} more`);
    }
    console.error(
      `\n${total} hard violation(s) across ${this.failures.size} rule(s).`,
    );
  }
}

// The lessons that actually exist on disk, keyed by the slug the content
// collection uses (the basename without its extension) and valued by the domain
// the lesson's frontmatter declares. Frontmatter is parsed with gray-matter, the
// same way the content lints read it.
async function loadLessons(): Promise<Map<string, number>> {
  const files = await globby(LESSONS_GLOB);
  const lessons = new Map<string, number>();
  for (const file of files) {
    const { data } = matter(readFileSync(file, "utf8"));
    lessons.set(basename(file, extname(file)), Number(data.domain));
  }
  return lessons;
}

async function main(): Promise<void> {
  const report = new Reporter();

  const lessons = await loadLessons();
  // The normalized topic keys present in the bank, and the count of questions
  // each key resolves to within a given domain (so topic-resolves can require a
  // match in the statement's OWN domain, mirroring the page's resolver).
  const topicKeysInDomain = new Map<number, Set<string>>([
    [1, new Set()],
    [2, new Set()],
    [3, new Set()],
    [4, new Set()],
  ]);
  for (const q of ALL_QUESTIONS) {
    topicKeysInDomain.get(q.domain)?.add(normalizeTopic(q.topic));
  }

  // Manifest: exactly the 19 expected ids, none missing, no extra, no duplicate.
  const expected = new Set(EXPECTED_IDS);
  const seen = new Set<string>();
  for (const ts of TASK_STATEMENTS) {
    if (seen.has(ts.id)) {
      report.fail("manifest", `duplicate task-statement id: ${ts.id}`);
    } else {
      seen.add(ts.id);
    }
    if (!expected.has(ts.id)) {
      report.fail("manifest", `unexpected task-statement id not in the 19: ${ts.id}`);
    }
  }
  for (const id of EXPECTED_IDS) {
    if (!seen.has(id)) {
      report.fail("manifest", `missing task-statement id: ${id}`);
    }
  }

  for (const ts of TASK_STATEMENTS) {
    const where = ts.id || "(unidentified statement)";

    // domain-matches: the leading digit of the id equals the declared domain.
    const leadingDigit = Number.parseInt(ts.id.split(".")[0] ?? "", 10);
    if (leadingDigit !== ts.domain) {
      report.fail(
        "domain-matches",
        `${where}: id leads with domain ${leadingDigit} but domain field is ${ts.domain}`,
      );
    }

    // lessons-nonempty: at least one covering lesson.
    if (ts.lessonSlugs.length === 0) {
      report.fail("lessons-nonempty", `${where}: lessonSlugs is empty`);
    }

    // lesson-resolves: every authored slug is a real lesson (catch a typo).
    // lesson-domain: and it teaches this statement's domain, unless the pair is
    // an allowlisted deliberate cross-domain lesson.
    for (const slug of ts.lessonSlugs) {
      const lessonDomain = lessons.get(slug);
      if (lessonDomain === undefined) {
        report.fail(
          "lesson-resolves",
          `${where}: lessonSlug "${slug}" does not match any lesson file`,
        );
        continue;
      }
      if (lessonDomain !== ts.domain && !CROSS_DOMAIN_LESSONS.has(`${ts.id}:${slug}`)) {
        report.fail(
          "lesson-domain",
          `${where}: lesson "${slug}" is domain ${lessonDomain}, not ${ts.domain}, and is not on the cross-domain allowlist`,
        );
      }
    }

    // The resolver the coverage page uses: questions in this statement's domain
    // whose normalized topic is in the authored set.
    const domainKeys = topicKeysInDomain.get(ts.domain) ?? new Set<string>();
    const authoredKeys = new Set(ts.topics.map(normalizeTopic));
    const resolvedQuestions = ALL_QUESTIONS.filter(
      (q) => q.domain === ts.domain && authoredKeys.has(normalizeTopic(q.topic)),
    );

    // questions-nonempty: the statement resolves to at least one real question.
    if (resolvedQuestions.length === 0) {
      report.fail(
        "questions-nonempty",
        `${where}: resolves to 0 questions (domain ${ts.domain} + ${ts.topics.length} authored topic(s))`,
      );
    }

    // topic-resolves: every authored topic matches >=1 question in this domain
    // (catch a typo or a topic borrowed from another domain that matches nothing
    // here). Empty topics is itself a failure so the message is unambiguous.
    if (ts.topics.length === 0) {
      report.fail("topic-resolves", `${where}: topics is empty`);
    }
    for (const topic of ts.topics) {
      if (!domainKeys.has(normalizeTopic(topic))) {
        report.fail(
          "topic-resolves",
          `${where}: topic "${topic}" resolves to 0 questions in domain ${ts.domain}`,
        );
      }
    }
  }

  // topic-covered: the reverse join. A question whose normalized topic matches no
  // statement in its own domain is unreachable from the coverage map — it is in
  // the bank and in a domain quiz, but the map claims no statement teaches it. The
  // join is domain-constrained on both sides, so the same topic string under
  // another domain's statement does not rescue it. Reported once per distinct
  // domain+topic (with a count and an example id) so a retag is one line to read.
  const authoredKeysInDomain = new Map<number, Set<string>>([
    [1, new Set()],
    [2, new Set()],
    [3, new Set()],
    [4, new Set()],
  ]);
  for (const ts of TASK_STATEMENTS) {
    const keys = authoredKeysInDomain.get(ts.domain);
    if (!keys) continue;
    for (const topic of ts.topics) keys.add(normalizeTopic(topic));
  }

  const orphanTopics = new Map<string, { label: string; domain: number; ids: string[] }>();
  for (const q of ALL_QUESTIONS) {
    const key = normalizeTopic(q.topic);
    if (authoredKeysInDomain.get(q.domain)?.has(key)) continue;
    const groupKey = `${q.domain}:${key}`;
    const group = orphanTopics.get(groupKey);
    if (group) group.ids.push(q.id);
    else orphanTopics.set(groupKey, { label: q.topic, domain: q.domain, ids: [q.id] });
  }
  for (const { label, domain, ids } of orphanTopics.values()) {
    report.fail(
      "topic-covered",
      `topic "${label}" (domain ${domain}) matches no task statement in domain ${domain}: ${ids.length} question(s), e.g. ${ids[0]}`,
    );
  }

  // Summary header before the detail report.
  console.log(
    `Coverage lint: ${TASK_STATEMENTS.length} statements, ${EXPECTED_IDS.length} expected (manifest), ${lessons.size} lesson slugs, ${ALL_QUESTIONS.length} questions.`,
  );

  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
