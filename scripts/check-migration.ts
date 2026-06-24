// Migration safety assertion for the persisted progress blob. It exercises the
// SAME migrateProgress / defaultProgress the app loads progress through (never a
// reimplementation), so a pass is a guarantee about shipped behavior. The
// migration is pure over an already-parsed, untrusted value (loadProgress parses
// raw storage then delegates here), so it is testable without a browser or a DOM
// shim — this is the gate the plan calls for in place of a unit runner the repo
// does not have. The v1 -> v2 bump is the phase's top risk: a returning learner
// must not lose flagged / missed / attempt history the week before the exam.
//
// Assertions (all hard failures, collected and reported together):
//   v1-no-loss     a v1 blob with non-empty completedLessons / flaggedQuestions /
//                  incorrectQuestions / attempts upgrades to version 2 with every
//                  one of those four arrays preserved element-for-element, AND the
//                  new v2 fields seeded (topicStats an object; flashcards.known /
//                  flashcards.learning arrays; confidenceByQuestion present). The
//                  input blob is also asserted unmutated (the merge must copy).
//   v2-roundtrip   a v2 blob (defaultProgress() with a couple of fields populated)
//                  loads unchanged: version stays 2 and the populated fields are
//                  preserved, with the result deep-equal to the input.
//   corrupt-default a corrupt / absent / unrecognized input ({ version: 99 },
//                  null, undefined, a bare string, a number) falls back to
//                  defaultProgress() WITHOUT throwing (the call is wrapped and a
//                  throw is a hard failure), and the result deep-equals defaults.
//
// Mirrors check-drill.ts / check-deck.ts: a self-contained tsx CLI that collects
// every failure, prints a grouped report with counts, then exits 0 (clean) or 1
// (any failure). Run via `npm run check:migration`.

import { defaultProgress, migrateProgress } from "../src/lib/progress";
import type { AttemptSummary, ProgressState } from "../src/lib/types";

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
      console.log("\nPASS: a v1 blob upgrades to v2 with no data loss, a v2 blob round-trips, and a corrupt / absent input falls back to defaults without throwing.");
      return;
    }
    let total = 0;
    console.error("\nFAIL: migration safety violations:");
    for (const [rule, items] of this.failures) {
      total += items.length;
      console.error(`  [${rule}] ${items.length}`);
      for (const d of items) console.error(`      - ${d}`);
    }
    console.error(`\n${total} violation(s) across ${this.failures.size} rule(s).`);
  }
}

// Structural deep equality over the JSON-shaped progress state (plain objects,
// arrays, and primitives — no Dates, Maps, or functions live in ProgressState).
// Used for the element-for-element array preservation and the "equals defaults"
// assertions; a stable key sort keeps object comparison order-independent.
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    const ak = Object.keys(ao).sort();
    const bk = Object.keys(bo).sort();
    if (ak.length !== bk.length) return false;
    if (!ak.every((k, i) => k === bk[i])) return false;
    return ak.every((k) => deepEqual(ao[k], bo[k]));
  }
  return false;
}

// A representative attempt summary, the shape the v1 store wrote.
function attempt(id: string): AttemptSummary {
  return {
    id,
    mode: "practice",
    domain: 1,
    percent: 70,
    total: 10,
    finishedAt: 1,
    durationSeconds: 60,
  };
}

