// Round-trip and untrusted-input safety assertion for the progress export/import
// layer. It exercises the REAL exportProgress / importProgress from
// src/lib/progress-io.ts and defaultProgress from src/lib/progress.ts (never a
// reimplementation), so a pass is a guarantee about shipped behavior. Export/
// import is pure (JSON.stringify out; JSON.parse -> migrateProgress in), so it is
// testable without a browser or a DOM shim — the download/upload UI is separate.
// The standing rule is the reason this gate exists: a progress file is untrusted
// input, so import must round-trip without loss AND validate, never throwing into
// the UI and never silently wiping good progress.
//
// Assertions (all hard failures, collected and reported together):
//   round-trip          for representative populated states (one with completed
//                       lessons / incorrect / flagged / attempts / topicStats /
//                       flashcards, one with reviewSchedule + confidenceByQuestion
//                       set), importProgress(exportProgress(s)) is { ok: true } and
//                       its .state deep-equals s — lossless over the full current
//                       ProgressState shape, including the additive reviewSchedule.
//   untrusted-rejected  each of a malformed JSON string, "null", a bare number, a
//                       bare string, and an unknown version returns { ok: false }
//                       and does NOT throw (every call is wrapped; a throw is a
//                       hard failure). This is the don't-crash, don't-trust gate.
//   foreign-upgrades    a v1-shaped blob imports { ok: true } with state.version
//                       === 2 (upgraded through the same migrateProgress the app
//                       loads through) and its carried history is not lost.
//   safe-default-shape  a rejected import exposes no usable state — the failure
//                       result has ok === false and carries no `state` field, so a
//                       caller cannot accidentally read a partial/undefined state
//                       off a refused file (it keeps current progress instead).
//
// Mirrors check-migration.ts / check-drill.ts: a self-contained tsx CLI that
// collects every failure, prints a grouped report with counts, then exits 0
// (clean) or 1 (any failure). Run via `npm run check:progress-io`.

import { exportProgress, importProgress } from "../src/lib/progress-io";
import { defaultProgress } from "../src/lib/progress";
import type { ProgressState } from "../src/lib/types";

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
      console.log("\nPASS: progress export/import round-trips losslessly (including reviewSchedule), untrusted/corrupt input is rejected without throwing, and a v1 blob upgrades to version 2.");
      return;
    }
    let total = 0;
    console.error("\nFAIL: progress export/import violations:");
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
// Copied from check-migration.ts: these checks are self-contained CLIs with no
// shared import. A stable key sort keeps object comparison order-independent.
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

