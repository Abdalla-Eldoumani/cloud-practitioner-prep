import type {
  AttemptAnswer,
  AttemptResult,
  AttemptSummary,
  Domain,
  DomainScore,
  Question,
  QuizMode,
  Readiness,
} from "./types";
import { DOMAINS } from "./constants";

// A response is correct only when the selected set equals the correct set.
// This matches the real exam: multiple-response items award no partial credit.
export function isAnswerCorrect(question: Question, selected: string[]): boolean {
  if (selected.length !== question.correct.length) return false;
  const want = new Set(question.correct);
  return selected.every((id) => want.has(id));
}

// Readiness is a conservative study signal, not the AWS scaled score.
// Bands sit above the rough passing line so a green result means real readiness.
export function readinessFromPercent(percent: number): Readiness {
  if (percent < 60) return "not-ready";
  if (percent < 75) return "building";
  if (percent < 85) return "on-track";
  return "exam-ready";
}

export function readinessLabel(r: Readiness): string {
  switch (r) {
    case "not-ready":
      return "Not ready yet";
    case "building":
      return "Building";
    case "on-track":
      return "On track";
    case "exam-ready":
      return "Exam ready";
  }
}

export function scoreAttempt(
  questions: Question[],
  answers: AttemptAnswer[],
  mode: QuizMode,
  durationSeconds: number,
): AttemptResult {
  const answerById = new Map(answers.map((a) => [a.questionId, a]));

  let correct = 0;
  const perDomain = new Map<Domain, { total: number; correct: number }>();
  for (const d of DOMAINS) perDomain.set(d.id, { total: 0, correct: 0 });

  for (const q of questions) {
    const bucket = perDomain.get(q.domain);
    if (bucket) bucket.total += 1;
    const a = answerById.get(q.id);
    const got = a ? isAnswerCorrect(q, a.selected) : false;
    if (got) {
      correct += 1;
      if (bucket) bucket.correct += 1;
    }
  }

  const total = questions.length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

  const byDomain: DomainScore[] = DOMAINS.map((d) => {
    const b = perDomain.get(d.id) ?? { total: 0, correct: 0 };
    return {
      domain: d.id,
      total: b.total,
      correct: b.correct,
      percent: b.total === 0 ? 0 : Math.round((b.correct / b.total) * 100),
    };
  });

  return {
    total,
    correct,
    percent,
    byDomain,
    readiness: readinessFromPercent(percent),
    mode,
    finishedAt: Date.now(),
    durationSeconds,
  };
}

// The mock score trend: exam attempts only, oldest-to-newest. recordAttempt
// persists attempts newest-first, but the trend reads left-to-right oldest-first
// (so a climbing score reads as climbing), hence the reverse. Copy before
// reversing so the caller's array is never mutated. This is the single source
// the trend view and its check both read, so the filter/order rule lives in one
// tested place rather than inline in the island.
export function mockTrend(attempts: AttemptSummary[]): AttemptSummary[] {
  return attempts.filter((a) => a.mode === "exam").slice().reverse();
}
