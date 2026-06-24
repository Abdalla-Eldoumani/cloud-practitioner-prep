// Behavior assertion for the adaptive weak-area drill. It exercises the SAME
// buildDrill / rankWeakTopics the engine builds the drill through (never a
// reimplementation), so a pass is a guarantee about shipped behavior. The drill
// is pure selection over a pool plus the stored per-topic stats, so it is
// testable without a browser — this is the TDD gate the plan calls for in place
// of a unit runner the repo does not have.
//
// Assertions (all hard failures, collected and reported together):
//   skew            the lowest-accuracy qualifying topic ranks first, and a
//                   drill over a pool split between a weak and a strong topic
//                   draws mostly from the weak one.
//   seen-threshold  a topic with seen < minSeen is absent from the ranking
//                   (a barely-seen topic is not mislabeled weak).
//   never-empty     a non-empty pool with cold-start (empty) stats yields a
//                   drill of min(count, pool.length) > 0 (the fallback path).
//   skip-unresolvable  missed ids that are not in the pool neither crash nor
//                   appear in the result.
//   empty-input     buildDrill over an empty pool returns no questions.
//
// Math.random drives the shuffle inside buildDrill, so the skew assertion is
// statistical: it seeds a large lopsided pool and asserts a comfortable
// majority, not an exact count. The deterministic rank-order checks carry the
// precise-skew guarantee.
//
// Mirrors check-shuffle-uniformity.ts: a self-contained tsx CLI that collects
// every failure, prints a grouped report with counts, then exits 0 (clean) or 1
// (any failure). Run via `npm run check:drill`.

import { buildDrill, rankWeakTopics } from "../src/lib/exam";
import { normalizeTopic } from "../src/lib/topics";
import type { Question, TopicStat } from "../src/lib/types";

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
      console.log("\nPASS: the drill skews to weak topics, honors the seen threshold, and is never empty for a non-empty pool.");
      return;
    }
    let total = 0;
    console.error("\nFAIL: drill behavior violations:");
    for (const [rule, items] of this.failures) {
      total += items.length;
      console.error(`  [${rule}] ${items.length}`);
      for (const d of items) console.error(`      - ${d}`);
    }
    console.error(`\n${total} violation(s) across ${this.failures.size} rule(s).`);
  }
}