function main(): void {
  const report = new Reporter();

  // ---- v1-no-loss: a populated v1 blob upgrades to v2, history intact ----
  // The four arrays carry real entries so "preserved element-for-element" is a
  // meaningful claim, not vacuously true over empty arrays.
  const v1CompletedLessons = ["intro", "ec2"];
  const v1FlaggedQuestions = ["d2-x-01"];
  const v1IncorrectQuestions = ["d3-y-02", "d1-z-03"];
  const v1Attempts = [attempt("a1"), attempt("a2")];
  const v1Blob = {
    version: 1,
    completedLessons: [...v1CompletedLessons],
    flaggedQuestions: [...v1FlaggedQuestions],
    incorrectQuestions: [...v1IncorrectQuestions],
    attempts: v1Attempts.map((a) => ({ ...a })),
  };
  // A frozen snapshot of the input to prove the migrator copies rather than
  // mutating the caller's blob (a mutation would corrupt history in place).
  const v1Snapshot = JSON.parse(JSON.stringify(v1Blob));

  const upgraded = migrateProgress(v1Blob);

  if (upgraded.version !== 2) {
    report.fail("v1-no-loss", `version should become 2 after upgrade, got ${upgraded.version}`);
  }
  if (!deepEqual(upgraded.completedLessons, v1CompletedLessons)) {
    report.fail("v1-no-loss", `completedLessons must be preserved element-for-element; got [${upgraded.completedLessons.join(", ")}]`);
  }
  if (!deepEqual(upgraded.flaggedQuestions, v1FlaggedQuestions)) {
    report.fail("v1-no-loss", `flaggedQuestions must be preserved element-for-element; got [${upgraded.flaggedQuestions.join(", ")}]`);
  }
  if (!deepEqual(upgraded.incorrectQuestions, v1IncorrectQuestions)) {
    report.fail("v1-no-loss", `incorrectQuestions must be preserved element-for-element; got [${upgraded.incorrectQuestions.join(", ")}]`);
  }
  if (!deepEqual(upgraded.attempts, v1Attempts)) {
    report.fail("v1-no-loss", `attempts must be preserved element-for-element; got ${upgraded.attempts.length} attempt(s)`);
  }
  // New v2 fields must be seeded with safe defaults, not left undefined.
  if (typeof upgraded.topicStats !== "object" || upgraded.topicStats === null) {
    report.fail("v1-no-loss", `topicStats should be seeded as an object on upgrade`);
  }
  if (!upgraded.flashcards || !Array.isArray(upgraded.flashcards.known) || !Array.isArray(upgraded.flashcards.learning)) {
    report.fail("v1-no-loss", `flashcards.known / flashcards.learning should be seeded as arrays on upgrade`);
  }
  if (upgraded.confidenceByQuestion === undefined) {
    report.fail("v1-no-loss", `confidenceByQuestion should be present (seeded) on upgrade`);
  }
  // The input blob must be untouched by the upgrade (the merge copies).
  if (!deepEqual(v1Blob, v1Snapshot)) {
    report.fail("v1-no-loss", `migrateProgress must not mutate its input blob (history corrupted in place)`);
  }

  // ---- v2-roundtrip: a populated v2 blob loads unchanged ----
  const v2Blob: ProgressState = {
    ...defaultProgress(),
    completedLessons: ["intro"],
    incorrectQuestions: ["d4-w-09"],
    topicStats: { pricing: { topic: "Pricing", seen: 4, correct: 1, lastSeen: 2 } },
    flashcards: { known: ["service:amazon-ec2"], learning: ["question:d1-iam-01"] },
    confidenceByQuestion: { "d1-iam-01": "unsure" },
  };
  const v2Snapshot = JSON.parse(JSON.stringify(v2Blob));
  const loaded = migrateProgress(v2Blob);
  if (loaded.version !== 2) {
    report.fail("v2-roundtrip", `version should stay 2 for a v2 blob, got ${loaded.version}`);
  }
  if (!deepEqual(loaded, v2Snapshot)) {
    report.fail("v2-roundtrip", `a v2 blob must load unchanged (populated fields preserved)`);
  }

  // ---- corrupt-default: unrecognized / absent input -> defaults, no throw ----
  // Each case is the kind of thing a hand-edited or stale blob deserializes to.
  // null / undefined model an absent blob; { version: 99 } an unknown future
  // version; the primitives model a non-object JSON payload. None may throw.
  const corruptCases: Array<{ label: string; input: unknown }> = [
    { label: "{ version: 99 }", input: { version: 99 } },
    { label: "null", input: null },
    { label: "undefined", input: undefined },
    { label: "empty object", input: {} },
    { label: "a bare string", input: "not-a-progress-state" },
    { label: "a number", input: 42 },
  ];
  const defaults = defaultProgress();
  for (const { label, input } of corruptCases) {
    let result: ProgressState | undefined;
    try {
      result = migrateProgress(input);
    } catch (err) {
      report.fail("corrupt-default", `migrateProgress(${label}) threw instead of defaulting: ${(err as Error).message}`);
      continue;
    }
    if (!deepEqual(result, defaults)) {
      report.fail("corrupt-default", `migrateProgress(${label}) should deep-equal defaultProgress()`);
    }
  }

  console.log("Migration safety: exercised migrateProgress / defaultProgress against synthetic v1, v2, and corrupt blobs.");
  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
