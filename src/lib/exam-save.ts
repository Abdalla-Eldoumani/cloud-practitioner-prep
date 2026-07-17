// The persisted shape of an in-progress mock exam, shared by the exam engine
// (which writes it every answer) and the resume banner on the home and practice
// pages (which only reads it). Living here keeps one definition of the storage
// key and the validity rules; neither island can drift from the other.
//
// The key is versioned: it bumped to :v2 when optionOrder joined the saved
// shape, so a pre-field in-flight save written by the older engine is simply
// not found and a fresh start is offered instead of a half-restore.
export const EXAM_KEY = "ccp-prep:exam-active:v2";

export interface SavedExam {
  questionIds: string[];
  // Per-question shuffled option order (question id -> ordered option ids),
  // persisted so a resumed mock renders the exact order shown before the
  // reload rather than reshuffling under the learner (quiz-integrity).
  // Scoring stays by id, so order never affects grading.
  optionOrder: Record<string, string[]>;
  answers: Record<string, string[]>;
  flags: string[];
  startedAt: number;
}

export function readSavedExam(): SavedExam | null {
  try {
    const raw = window.localStorage.getItem(EXAM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedExam;
    if (
      parsed &&
      Array.isArray(parsed.questionIds) &&
      parsed.startedAt &&
      // Require optionOrder to be a present object: a saved exam lacking it is
      // a pre-field blob (or hand-edited), so treat it as "no resume" rather
      // than half-restore with options reshuffled.
      parsed.optionOrder !== null &&
      typeof parsed.optionOrder === "object"
    ) {
      return parsed;
    }
  } catch {
    // ignore unreadable state
  }
  return null;
}

export function writeSavedExam(state: SavedExam): void {
  try {
    window.localStorage.setItem(EXAM_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable: resume simply will not be offered
  }
}

export function clearSavedExam(): void {
  try {
    window.localStorage.removeItem(EXAM_KEY);
  } catch {
    // ignore
  }
}

// How many of the saved attempt's questions carry at least one mark. The
// banner's honest facts line and the engine's resume affordances both quote
// this number, so it is computed one way.
export function savedAnsweredCount(saved: SavedExam): number {
  return saved.questionIds.filter((id) => (saved.answers?.[id] ?? []).length > 0)
    .length;
}

// Discarding an attempt is destructive, so it takes a typed word, not a click.
// Shared by every surface that can drop a saved attempt (the resume banner's
// Discard, starting a fresh exam over a live save).
export function confirmDiscardExam(): boolean {
  const typed = window.prompt(
    "This deletes the in-progress attempt and its answers. Type DISCARD to confirm.",
  );
  return typed !== null && typed.trim().toUpperCase() === "DISCARD";
}
