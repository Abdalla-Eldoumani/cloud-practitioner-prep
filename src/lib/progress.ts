import type { ProgressState } from "./types";

const KEY = "ccp-prep:progress:v1";

export function defaultProgress(): ProgressState {
  return {
    version: 2,
    completedLessons: [],
    flaggedQuestions: [],
    incorrectQuestions: [],
    attempts: [],
    topicStats: {},
    flashcards: { known: [], learning: [] },
    confidenceByQuestion: {},
    reviewSchedule: {},
  };
}

// localStorage can be absent (SSR), disabled, or throw in private mode. Probe once
// and fall back to an in-memory store so the app stays usable, warning the user
// elsewhere that progress will not persist.
let storageWorks: boolean | null = null;
let memoryFallback: string | null = null;

function canUseStorage(): boolean {
  if (storageWorks !== null) return storageWorks;
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      storageWorks = false;
      return false;
    }
    const probe = "__ccp_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    storageWorks = true;
  } catch {
    storageWorks = false;
  }
  return storageWorks;
}

export function storageAvailable(): boolean {
  return canUseStorage();
}

// Upgrade an already-parsed, untrusted blob to a current ProgressState. Kept
// pure and window-free (it takes the parsed value, not raw storage) so the same
// shipped logic is exercisable without a DOM: loadProgress parses then delegates
// here, and the migration check drives this directly. A stored blob may be any
// version or hand-edited, so the version is read off an unknown shape before it
// is trusted, and both known versions merge OVER defaultProgress() so a field
// added in v2 is always present even when the stored blob predates it.
export function migrateProgress(parsed: unknown): ProgressState {
  if (parsed && typeof parsed === "object") {
    const blob = parsed as Omit<Partial<ProgressState>, "version"> & {
      version?: number;
    };
    // v1 -> v2 upgrade. Spread the stored payload over the v2 defaults to
    // KEEP every existing field (completedLessons, flaggedQuestions,
    // incorrectQuestions, attempts), then force version: 2 so the next save
    // persists as v2 and the stale v1 marker never round-trips. A returning
    // learner must not lose flagged/missed/attempt history on this bump.
    if (blob.version === 1) {
      return { ...defaultProgress(), ...blob, version: 2 };
    }
    // Native v2 load. Same merge so any field a forward-compatible blob omits
    // falls back to its default rather than landing undefined.
    if (blob.version === 2) {
      return { ...defaultProgress(), ...blob, version: 2 };
    }
  }
  // null, a non-object, or an unrecognized version: safe defaults.
  return defaultProgress();
}

export function loadProgress(): ProgressState {
  const raw = canUseStorage() ? safeGet() : memoryFallback;
  if (!raw) return defaultProgress();
  try {
    // Parse loosely (untrusted input), then hand the unknown to the pure
    // migrator so the upgrade path the check exercises is identical to shipped.
    return migrateProgress(JSON.parse(raw));
  } catch {
    // corrupt payload: start clean rather than crash, never throw into the UI.
    return defaultProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  const raw = JSON.stringify(state);
  if (canUseStorage()) safeSet(raw);
  else memoryFallback = raw;
}

function safeGet(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function safeSet(raw: string): void {
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    // storage went away mid-session: degrade to memory
    storageWorks = false;
    memoryFallback = raw;
  }
}

export function clearProgress(): void {
  memoryFallback = null;
  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }
}
