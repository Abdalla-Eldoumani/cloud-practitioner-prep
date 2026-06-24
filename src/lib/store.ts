import { atom } from "nanostores";
import type {
  AttemptResult,
  Confidence,
  Domain,
  ProgressState,
} from "./types";
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

// Topic key for the rolling per-topic stats. The bank has casing collisions
// (e.g. "Consolidated billing" vs "Consolidated Billing") that would otherwise
// fork into two buckets, so a topic is keyed by its trimmed, lowercased form.
// The human-readable label is kept on the stored stat (first-seen casing). The
// adaptive drill builder reuses this exact function so both agree on keys.
export function normalizeTopic(topic: string): string {
  return topic.trim().toLowerCase();
}

// One question's outcome in a sitting: which topic/domain it belongs to, whether
// it was answered correctly, and the pre-reveal confidence if one was captured.
export interface QuestionResult {
  questionId: string;
  topic: string;
  domain: Domain;
  correct: boolean;
  confidence?: Confidence;
}

// Fold a sitting's per-question outcomes into the v2 store: accumulate rolling
// per-topic accuracy and record the latest pre-reveal confidence per question.
// Called alongside recordAttempt at finish; the attempt summary stays its job.
// One commit through commit() so it persists via the same localStorage path and
// no progress is duplicated in component state.
export function recordQuestionResults(results: QuestionResult[]): void {
  if (results.length === 0) return;
  const cur = $progress.get();
  const topicStats = { ...cur.topicStats };
  const confidenceByQuestion = { ...(cur.confidenceByQuestion ?? {}) };
  const now = Date.now();

  for (const r of results) {
    const key = normalizeTopic(r.topic);
    const prev = topicStats[key] ?? { topic: r.topic, seen: 0, correct: 0 };
    topicStats[key] = {
      // Keep the first-seen human-readable label, not a later casing variant.
      topic: prev.topic,
      seen: prev.seen + 1,
      correct: prev.correct + (r.correct ? 1 : 0),
      lastSeen: now,
    };
    if (r.confidence !== undefined) {
      confidenceByQuestion[r.questionId] = r.confidence;
    }
  }

  commit({ ...cur, topicStats, confidenceByQuestion });
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
