// Behavior assertion for the flashcard deck builder. It exercises the SAME
// buildDeck the flashcards island builds the deck through (never a
// reimplementation), so a pass is a guarantee about shipped behavior. The deck
// is pure mapping over the catalog plus the missed question ids, so it is
// testable without a browser — this is the TDD gate the plan calls for in place
// of a unit runner the repo does not have.
//
// Assertions (all hard failures, collected and reported together):
//   source-merge      2 synthetic services + a missed id naming one of two pool
//                     questions yields 2 service cards + 1 question card (3
//                     total), with the expected kind split and the answer text
//                     (not option letters) on the question card's back.
//   stable-ids        every card id matches `service:<id>` / `question:<id>` and
//                     all ids are unique (so deck order and known/learning keys
//                     are stable while shown).
//   skip-unresolvable a missed id absent from the pool is skipped (not in the
//                     deck, no throw); a resolvable one still appears; a
//                     duplicated missed id yields a single card.
//   empty-input       buildDeck over empty services AND empty missed returns []
//                     so the page can show its empty state.
//
// buildDeck shuffles deck ORDER (Math.random), so the assertions check
// membership / kind / id shape / size, never positional order.
//
// Mirrors check-drill.ts / check-shuffle-uniformity.ts: a self-contained tsx CLI
// that collects every failure, prints a grouped report with counts, then exits 0
// (clean) or 1 (any failure). Run via `npm run check:deck`.

import { buildDeck } from "../src/lib/flashcards";
import type { Question, ServiceEntry } from "../src/lib/types";

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
      console.log("\nPASS: the deck merges the catalog and missed questions, gives every card a stable unique id, skips unresolvable ids, and is empty only when both sources are.");
      return;
    }
    let total = 0;
    console.error("\nFAIL: deck behavior violations:");
    for (const [rule, items] of this.failures) {
      total += items.length;
      console.error(`  [${rule}] ${items.length}`);
      for (const d of items) console.error(`      - ${d}`);
    }
    console.error(`\n${total} violation(s) across ${this.failures.size} rule(s).`);
  }
}

// A minimal synthetic service: only the fields buildDeck reads (id, name,
// shortName, purpose, whenToUse, reference) carry the assertions; the rest
// satisfy the ServiceEntry type.
function svc(id: string, name: string, shortName?: string): ServiceEntry {
  return {
    id,
    name,
    shortName,
    domain: 1,
    category: "Compute",
    purpose: `${name} purpose`,
    whenToUse: `reach for ${name} when ...`,
    reference: { label: `${name} docs`, url: "https://docs.aws.amazon.com/" },
    lastVerified: "2026-06-24",
  };
}

// A minimal synthetic question: id, stem, options, correct, explanation, and
// reference drive the card; the rest satisfy the Question type. The correct
// option text is distinct from its id so the back-text assertion is meaningful.
function q(id: string, stem: string): Question {
  return {
    id,
    domain: 1,
    type: "single",
    topic: "Topic",
    difficulty: "easy",
    stem,
    options: [
      { id: "a", text: `${id} right answer` },
      { id: "b", text: `${id} wrong answer` },
    ],
    correct: ["a"],
    explanation: `${id} explanation`,
    reference: { label: "ref", url: "https://docs.aws.amazon.com/" },
    lastVerified: "2026-06-24",
  };
}

