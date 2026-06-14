import { useCallback, useEffect, useMemo, useState } from "react";
import type { AttemptResult, Domain, Question, QuizMode } from "@/lib/types";
import { EXAM } from "@/lib/constants";
import { scoreAttempt } from "@/lib/scoring";
import {
  buildDomainQuiz,
  buildMockExam,
  buildReviewSet,
  shuffle,
} from "@/lib/exam";
import { $progress, clearMissed, recordAttempt, toggleFlag } from "@/lib/store";
import QuestionCard from "./QuestionCard";
import ResultsPanel from "./ResultsPanel";

interface QuizEngineProps {
  // The full question pool, serialized from the data layer by the Astro page.
  pool: Question[];
  mode: QuizMode;
  // practice: focus a single domain, or omit to mix all domains.
  domain?: Domain;
  // practice: how many questions to draw.
  count?: number;
  // exam: total questions. Defaults to the real exam count.
  examTotal?: number;
}

type Phase = "intro" | "active" | "results" | "empty";

// In-progress exams are saved so a refresh or accidental tab close can resume
// with the correct remaining time, computed from the start timestamp.
const EXAM_KEY = "ccp-prep:exam-active:v1";

interface SavedExam {
  questionIds: string[];
  answers: Record<string, string[]>;
  flags: string[];
  startedAt: number;
}

