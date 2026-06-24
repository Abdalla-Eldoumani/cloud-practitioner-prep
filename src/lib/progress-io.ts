// Serialize and re-import the persisted progress blob as a JSON file the learner
// owns. Store-free and React-free (like topics.ts / review.ts): this is the pure
// serialize/validate core; the download/upload UI (Blob, <a download>, <input
// type="file">) lives in the island that consumes these.
//
// Import is UNTRUSTED INPUT — the file may be hand-edited, foreign, truncated, or
// an older version. So importProgress parses defensively (JSON.parse in a
// try/catch, never letting a throw reach the UI), rejects a non-object or an
// unrecognized version with a friendly error, and routes a plausible object
// through the SAME migrateProgress the app loads through, so a foreign/older/
// garbage blob upgrades to a safe current ProgressState or falls back to defaults
// rather than corrupting stored progress. migrateProgress is the single source of
// upgrade truth; its merge-over-defaults logic is NOT reimplemented here.
//
// Never `eval`. The caller renders any imported string (e.g. an error) as TEXT
// only — never innerHTML / dangerouslySetInnerHTML — so a forged file cannot
// inject markup.

import { migrateProgress } from "./progress";
import type { ProgressState } from "./types";

// The discriminated result of an import attempt: a safe migrated state on
// success, or a human-readable reason the file was refused on failure, so the
// caller can keep current progress and surface the message.
export type ImportResult =
  | { ok: true; state: ProgressState }
  | { ok: false; error: string };

// Serialize the full ProgressState to a JSON string. Pretty-printed (2-space
// indent) so the backup file is human-readable — a learner can open it and see
// their own progress. JSON.parse round-trips this back to a deep-equal object,
// and importProgress(exportProgress(s)) deep-equals s for any current v2 state
// (the migrator is identity-over-defaults on a well-formed v2 blob).
export function exportProgress(state: ProgressState): string {
  return JSON.stringify(state, null, 2);
}

// Parse and validate an untrusted progress file, returning a discriminated
// result rather than ever throwing. The validation gate is deliberately small —
// parse, reject non-objects, reject unknown versions — and then it delegates the
// actual shape normalization to migrateProgress so there is ONE upgrade code
// path (already exercised by check-migration.ts). A version other than 1 or 2 is
// refused here so a far-future or garbage version is a clear "unrecognized file"
// message rather than silently defaulting to an empty state and looking like a
// wipe.
export function importProgress(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Not valid JSON." };
  }
  if (parsed === null || typeof parsed !== "object") {
    return { ok: false, error: "Not a progress file." };
  }
  const version = (parsed as { version?: unknown }).version;
  if (version !== 1 && version !== 2) {
    return { ok: false, error: "Unrecognized progress version." };
  }
  // Plausible shape + known version: hand the unknown to the shared migrator,
  // which merges over defaults and forces version 2, so the imported state is
  // always a safe, current ProgressState.
  return { ok: true, state: migrateProgress(parsed) };
}
