import { atom } from "nanostores";
import type {
  AttemptResult,
  Confidence,
  Domain,
  ProgressState,
} from "./types";
import { loadProgress, saveProgress } from "./progress";
import { nextEntry } from "./review";
import { normalizeTopic } from "./topics";

// Re-exported so existing importers keep `import { normalizeTopic } from
// "./store"` working. The definition lives in the store-free `topics.ts` so the
// pure assembly layer (exam.ts) can share the exact same key function without
// pulling nanostores into it.
export { normalizeTopic };

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

// Self-grade one flashcard: move its id into `flashcards.known` or
// `flashcards.learning`, removing it from the other so the two stay disjoint (a
// forged duplicate cannot double-count), and stamp `lastSeen[cardId]` for the
// later review schedule. One commit through commit(), so it persists via the
// same localStorage path and degrades to memory in private mode like the rest.
export function setFlashcardStatus(
  cardId: string,
  status: "known" | "learning",
): void {
  const cur = $progress.get();
  const known = new Set(cur.flashcards.known);
  const learning = new Set(cur.flashcards.learning);
  if (status === "known") {
    known.add(cardId);
    learning.delete(cardId);
  } else {
    learning.add(cardId);
    known.delete(cardId);
  }
  const lastSeen = { ...(cur.flashcards.lastSeen ?? {}) };
  lastSeen[cardId] = Date.now();
  commit({
    ...cur,
    flashcards: { known: [...known], learning: [...learning], lastSeen },
  });
}

// Grade one question in the review queue: advance its Leitner schedule entry via
// the pure nextEntry (correct promotes to a longer interval, wrong resets to box
// 0). One commit through commit(), so it persists via the same localStorage path
// and degrades to memory in private mode like every other mutation. The review
// flow calls this at reveal, where it knows the selected answer.
export function reviewQuestion(questionId: string, correct: boolean): void {
  const cur = $progress.get();
  const schedule = cur.reviewSchedule ?? {};
  const next = nextEntry(schedule[questionId], correct);
  commit({
    ...cur,
    reviewSchedule: { ...schedule, [questionId]: next },
  });
}

// Record that a finished mock drew these questions: bump each id's mockSeen
// count by one through commit(), so the next sitting's LRU draw prefers
// never-seen questions. Called once per FINISHED exam (the exam island wires it
// into finish(), gated to mode === "exam") — an abandoned exam leaves
// mockSeen untouched, so its questions stay fresh. An empty list is a no-op; a
// missing count starts at 0. One commit, same localStorage path, memory
// fallback in private mode like every other mutation.
export function recordMockSeen(questionIds: string[]): void {
  if (questionIds.length === 0) return;
  const cur = $progress.get();
  const mockSeen = { ...(cur.mockSeen ?? {}) };
  for (const id of questionIds) mockSeen[id] = (mockSeen[id] ?? 0) + 1;
  commit({ ...cur, mockSeen });
}

// Clearing from review removes a question from both lists, because the review
// set is the union of missed and flagged. Dropping only one would leave a
// question the reader marked as understood still sitting in the queue. Drop its
// schedule entry too: the entry only has meaning while the question is in the
// union, so keeping it would leak a stale id and grow the persisted blob without
// bound (a question is gone from review, yet still carries a box and due date).
export function clearMissed(questionId: string): void {
  const cur = $progress.get();
  const reviewSchedule = { ...(cur.reviewSchedule ?? {}) };
  delete reviewSchedule[questionId];
  commit({
    ...cur,
    incorrectQuestions: cur.incorrectQuestions.filter((id) => id !== questionId),
    flaggedQuestions: cur.flaggedQuestions.filter((id) => id !== questionId),
    reviewSchedule,
  });
}
