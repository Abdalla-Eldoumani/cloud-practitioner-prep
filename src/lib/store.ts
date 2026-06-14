import { atom } from "nanostores";
import type { AttemptResult, Domain, ProgressState } from "./types";
import { loadProgress, saveProgress } from "./progress";

// Single source of truth for client-side progress. Islands subscribe via
// @nanostores/react useStore, so a change in one island (mark a lesson done)
// updates every other island reading the same atom.
export const $progress = atom<ProgressState>(loadProgress());

function commit(next: ProgressState): void {
  $progress.set(next);
  saveProgress(next);
}

export function markLessonComplete(slug: string, done = true): void {
  const cur = $progress.get();
  const set = new Set(cur.completedLessons);
  if (done) set.add(slug);
  else set.delete(slug);
  commit({ ...cur, completedLessons: [...set] });
}

export function toggleFlag(questionId: string, flagged: boolean): void {
  const cur = $progress.get();
  const set = new Set(cur.flaggedQuestions);
  if (flagged) set.add(questionId);
  else set.delete(questionId);
  commit({ ...cur, flaggedQuestions: [...set] });
}

export function recordAttempt(
  result: AttemptResult,
  domain: Domain | "all",
  missedQuestionIds: string[],
): void {
  const cur = $progress.get();
  const missed = new Set(cur.incorrectQuestions);
  for (const id of missedQuestionIds) missed.add(id);
  const attempt = {
    id: `${result.mode}-${result.finishedAt}`,
    mode: result.mode,
    domain,
    percent: result.percent,
    total: result.total,
    finishedAt: result.finishedAt,
    durationSeconds: result.durationSeconds,
  };
  commit({
    ...cur,
    incorrectQuestions: [...missed],
    attempts: [attempt, ...cur.attempts].slice(0, 100),
  });
}

// Clearing from review removes a question from both lists, because the review
// set is the union of missed and flagged. Dropping only one would leave a
// question the reader marked as understood still sitting in the queue.
export function clearMissed(questionId: string): void {
  const cur = $progress.get();
  commit({
    ...cur,
    incorrectQuestions: cur.incorrectQuestions.filter((id) => id !== questionId),
    flaggedQuestions: cur.flaggedQuestions.filter((id) => id !== questionId),
  });
}