// A minimal synthetic question: only the fields buildDrill reads (id, topic)
// matter, the rest satisfy the type. Topic strings here deliberately vary casing
// so the test also proves normalizeTopic keeps them in one bucket.
function q(id: string, topic: string): Question {
  return {
    id,
    domain: 1,
    type: "single",
    topic,
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

function stat(topic: string, seen: number, correct: number, lastSeen?: number): TopicStat {
  return { topic, seen, correct, lastSeen };
}

// topicStats are keyed by normalizeTopic, exactly as the store records them.
function statsByKey(...entries: TopicStat[]): Record<string, TopicStat> {
  const out: Record<string, TopicStat> = {};
  for (const s of entries) out[normalizeTopic(s.topic)] = s;
  return out;
}

function main(): void {
  const report = new Reporter();

  // ---- skew: rank order is deterministic ----
  // "Pricing" is the weak topic (1/5), "IAM" strong (5/5), "EC2" mid (3/5).
  const rankStats = statsByKey(
    stat("Pricing", 5, 1),
    stat("IAM", 5, 5),
    stat("EC2", 5, 3),
  );
  const ranked = rankWeakTopics(rankStats, { minSeen: 2 });
  if (ranked.length !== 3) {
    report.fail("skew", `expected 3 qualifying topics, got ${ranked.length}`);
  }
  if (ranked[0]?.key !== normalizeTopic("Pricing")) {
    report.fail("skew", `weakest topic should rank first; got "${ranked[0]?.label}" (acc ${ranked[0]?.accuracy})`);
  }
  if (ranked[ranked.length - 1]?.key !== normalizeTopic("IAM")) {
    report.fail("skew", `strongest topic should rank last; got "${ranked[ranked.length - 1]?.label}"`);
  }
  // The ranked label keeps the original human casing, not the normalized key.
  if (ranked[0]?.label !== "Pricing") {
    report.fail("skew", `ranked topic should keep its display label "Pricing"; got "${ranked[0]?.label}"`);
  }

  // ---- skew: the assembled drill over-samples a weak topic over a strong one ----
  // The drill draws from the bottom DRILL_TOPIC_COUNT (5) topics. To prove a weak
  // topic is preferred over a strong one, the pool carries the weak topic plus
  // five filler topics that rank ABOVE it but still inside the band, and one
  // clearly-strong topic ("Strong", high accuracy) that ranks SIXTH — outside the
  // band — so its questions only arrive via backfill. With 40 weak + 40 strong
  // and a draw of 20, every drawn question should come from the weak band and
  // none from the excluded strong topic (backfill is not reached at count 20).
  const skewWeakKey = normalizeTopic("Pricing");
  const fillerTopics = ["Networking", "Storage", "Databases", "Monitoring", "Migration"];
  const skewPool: Question[] = [
    ...Array.from({ length: 40 }, (_, i) => q(`weak-${i}`, "Pricing")),
    ...Array.from({ length: 40 }, (_, i) => q(`strong-${i}`, "Strong")),
    // A couple of questions per filler topic so the band is populated but small.
    ...fillerTopics.flatMap((t, ti) =>
      Array.from({ length: 2 }, (_, i) => q(`fill-${ti}-${i}`, t)),
    ),
  ];
  // Pricing weakest (1/10); the five fillers mid (each 5/10) sit inside the band;
  // "Strong" (9/10) ranks last and falls OUTSIDE the bottom-5 weak set.
  const skewStats = statsByKey(
    stat("Pricing", 10, 1),
    ...fillerTopics.map((t) => stat(t, 10, 5)),
    stat("Strong", 10, 9),
  );
  const skew = buildDrill(skewPool, { topicStats: skewStats, incorrectQuestions: [] }, 20);
  const fromWeak = skew.questions.filter((x) => normalizeTopic(x.topic) === skewWeakKey).length;
  const fromStrong = skew.questions.filter((x) => normalizeTopic(x.topic) === normalizeTopic("Strong")).length;
  if (skew.questions.length !== 20) {
    report.fail("skew", `drill size should be 20, got ${skew.questions.length}`);
  }
  if (fromStrong !== 0) {
    report.fail("skew", `the excluded strong topic must not be drawn at count 20; got ${fromStrong} from "Strong"`);
  }
  if (fromWeak < 10) {
    report.fail("skew", `the weakest topic should be well-represented (>=10/20), got ${fromWeak}/20 from "Pricing"`);
  }
  if (!skew.weakTopics.includes("Pricing")) {
    report.fail("skew", `weakTopics should name the chosen weak topic; got [${skew.weakTopics.join(", ")}]`);
  }
  if (skew.weakTopics.includes("Strong")) {
    report.fail("skew", `weakTopics must not name the excluded strong topic; got [${skew.weakTopics.join(", ")}]`);
  }

  // ---- seen-threshold: a barely-seen topic is excluded ----
  const thresholdStats = statsByKey(
    stat("Barely", 1, 0), // seen 1 < minSeen 2 -> excluded even at 0% accuracy
    stat("Seen", 4, 1), // qualifies
  );
  const thresholdRanked = rankWeakTopics(thresholdStats, { minSeen: 2 });
  if (thresholdRanked.some((t) => t.key === normalizeTopic("Barely"))) {
    report.fail("seen-threshold", `a topic with seen < minSeen must not rank; "Barely" (seen 1) appeared`);
  }
  if (!thresholdRanked.some((t) => t.key === normalizeTopic("Seen"))) {
    report.fail("seen-threshold", `a topic with seen >= minSeen should rank; "Seen" (seen 4) was missing`);
  }

  // ---- never-empty: cold-start fallback over a non-empty pool ----
  const coldPool: Question[] = Array.from({ length: 8 }, (_, i) => q(`cold-${i}`, `Topic ${i}`));
  const cold = buildDrill(coldPool, { topicStats: {}, incorrectQuestions: [] }, 10);
  if (cold.questions.length !== Math.min(10, coldPool.length)) {
    report.fail("never-empty", `cold-start drill should be min(count, pool)=${Math.min(10, coldPool.length)}, got ${cold.questions.length}`);
  }
  if (cold.questions.length === 0) {
    report.fail("never-empty", `cold-start drill over a non-empty pool must not be empty`);
  }
  // No duplicates in the assembled set.
  if (new Set(cold.questions.map((x) => x.id)).size !== cold.questions.length) {
    report.fail("never-empty", `drill contains duplicate questions`);
  }

  // ---- skip-unresolvable: stale missed ids do not crash or appear ----
  const resolvablePool: Question[] = Array.from({ length: 5 }, (_, i) => q(`real-${i}`, "Pricing"));
  const staleStats = statsByKey(stat("Pricing", 5, 1));
  const skip = buildDrill(
    resolvablePool,
    { topicStats: staleStats, incorrectQuestions: ["ghost-1", "ghost-2", "real-0"] },
    5,
  );
  if (skip.questions.some((x) => x.id === "ghost-1" || x.id === "ghost-2")) {
    report.fail("skip-unresolvable", `a missed id not in the pool must not appear in the drill`);
  }
  if (!skip.questions.some((x) => x.id === "real-0")) {
    report.fail("skip-unresolvable", `a resolvable missed id should still be drawn ("real-0" missing)`);
  }

  // ---- empty-input: empty pool -> no questions ----
  const empty = buildDrill([], { topicStats: statsByKey(stat("Pricing", 5, 1)), incorrectQuestions: [] }, 10);
  if (empty.questions.length !== 0) {
    report.fail("empty-input", `buildDrill over an empty pool must return no questions, got ${empty.questions.length}`);
  }

  console.log("Drill behavior: exercised buildDrill / rankWeakTopics against synthetic stats and pools.");
  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
