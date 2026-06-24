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

export function loadProgress(): ProgressState {
  const raw = canUseStorage() ? safeGet() : memoryFallback;
  if (!raw) return defaultProgress();
  try {
    // Parse loosely: a stored blob is untrusted input and may be any version
    // (or hand-edited), so read the version off an unknown shape before trusting
    // it. Both known versions merge OVER defaultProgress(), so a field added in
    // v2 is always present even when the stored blob predates it.
    const parsed = JSON.parse(raw) as Omit<Partial<ProgressState>, "version"> & {
      version?: number;
    };
    if (parsed && typeof parsed === "object") {
      // v1 -> v2 upgrade. Spread the stored payload over the v2 defaults to
      // KEEP every existing field (completedLessons, flaggedQuestions,
      // incorrectQuestions, attempts), then force version: 2 so the next save
      // persists as v2 and the stale v1 marker never round-trips. A returning
      // learner must not lose flagged/missed/attempt history on this bump.
      if (parsed.version === 1) {
        return { ...defaultProgress(), ...parsed, version: 2 };
      }
      // Native v2 load. Same merge so any field a forward-compatible blob omits
      // falls back to its default rather than landing undefined.
      if (parsed.version === 2) {
        return { ...defaultProgress(), ...parsed, version: 2 };
      }
    }
  } catch {
    // corrupt payload: start clean rather than crash
  }
  // Absent, unparseable, or an unrecognized version: safe defaults, never throw
  // into the UI.
  return defaultProgress();
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