function main(): void {
  const report = new Reporter();

  // ---- round-trip: representative populated states survive a round-trip ----
  // Two states chosen to cover the full current shape between them: the first
  // exercises the union lists / attempts / topicStats / flashcards, the second
  // exercises the additive reviewSchedule and confidenceByQuestion. Each is built
  // from defaultProgress() so every field is present and the equality is a
  // meaningful "lossless" claim, not vacuously true over a near-empty default.
  const stateA: ProgressState = {
    ...defaultProgress(),
    completedLessons: ["intro", "ec2-fundamentals"],
    flaggedQuestions: ["d2-shared-responsibility-01"],
    incorrectQuestions: ["d3-ec2-04", "d1-economics-02"],
    attempts: [
      { id: "a1", mode: "exam", domain: "all", percent: 72, total: 65, finishedAt: 111, durationSeconds: 5400 },
      { id: "a2", mode: "practice", domain: 3, percent: 80, total: 10, finishedAt: 222, durationSeconds: 600 },
    ],
    topicStats: {
      pricing: { topic: "Pricing", seen: 8, correct: 5, lastSeen: 333 },
      iam: { topic: "IAM", seen: 4, correct: 4, lastSeen: 444 },
    },
    flashcards: {
      known: ["service:amazon-ec2", "service:aws-kms"],
      learning: ["question:d2-iam-01"],
      lastSeen: { "service:amazon-ec2": 555 },
    },
  };
  const stateB: ProgressState = {
    ...defaultProgress(),
    incorrectQuestions: ["d4-pricing-07"],
    flaggedQuestions: ["d4-pricing-07", "d2-iam-03"],
    confidenceByQuestion: {
      "d4-pricing-07": "guessing",
      "d2-iam-03": "unsure",
    },
    reviewSchedule: {
      "d4-pricing-07": { box: 0, due: 0, lastReviewed: 1000 },
      "d2-iam-03": { box: 2, due: 259200000, lastReviewed: 2000 },
    },
  };

  for (const [label, state] of [["populated", stateA], ["review-schedule", stateB]] as const) {
    // Snapshot the input independently of export so a (hypothetical) export
    // mutation could not hide a round-trip difference.
    const snapshot = JSON.parse(JSON.stringify(state));
    let result;
    try {
      result = importProgress(exportProgress(state));
    } catch (err) {
      report.fail("round-trip", `importProgress(exportProgress(${label})) threw: ${(err as Error).message}`);
      continue;
    }
    if (!result.ok) {
      report.fail("round-trip", `a valid ${label} state must round-trip { ok: true }, got error "${result.error}"`);
      continue;
    }
    if (!deepEqual(result.state, snapshot)) {
      report.fail("round-trip", `a valid ${label} state must round-trip deep-equal to itself (lossless), including every field`);
    }
  }

  // ---- untrusted-rejected: corrupt / foreign input refused, never throws ----
  // The kinds of payload a hand-edited, truncated, or foreign file deserializes
  // to. Each must return { ok: false } and MUST NOT throw — a throw would reach
  // the UI on import, which is the exact failure this layer exists to prevent.
  const rejectCases: Array<{ label: string; raw: string }> = [
    { label: "malformed JSON", raw: "{ not json" },
    { label: "JSON null", raw: "null" },
    { label: "a bare number", raw: "42" },
    { label: "a bare string", raw: '"a string"' },
    { label: "an empty object (no version)", raw: JSON.stringify({}) },
    { label: "an unknown version", raw: JSON.stringify({ version: 99 }) },
    { label: "an object with junk fields", raw: JSON.stringify({ version: 99, junk: true, nested: { x: [1, 2] } }) },
  ];
  for (const { label, raw } of rejectCases) {
    let result;
    try {
      result = importProgress(raw);
    } catch (err) {
      report.fail("untrusted-rejected", `importProgress(${label}) threw instead of returning { ok: false }: ${(err as Error).message}`);
      continue;
    }
    if (result.ok) {
      report.fail("untrusted-rejected", `importProgress(${label}) should be refused with { ok: false }, but it was accepted`);
      continue;
    }
    // ---- safe-default-shape: a refused import exposes no usable state ----
    // The failure branch must carry only an error string, never a `state`, so a
    // caller cannot read a partial/undefined progress off a rejected file.
    if ("state" in result) {
      report.fail("safe-default-shape", `a rejected import (${label}) must not expose a state field the caller could misuse`);
    }
    if (typeof result.error !== "string" || result.error.length === 0) {
      report.fail("untrusted-rejected", `importProgress(${label}) must carry a non-empty error message`);
    }
  }

  // ---- foreign-upgrades: a v1 blob imports and upgrades to version 2 ----
  // A real older export the learner might re-import: a v1-shaped blob with carried
  // history. It must import { ok: true }, be forced to version 2 through the shared
  // migrator, and not lose its history.
  const v1Raw = JSON.stringify({
    version: 1,
    completedLessons: ["intro"],
    flaggedQuestions: ["d2-x-01"],
    incorrectQuestions: ["d3-y-02", "d1-z-03"],
    attempts: [{ id: "old", mode: "practice", domain: 1, percent: 60, total: 10, finishedAt: 9, durationSeconds: 120 }],
  });
  let v1Result;
  try {
    v1Result = importProgress(v1Raw);
  } catch (err) {
    report.fail("foreign-upgrades", `importProgress(a v1 blob) threw: ${(err as Error).message}`);
    v1Result = undefined;
  }
  if (v1Result) {
    if (!v1Result.ok) {
      report.fail("foreign-upgrades", `a v1 blob must import { ok: true } (upgraded), got error "${v1Result.error}"`);
    } else {
      if (v1Result.state.version !== 2) {
        report.fail("foreign-upgrades", `an imported v1 blob must be upgraded to version 2, got ${v1Result.state.version}`);
      }
      if (!deepEqual(v1Result.state.incorrectQuestions, ["d3-y-02", "d1-z-03"]) || !deepEqual(v1Result.state.flaggedQuestions, ["d2-x-01"])) {
        report.fail("foreign-upgrades", `an imported v1 blob must not lose its flagged / missed history on upgrade`);
      }
      if (!deepEqual(v1Result.state.completedLessons, ["intro"])) {
        report.fail("foreign-upgrades", `an imported v1 blob must not lose its completedLessons on upgrade`);
      }
    }
  }

  console.log("Progress export/import: exercised exportProgress / importProgress against round-trip, untrusted, and v1 blobs.");
  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