function main(): void {
  const report = new Reporter();

  // ---- source-merge: catalog + one missed question ----
  const services = [svc("amazon-ec2", "Amazon EC2", "EC2"), svc("aws-kms", "AWS KMS", "KMS")];
  const pool = [q("d1-one", "First missed question?"), q("d1-two", "Unmissed question?")];
  const merged = buildDeck({ services, questions: pool, missedIds: ["d1-one"] });

  if (merged.length !== 3) {
    report.fail("source-merge", `expected 3 cards (2 service + 1 missed), got ${merged.length}`);
  }
  const serviceCards = merged.filter((c) => c.kind === "service");
  const questionCards = merged.filter((c) => c.kind === "question");
  if (serviceCards.length !== 2) {
    report.fail("source-merge", `expected 2 service cards, got ${serviceCards.length}`);
  }
  if (questionCards.length !== 1) {
    report.fail("source-merge", `expected 1 question card, got ${questionCards.length}`);
  }
  // The missed-question card is the one named in missedIds, and its back shows the
  // correct option TEXT (not the option letter), with the stem on the front.
  const missedCard = merged.find((c) => c.id === "question:d1-one");
  if (!missedCard) {
    report.fail("source-merge", `the missed question (d1-one) should produce a card`);
  } else {
    if (missedCard.front !== "First missed question?") {
      report.fail("source-merge", `question card front should be the stem; got "${missedCard.front}"`);
    }
    if (missedCard.back !== "d1-one right answer") {
      report.fail("source-merge", `question card back should be the correct answer TEXT; got "${missedCard.back}"`);
    }
    if (missedCard.sourceId !== "d1-one") {
      report.fail("source-merge", `question card sourceId should be the raw question id; got "${missedCard.sourceId}"`);
    }
  }
  // The unmissed question must NOT be a card (only missed questions feed the deck).
  if (merged.some((c) => c.id === "question:d1-two")) {
    report.fail("source-merge", `an unmissed question must not appear in the deck`);
  }
  // A service card keeps its purpose/when-to-use and folds the short form in.
  const ec2 = merged.find((c) => c.id === "service:amazon-ec2");
  if (!ec2) {
    report.fail("source-merge", `each service should produce a card (amazon-ec2 missing)`);
  } else {
    if (ec2.front !== "Amazon EC2 (EC2)") {
      report.fail("source-merge", `service card front should fold in the short form; got "${ec2.front}"`);
    }
    if (ec2.back !== "Amazon EC2 purpose" || ec2.detail !== "reach for Amazon EC2 when ...") {
      report.fail("source-merge", `service card should carry purpose (back) + when-to-use (detail)`);
    }
  }

  // ---- stable-ids: prefixed shape, all unique ----
  for (const c of merged) {
    const expected = `${c.kind}:${c.sourceId}`;
    if (c.id !== expected) {
      report.fail("stable-ids", `card id "${c.id}" should be "${expected}"`);
    }
    if (!/^(service|question):.+/.test(c.id)) {
      report.fail("stable-ids", `card id "${c.id}" should match service:<id> / question:<id>`);
    }
  }
  if (new Set(merged.map((c) => c.id)).size !== merged.length) {
    report.fail("stable-ids", `deck contains duplicate card ids`);
  }

  // ---- skip-unresolvable: stale + duplicate missed ids ----
  const skip = buildDeck({
    services: [],
    questions: pool,
    missedIds: ["ghost-1", "d1-one", "ghost-2", "d1-one"],
  });
  if (skip.some((c) => c.id === "question:ghost-1" || c.id === "question:ghost-2")) {
    report.fail("skip-unresolvable", `a missed id not in the pool must not appear in the deck`);
  }
  if (!skip.some((c) => c.id === "question:d1-one")) {
    report.fail("skip-unresolvable", `a resolvable missed id should still produce a card ("d1-one" missing)`);
  }
  // The duplicated missed id collapses to a single card.
  if (skip.filter((c) => c.id === "question:d1-one").length !== 1) {
    report.fail("skip-unresolvable", `a duplicated missed id should yield exactly one card`);
  }
  if (skip.length !== 1) {
    report.fail("skip-unresolvable", `only the one resolvable missed id should remain, got ${skip.length} cards`);
  }

  // ---- empty-input: no services AND no missed -> [] ----
  const empty = buildDeck({ services: [], questions: pool, missedIds: [] });
  if (empty.length !== 0) {
    report.fail("empty-input", `buildDeck with no services and no missed ids must return [], got ${empty.length}`);
  }

  console.log("Deck behavior: exercised buildDeck against synthetic services, a question pool, and missed ids.");
  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
