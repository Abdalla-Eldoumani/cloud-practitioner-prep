import type { ProgressState } from "./types";

const KEY = "ccp-prep:progress:v1";

export function defaultProgress(): ProgressState {
  return {
    version: 1,
    completedLessons: [],
    flaggedQuestions: [],
    incorrectQuestions: [],
    attempts: [],
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
    const parsed = JSON.parse(raw) as ProgressState;
    if (parsed && parsed.version === 1) return { ...defaultProgress(), ...parsed };
  } catch {
    // corrupt payload: start clean rather than crash
  }
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