function readSavedExam(): SavedExam | null {
  try {
    const raw = window.localStorage.getItem(EXAM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedExam;
    if (parsed && Array.isArray(parsed.questionIds) && parsed.startedAt) {
      return parsed;
    }
  } catch {
    // ignore unreadable state
  }
  return null;
}

function writeSavedExam(state: SavedExam): void {
  try {
    window.localStorage.setItem(EXAM_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable: resume simply will not be offered
  }
}

function clearSavedExam(): void {
  try {
    window.localStorage.removeItem(EXAM_KEY);
  } catch {
    // ignore
  }
}

function reconstruct(pool: Question[], ids: string[]): Question[] {
  const byId = new Map(pool.map((q) => [q.id, q]));
  const out: Question[] = [];
  for (const id of ids) {
    const q = byId.get(id);
    if (q) out.push(q);
  }
  return out;
}

export default function QuizEngine({
  pool,
  mode,
  domain,
  count = 10,
  examTotal = EXAM.questionCount,
}: QuizEngineProps) {
  const [phase, setPhase] = useState<Phase>(mode === "exam" ? "intro" : "active");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [hasSaved, setHasSaved] = useState(false);

  // Build the working set for practice and review on mount. Exam waits for the
  // intro screen so the timer starts when the user is ready.
  const buildSet = useCallback((): Question[] => {
    if (mode === "exam") return buildMockExam(pool, examTotal);
    if (mode === "review") {
      const p = $progress.get();
      const ids = Array.from(
        new Set([...p.flaggedQuestions, ...p.incorrectQuestions]),
      );
      return buildReviewSet(pool, ids);
    }
    if (domain) return buildDomainQuiz(pool, domain, count);
    return shuffle(pool).slice(0, count);
  }, [mode, pool, examTotal, domain, count]);

  useEffect(() => {
    if (mode === "exam") {
      setHasSaved(readSavedExam() !== null);
      return;
    }
    const set = buildSet();
    if (set.length === 0) {
      setPhase("empty");
      return;
    }
    setQuestions(set);
    setStartedAt(Date.now());
  }, [mode, buildSet]);

  const recordDomain: Domain | "all" = mode === "exam" ? "all" : (domain ?? "all");

  const finish = useCallback(
    (qs: Question[], ans: Record<string, string[]>, started: number) => {
      const answerList = qs.map((q) => ({
        questionId: q.id,
        selected: ans[q.id] ?? [],
        flagged: !!flagged[q.id],
      }));
      const duration = Math.max(0, Math.round((Date.now() - started) / 1000));
      const r = scoreAttempt(qs, answerList, mode, duration);
      const missed = qs
        .filter((q) => {
          const sel = ans[q.id] ?? [];
          if (sel.length !== q.correct.length) return true;
          const want = new Set(q.correct);
          return !sel.every((id) => want.has(id));
        })
        .map((q) => q.id);
      recordAttempt(r, recordDomain, missed);
      setResult(r);
      setPhase("results");
      clearSavedExam();
    },
    [flagged, mode, recordDomain],
  );

  // Exam countdown. Remaining time is derived from the start timestamp, so a
  // throttled background tab still resolves to the correct value on return.
  const remaining =
    mode === "exam" && startedAt
      ? EXAM.timeLimitSeconds - Math.floor((now - startedAt) / 1000)
      : null;

  useEffect(() => {
    if (phase !== "active" || mode !== "exam" || startedAt === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [phase, mode, startedAt]);

  useEffect(() => {
    if (remaining !== null && remaining <= 0 && phase === "active") {
      finish(questions, answers, startedAt as number);
    }
  }, [remaining, phase, questions, answers, startedAt, finish]);

  // Persist exam progress so a refresh can resume.
  useEffect(() => {
    if (phase !== "active" || mode !== "exam" || startedAt === null) return;
    writeSavedExam({
      questionIds: questions.map((q) => q.id),
      answers,
      flags: Object.keys(flagged).filter((k) => flagged[k]),
      startedAt,
    });
  }, [phase, mode, questions, answers, flagged, startedAt]);

  const startExam = useCallback(() => {
    // A saved attempt would be silently overwritten by a fresh start, so
    // confirm before discarding it. window.confirm is fine for a static site.
    if (readSavedExam() !== null) {
      const ok = window.confirm(
        "Starting a new exam will discard your in-progress attempt. Continue?",
      );
      if (!ok) return;
    }
    clearSavedExam();
    const set = buildMockExam(pool, examTotal);
    setQuestions(set);
    setAnswers({});
    setFlagged({});
    setCurrent(0);
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    setPhase("active");
  }, [pool, examTotal]);

  const resumeExam = useCallback(() => {
    const saved = readSavedExam();
    if (!saved) return;
    const qs = reconstruct(pool, saved.questionIds);
    if (qs.length === 0) {
      clearSavedExam();
      setHasSaved(false);
      return;
    }
    const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000);
    setQuestions(qs);
    setAnswers(saved.answers ?? {});
    setFlagged(Object.fromEntries((saved.flags ?? []).map((id) => [id, true])));
    setStartedAt(saved.startedAt);
    setNow(Date.now());
    setCurrent(0);
    if (elapsed >= EXAM.timeLimitSeconds) {
      finish(qs, saved.answers ?? {}, saved.startedAt);
    } else {
      setPhase("active");
    }
  }, [pool, finish]);

  const onToggleOption = useCallback(
    (optionId: string) => {
      const q = questions[current];
      if (!q || revealed[q.id]) return;
      setAnswers((prev) => {
        const cur = prev[q.id] ?? [];
        let next: string[];
        if (q.type === "single") {
          next = [optionId];
        } else {
          next = cur.includes(optionId)
            ? cur.filter((id) => id !== optionId)
            : [...cur, optionId];
        }
        return { ...prev, [q.id]: next };
      });
    },
    [questions, current, revealed],
  );

  const onToggleFlag = useCallback(() => {
    const q = questions[current];
    if (!q) return;
    setFlagged((prev) => {
      const next = !prev[q.id];
      toggleFlag(q.id, next);
      return { ...prev, [q.id]: next };
    });
  }, [questions, current]);

  const reset = useCallback(() => {
    setResult(null);
    setAnswers({});
    setFlagged({});
    setRevealed({});
    setCurrent(0);
    if (mode === "exam") {
      setStartedAt(null);
      setPhase("intro");
      setHasSaved(false);
      return;
    }
    const set = buildSet();
    if (set.length === 0) {
      setPhase("empty");
      return;
    }
    setQuestions(set);
    setStartedAt(Date.now());
    setPhase("active");
  }, [mode, buildSet]);

  const answeredCount = useMemo(
    () => questions.filter((q) => (answers[q.id] ?? []).length > 0).length,
    [questions, answers],
  );

  // ---- render ----

  if (phase === "empty") {
    return (
      <div className="rounded-lg border border-hairline bg-raised p-8 text-center">
        <h2 className="text-xl font-semibold text-ink">Nothing to review yet</h2>
        <p className="mx-auto mt-2 max-w-prose text-ink-soft">
          Flag tricky questions or miss a few in practice and they will collect
          here for a focused review session.
        </p>
        <a
          href="/practice"
          className="mt-5 inline-block rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong"
        >
          Go to practice
        </a>
      </div>
    );
  }

  if (phase === "intro") {
    const mins = Math.round(EXAM.timeLimitSeconds / 60);
    return (
      <div className="rounded-lg border border-hairline bg-raised p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-ink">Full mock exam</h2>
        <p className="mt-2 text-ink-soft">
          {examTotal} questions, {mins} minutes, scored across all four domains.
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-ink-soft">
          <li>The timer runs continuously once you start.</li>
          <li>Move freely between questions and flag any to revisit.</li>
          <li>
            Every question here is scored so you get full feedback. On the real
            exam, 15 of the 65 questions are unscored and not identified.
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startExam}
            className="rounded-md bg-brand px-5 py-2.5 font-medium text-raised transition-colors hover:bg-brand-strong"
          >
            Start exam
          </button>
          {hasSaved && (
            <button
              type="button"
              onClick={resumeExam}
              className="rounded-md border border-hairline px-5 py-2.5 font-medium text-ink transition-colors hover:border-brand"
            >
              Resume in-progress exam
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "results" && result) {
    return (
      <div className="flex flex-col gap-6">
        <ResultsPanel result={result} onRetake={reset} />
        <details className="rounded-lg border border-hairline bg-raised p-5">
          <summary className="cursor-pointer font-semibold text-ink">
            Review every question
          </summary>
          <div className="mt-4 flex flex-col gap-4">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                selected={answers[q.id] ?? []}
                revealed
                flagged={!!flagged[q.id]}
                index={i}
                total={questions.length}
                onToggleOption={() => {}}
                onToggleFlag={() => {}}
              />
            ))}
          </div>
        </details>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;
  const isExam = mode === "exam";
  const isRevealed = !isExam && !!revealed[q.id];
  const selected = answers[q.id] ?? [];
  const isLast = current === questions.length - 1;
  const minutes = remaining !== null ? Math.floor(remaining / 60) : 0;
  const seconds = remaining !== null ? remaining % 60 : 0;
  const lowTime = remaining !== null && remaining <= 300;

  return (
    <div className="flex flex-col gap-5">
      {isExam && remaining !== null && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-raised px-4 py-2.5">
          <span className="text-sm text-ink-soft">
            {answeredCount} of {questions.length} answered
          </span>
          <span
            className={`font-mono text-lg font-semibold tabular-nums ${
              lowTime ? "text-danger" : "text-ink"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      )}

      {!isExam && (
        <div className="h-1.5 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full bg-brand transition-[width]"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      )}

      <QuestionCard
        question={q}
        selected={selected}
        revealed={isRevealed}
        flagged={!!flagged[q.id]}
        index={current}
        total={questions.length}
        onToggleOption={onToggleOption}
        onToggleFlag={onToggleFlag}
      />

      {!isExam && (
        <div className="flex flex-wrap items-center gap-3">
          {!isRevealed ? (
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => setRevealed((r) => ({ ...r, [q.id]: true }))}
              className="rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check answer
            </button>
          ) : (
            <>
              {mode === "review" && (
                <button
                  type="button"
                  onClick={() => clearMissed(q.id)}
                  className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-correct hover:text-correct"
                >
                  Clear from review
                </button>
              )}
              {!isLast ? (
                <button
                  type="button"
                  onClick={() => setCurrent((c) => c + 1)}
                  className="rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong"
                >
                  Next question
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => finish(questions, answers, startedAt as number)}
                  className="rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong"
                >
                  See results
                </button>
              )}
            </>
          )}
        </div>
      )}

      {isExam && (
        <>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {!isLast ? (
              <button
                type="button"
                onClick={() =>
                  setCurrent((c) => Math.min(questions.length - 1, c + 1))
                }
                className="rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => finish(questions, answers, startedAt as number)}
                className="rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong"
              >
                Submit exam
              </button>
            )}
          </div>

          <nav aria-label="Jump to question">
            <ul className="flex flex-wrap gap-1.5">
              {questions.map((qq, i) => {
                const isAnswered = (answers[qq.id] ?? []).length > 0;
                const isCurrent = i === current;
                const isFlagged = !!flagged[qq.id];
                // State must not ride on color alone (design-system rule), so
                // each button carries a spoken state and a shape marker: a flag
                // glyph for flagged, a filled dot for answered.
                const state = isFlagged
                  ? "flagged"
                  : isAnswered
                    ? "answered"
                    : "not answered";
                return (
                  <li key={qq.id}>
                    <button
                      type="button"
                      onClick={() => setCurrent(i)}
                      aria-current={isCurrent ? "true" : undefined}
                      aria-label={`Question ${i + 1}, ${state}`}
                      className={`relative h-9 w-9 rounded-md border text-sm font-medium transition-colors ${
                        isCurrent
                          ? "border-brand bg-brand text-raised"
                          : isFlagged
                            ? "border-flag text-flag"
                            : isAnswered
                              ? "border-brand bg-info-soft text-brand"
                              : "border-hairline text-ink-soft hover:border-brand"
                      }`}
                    >
                      {i + 1}
                      {isFlagged && (
                        <span
                          aria-hidden="true"
                          className="absolute -right-0.5 -top-0.5 text-[10px] leading-none"
                        >
                          &#9873;
                        </span>
                      )}
                      {!isFlagged && isAnswered && !isCurrent && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
              <span>&#9873; flagged</span>
              <span>&bull; answered</span>
              <span>no mark: not answered</span>
            </p>
          </nav>

          <button
            type="button"
            onClick={() => finish(questions, answers, startedAt as number)}
            className="self-start text-sm font-medium text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            Submit exam now
          </button>
        </>
      )}
    </div>
  );
}
