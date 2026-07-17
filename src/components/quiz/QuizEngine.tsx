import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AttemptResult,
  Confidence,
  Domain,
  Question,
  QuizMode,
} from "@/lib/types";
import { EXAM } from "@/lib/constants";
import { isAnswerCorrect, scoreAttempt } from "@/lib/scoring";
import {
  buildDomainQuiz,
  buildDrill,
  buildMockExam,
  remainingSeconds,
  shuffle,
} from "@/lib/exam";
import { orderedOptions } from "@/lib/options";
import { orderReviewQueue } from "@/lib/review";
import {
  $progress,
  clearMissed,
  recordAttempt,
  recordMockSeen,
  recordQuestionResults,
  reviewQuestion,
  toggleFlag,
} from "@/lib/store";
import {
  clearSavedExam,
  confirmDiscardExam,
  readSavedExam,
  writeSavedExam,
} from "@/lib/exam-save";
import ExamBar from "./ExamBar";
import MarkSheet, { type MarkCell } from "./MarkSheet";
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

// In-progress exams are saved (through the shared exam-save module, which the
// resume banner also reads) so a refresh or accidental tab close can resume
// with the correct remaining time, computed from the start timestamp.

function reconstruct(pool: Question[], ids: string[]): Question[] {
  const byId = new Map(pool.map((q) => [q.id, q]));
  const out: Question[] = [];
  for (const id of ids) {
    const q = byId.get(id);
    if (q) out.push(q);
  }
  return out;
}

// Compute a stable per-question option order for a drawn set: call orderedOptions
// once per question (the single shuffle path) and keep only the ordered ids. Run
// once when an exam set is established so the order persists for the sitting and
// is what gets saved/restored — never recomputed on a re-render.
function computeOptionOrder(qs: Question[]): Record<string, string[]> {
  const order: Record<string, string[]> = {};
  for (const q of qs) order[q.id] = orderedOptions(q).map((o) => o.id);
  return order;
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
  // Per-question option order (question id -> ordered option ids), computed once
  // per sitting so a re-render never reshuffles, persisted with the saved exam,
  // and restored verbatim on resume. Only populated for exam mode, which needs
  // the exact order saved and restored; every other mode relies on
  // QuestionCard's own per-instance shuffle fallback, which draws through the
  // same orderedOptions path, so an unshuffled authored order can never render.
  const [optionOrder, setOptionOrder] = useState<Record<string, string[]>>({});
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  // Pre-reveal confidence per question, transient for the sitting. Folded into
  // the recorded attempt at finish; never duplicated into persisted progress
  // here (the store owns that). Captured before reveal by the Check-answer gate.
  const [confidence, setConfidence] = useState<Record<string, Confidence>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  // The weak topics a drill was built from, by display label, so the run can
  // name them ("Drilling: …") — the transparency requirement. Empty in other
  // modes and on a cold-start drill that fell back to a mixed draw.
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [hasSaved, setHasSaved] = useState(false);
  // Exam-room surfaces: the mark-sheet rail (wide viewports, on by default),
  // the mark-sheet bottom sheet (below 1200, opened on demand), and the
  // guarded submit confirm bar — the only place a primary submit exists.
  const [gridOn, setGridOn] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const autoResumed = useRef(false);

  // Build the working set for practice and review on mount. Exam waits for the
  // intro screen so the timer starts when the user is ready.
  const buildSet = useCallback((): Question[] => {
    // Pass the learner's mock seen-counts (read from the store at draw time,
    // mirroring how review/drill read $progress here) so each new sitting draws
    // with low overlap, preferring never-seen questions.
    if (mode === "exam")
      return buildMockExam(pool, examTotal, $progress.get().mockSeen);
    if (mode === "review") {
      const p = $progress.get();
      // The review set is the deduplicated union of flagged and missed questions
      // (a question that is both appears once). Order that union by the spaced-
      // repetition schedule so the soonest-due / weakest questions surface first;
      // orderReviewQueue returns a permutation of the ids (never drops one), and
      // reconstruct maps each id to its question in that order, skipping any id no
      // longer in the pool. An empty union yields an empty set -> the empty phase.
      const ids = Array.from(
        new Set([...p.flaggedQuestions, ...p.incorrectQuestions]),
      );
      return reconstruct(pool, orderReviewQueue(ids, p.reviewSchedule ?? {}));
    }
    if (mode === "drill") {
      // Build the set from the learner's weakest topics, read from the store at
      // build time (mirroring review). buildDrill guards on a seen threshold and
      // falls back to a mixed draw on cold start, so this is never empty for a
      // non-empty pool. Stash the chosen topics so the run can name them.
      const { questions, weakTopics: topics } = buildDrill(
        pool,
        $progress.get(),
        count,
      );
      setWeakTopics(topics);
      return questions;
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

  // Exam and drill are cross-domain by nature, so they record under "all"; a
  // focused practice run records its own domain.
  const recordDomain: Domain | "all" =
    mode === "exam" || mode === "drill" ? "all" : (domain ?? "all");

  const finish = useCallback(
    (qs: Question[], ans: Record<string, string[]>, started: number) => {
      const answerList = qs.map((q) => ({
        questionId: q.id,
        selected: ans[q.id] ?? [],
        flagged: !!flagged[q.id],
      }));
      const duration = Math.max(0, Math.round((Date.now() - started) / 1000));
      const r = scoreAttempt(qs, answerList, mode, duration);
      const missedSet = new Set(
        qs
          .filter((q) => {
            const sel = ans[q.id] ?? [];
            if (sel.length !== q.correct.length) return true;
            const want = new Set(q.correct);
            return !sel.every((id) => want.has(id));
          })
          .map((q) => q.id),
      );
      recordAttempt(r, recordDomain, [...missedSet]);
      // Fold per-question topic/correctness/confidence into the v2 store so the
      // adaptive drill can later weight confident-but-wrong topics. Confidence
      // is the pre-reveal value captured in island state.
      recordQuestionResults(
        qs.map((q) => ({
          questionId: q.id,
          topic: q.topic,
          domain: q.domain,
          correct: !missedSet.has(q.id),
          confidence: confidence[q.id],
        })),
      );
      // A finished mock bumps each drawn question's seen-count exactly once, so
      // the next sitting's LRU draw prefers never-seen questions. Gated to exam:
      // an abandoned exam never reaches finish() so its questions stay fresh, and
      // practice/drill/review must never touch mockSeen. Covers both the manual
      // submit and the auto-submit effect (both call finish()).
      if (mode === "exam") {
        recordMockSeen(qs.map((q) => q.id));
      }
      setResult(r);
      setPhase("results");
      setConfirmOpen(false);
      setSheetOpen(false);
      clearSavedExam();
    },
    [flagged, mode, recordDomain, confidence],
  );

  // Exam countdown. Remaining time is derived from the start timestamp, so a
  // throttled background tab still resolves to the correct value on return. Uses
  // the pure remainingSeconds helper so the island and the auto-submit check
  // share one expression; behavior is identical to the prior inline form.
  const remaining =
    mode === "exam" && startedAt
      ? remainingSeconds(EXAM.timeLimitSeconds, startedAt, now)
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

  // Persist exam progress so a refresh can resume. optionOrder is saved with the
  // rest so resume restores the exact shown order rather than reshuffling.
  useEffect(() => {
    if (phase !== "active" || mode !== "exam" || startedAt === null) return;
    writeSavedExam({
      questionIds: questions.map((q) => q.id),
      optionOrder,
      answers,
      flags: Object.keys(flagged).filter((k) => flagged[k]),
      startedAt,
    });
  }, [phase, mode, questions, optionOrder, answers, flagged, startedAt]);

  const startExam = useCallback(() => {
    // A saved attempt would be silently overwritten by a fresh start, and
    // dropping it is destructive, so it takes the typed word.
    if (readSavedExam() !== null && !confirmDiscardExam()) return;
    clearSavedExam();
    // Draw with the learner's seen-counts for low cross-sitting overlap, then fix
    // the per-question option order once so it stays stable for the sitting and
    // is what gets persisted/restored.
    const set = buildMockExam(pool, examTotal, $progress.get().mockSeen);
    setQuestions(set);
    setOptionOrder(computeOptionOrder(set));
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
    // Restore the saved per-question option order verbatim so the resumed mock
    // shows the exact order from before the reload (no fresh shuffle).
    setOptionOrder(saved.optionOrder ?? {});
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

  // Deep link from the resume banner: /practice/exam/#resume skips the gate
  // and restores the saved attempt directly. A hash rather than a query so
  // the service worker's navigation fallback still precache-matches the URL.
  // Once per page load; a fresh start after results must land on the gate,
  // not re-resume.
  useEffect(() => {
    if (autoResumed.current || mode !== "exam") return;
    autoResumed.current = true;
    if (window.location.hash === "#resume" && readSavedExam() !== null) {
      resumeExam();
    }
  }, [mode, resumeExam]);

  const isExamActive = mode === "exam" && phase === "active";

  // While an attempt is live the island owns the viewport: the flag on <html>
  // sends the site chrome away (see the exam-room block in the stylesheet)
  // and everything reverses when the attempt ends.
  useEffect(() => {
    const root = document.documentElement;
    if (isExamActive) root.setAttribute("data-exam-active", "");
    else root.removeAttribute("data-exam-active");
    return () => root.removeAttribute("data-exam-active");
  }, [isExamActive]);

  // Exam start lands focus on the first option, so keyboard sitters can mark
  // immediately.
  useEffect(() => {
    if (!isExamActive) return;
    const id = window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLInputElement>("[data-exam-root] fieldset input")
        ?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [isExamActive]);

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

  // Room keys: F flags the question, G toggles the mark sheet (the rail at
  // wide viewports, the bottom sheet below 1200), Escape backs out of the
  // confirm bar or the sheet. Text-entry targets keep their keystrokes (the
  // command palette stays usable mid-exam); option marks are inputs too, so
  // radio/checkbox targets still get the keys.
  useEffect(() => {
    if (!isExamActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        if (target.tagName === "TEXTAREA" || target.isContentEditable) return;
        if (
          target.tagName === "INPUT" &&
          (target as HTMLInputElement).type !== "radio" &&
          (target as HTMLInputElement).type !== "checkbox"
        ) {
          return;
        }
      }
      if (e.key === "f" || e.key === "F") {
        onToggleFlag();
      } else if (e.key === "g" || e.key === "G") {
        if (window.matchMedia("(min-width: 1200px)").matches) {
          setGridOn((v) => !v);
        } else {
          setSheetOpen((v) => !v);
        }
      } else if (e.key === "Escape") {
        if (confirmOpen) setConfirmOpen(false);
        else if (sheetOpen) setSheetOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isExamActive, onToggleFlag, confirmOpen, sheetOpen]);

  const reset = useCallback(() => {
    setResult(null);
    setAnswers({});
    setFlagged({});
    setRevealed({});
    setConfidence({});
    setOptionOrder({});
    setCurrent(0);
    setGridOn(true);
    setSheetOpen(false);
    setConfirmOpen(false);
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

  const flaggedCount = useMemo(
    () => questions.filter((q) => flagged[q.id]).length,
    [questions, flagged],
  );

  // ---- render ----

  if (phase === "empty") {
    // The empty copy is mode-aware: a drill with no history yet explains how to
    // build one, while review explains how the queue fills. Both land on the
    // same shipped panel idiom and link back to practice.
    const isDrill = mode === "drill";
    const emptyHeading = isDrill
      ? "Not enough history yet"
      : "Nothing to review yet";
    const emptyBody = isDrill
      ? "Answer a practice set or two and your weakest topics will surface here for a focused drill."
      : "Flag tricky questions or miss a few in practice and they will collect here for a focused review session.";
    return (
      <div className="rounded-lg border border-hairline bg-raised p-8 text-center">
        <h2 className="text-xl font-semibold text-ink">{emptyHeading}</h2>
        <p className="mx-auto mt-2 max-w-prose text-ink-soft">{emptyBody}</p>
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
      <div className="mx-auto mt-8 w-full max-w-[760px]">
        <div className="rounded-r3 border border-line-1 bg-ground-1 p-6 sm:p-8">
          <h2 className="t-title text-ink-1">Full mock exam</h2>
          <p className="t-mono mt-2 uppercase text-ink-3">
            {examTotal} questions · {mins} min · all four domains
          </p>
          <ul className="t-body mt-5 flex flex-col gap-2 text-ink-2">
            <li>The timer runs continuously once you start.</li>
            <li>Move freely between questions and flag any to revisit.</li>
            <li>
              Every question here is scored so you get full feedback. On the
              real exam, 15 of the 65 questions are unscored and not
              identified.
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={startExam} className="btn-primary">
              Start exam
            </button>
            {hasSaved && (
              <button
                type="button"
                onClick={resumeExam}
                className="btn-secondary"
              >
                Resume in-progress exam
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results" && result) {
    return (
      <div
        className={`flex flex-col gap-6 ${
          mode === "exam" ? "mx-auto mt-8 w-full max-w-[880px]" : ""
        }`}
      >
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
                optionOrder={optionOrder[q.id]}
                showConfidence={false}
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

  if (isExam) {
    const cells: MarkCell[] = questions.map((qq, i) => ({
      id: qq.id,
      n: i + 1,
      answered: (answers[qq.id] ?? []).length > 0,
      flagged: !!flagged[qq.id],
      current: i === current,
    }));
    const blank = questions.length - answeredCount;
    const openConfirm = () => setConfirmOpen(true);
    const jumpTo = (i: number) => {
      setCurrent(i);
      setSheetOpen(false);
    };
    const goPrev = () => setCurrent((c) => Math.max(0, c - 1));
    const goNext = () =>
      setCurrent((c) => Math.min(questions.length - 1, c + 1));

    return (
      <div data-exam-root>
        <ExamBar
          remaining={remaining ?? 0}
          answered={answeredCount}
          total={questions.length}
          flaggedCount={flaggedCount}
          gridOn={gridOn}
          onToggleGrid={() => {
            if (window.matchMedia("(min-width: 1200px)").matches) {
              setGridOn((v) => !v);
            } else {
              setSheetOpen((v) => !v);
            }
          }}
          onSubmit={openConfirm}
        />

        <div className="mx-auto flex w-full max-w-[1200px] justify-center gap-12 px-[18px] pt-5 pb-28 sm:px-6 sm:pt-10 min-[1920px]:max-w-[1280px] xl:px-12">
          <div className="exam-q-in w-full min-w-0 max-w-[880px] min-[1920px]:max-w-[920px]">
            <QuestionCard
              question={q}
              selected={selected}
              revealed={false}
              flagged={!!flagged[q.id]}
              index={current}
              total={questions.length}
              onToggleOption={onToggleOption}
              onToggleFlag={onToggleFlag}
              optionOrder={optionOrder[q.id]}
              showConfidence={false}
              examRoom
              footer={
                <div className="mt-7 hidden items-center justify-between gap-3 border-t border-line-1 pt-[22px] sm:flex">
                  <button
                    type="button"
                    disabled={current === 0}
                    onClick={goPrev}
                    className="btn-ghost disabled:cursor-not-allowed disabled:opacity-[0.38]"
                  >
                    &larr; Previous
                  </button>
                  {isLast ? (
                    <button
                      type="button"
                      onClick={openConfirm}
                      className="btn-primary"
                    >
                      Submit exam
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      className="btn-primary"
                    >
                      Next &rarr;
                    </button>
                  )}
                </div>
              }
            />
          </div>

          {gridOn && (
            <div className="hidden w-[272px] flex-none min-[1200px]:block min-[1920px]:w-[288px]">
              <div className="sticky top-20">
                <MarkSheet cells={cells} onJump={jumpTo} variant="rail" />
              </div>
            </div>
          )}
        </div>

        <MarkSheet
          cells={cells}
          onJump={jumpTo}
          variant="sheet"
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSubmit={() => {
            setSheetOpen(false);
            setConfirmOpen(true);
          }}
          answered={answeredCount}
          total={questions.length}
        />

        {/* Bottom action bar: 48px thumb targets pinned to the bottom on
            phones. The flag square replaces the card's flag chip there. */}
        {!confirmOpen && (
          <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2.5 border-t border-line-1 bg-ground-1 px-4 pt-3 pb-5 sm:hidden">
            <button
              type="button"
              onClick={onToggleFlag}
              aria-pressed={!!flagged[q.id]}
              aria-label={
                flagged[q.id]
                  ? "Remove the flag from this question"
                  : "Flag this question"
              }
              className={`flex size-12 flex-none items-center justify-center rounded-r1 border transition-colors ${
                flagged[q.id]
                  ? "border-flag-line bg-flag-fill text-flag"
                  : "border-line-1 text-ink-2"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill={flagged[q.id] ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3.5 14.5V2.5" />
                <path d="M3.5 3h8.5l-2.2 2.8L12 8.5H3.5" />
              </svg>
            </button>
            <button
              type="button"
              disabled={current === 0}
              onClick={goPrev}
              className="btn-secondary inline-flex h-12 flex-1 items-center justify-center disabled:cursor-not-allowed disabled:opacity-[0.38]"
            >
              &larr; Prev
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={openConfirm}
                className="btn-primary inline-flex h-12 flex-[1.6] items-center justify-center"
              >
                Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="btn-primary inline-flex h-12 flex-[1.6] items-center justify-center"
              >
                Next &rarr;
              </button>
            )}
          </div>
        )}

        {/* The guarded submit: facts first, then the only primary submit in
            the room. Auto-submit at 0:00 runs the same finish sequence. */}
        {confirmOpen && (
          <div className="exam-confirm-in fixed inset-x-0 bottom-0 z-40 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line-2 bg-ground-2 px-[18px] py-4 sm:px-7">
            <span className="font-mono text-xs uppercase tabular-nums text-ink-1">
              {answeredCount} of {questions.length} answered · {flaggedCount}{" "}
              flagged · {blank} blank will score zero
            </span>
            <span className="ml-auto flex items-center gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmOpen(false)}
                className="btn-ghost"
              >
                Keep working
              </button>
              <button
                type="button"
                onClick={() =>
                  finish(questions, answers, startedAt as number)
                }
                className="btn-primary"
              >
                Submit now
              </button>
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {!isExam && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* The set rail: one tick per question in the set. The current tick
              reads blueprint, checked answers settle to their verdict, and the
              rest wait as faint structure. Never color alone: the mono count
              beside it carries the same facts as text. */}
          <span
            role="img"
            aria-label={`Question ${current + 1} of ${questions.length}, ${
              questions.filter(
                (qq) => revealed[qq.id] && isAnswerCorrect(qq, answers[qq.id] ?? []),
              ).length
            } correct so far`}
            className="flex flex-wrap items-center gap-1"
          >
            {questions.map((qq, i) => {
              const done = !!revealed[qq.id];
              const wasCorrect =
                done && isAnswerCorrect(qq, answers[qq.id] ?? []);
              const bg =
                i === current
                  ? "var(--blueprint)"
                  : done
                    ? wasCorrect
                      ? "var(--ok)"
                      : "var(--err)"
                    : "color-mix(in srgb, var(--blueprint) 34%, transparent)";
              return (
                <span
                  key={qq.id}
                  style={{
                    width: "13px",
                    height: "3px",
                    display: "block",
                    background: bg,
                  }}
                />
              );
            })}
          </span>
          <span className="t-mono-sm uppercase text-ink-3">
            {questions.filter((qq) => revealed[qq.id]).length}/
            {questions.length} ·{" "}
            {
              questions.filter(
                (qq) =>
                  revealed[qq.id] && isAnswerCorrect(qq, answers[qq.id] ?? []),
              ).length
            }{" "}
            correct
          </span>
        </div>
      )}

      {mode === "drill" && weakTopics.length > 0 && (
        <p className="t-body-sm text-ink-2">
          <span className="t-mono-label mr-2 text-ink-3">Drilling</span>
          {weakTopics.join(" · ")}
        </p>
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
        optionOrder={optionOrder[q.id]}
        showConfidence={!isExam}
        confidence={confidence[q.id]}
        onSetConfidence={(level) =>
          setConfidence((c) => ({ ...c, [q.id]: level }))
        }
      />

      {!isExam && (
        <div className="flex flex-wrap items-center gap-3 max-sm:sticky max-sm:bottom-0 max-sm:z-10 max-sm:-mx-[18px] max-sm:border-t max-sm:border-line-1 max-sm:bg-ground-0 max-sm:px-[18px] max-sm:py-3">
          {!isRevealed ? (
            <>
              <button
                type="button"
                disabled={
                  selected.length === 0 ||
                  !confidence[q.id] ||
                  // Multi-answer stems name their count ("Choose TWO"), so the
                  // check waits for exactly that many marks: a partial set can
                  // only score wrong, and the gate makes the contract visible.
                  (q.type === "multi" && selected.length !== q.correct.length)
                }
                aria-describedby={
                  selected.length > 0 && !confidence[q.id]
                    ? `confidence-hint-${q.id}`
                    : undefined
                }
                onClick={() => {
                  // Review mode grades the spaced-repetition schedule here,
                  // because this is the moment the engine knows the question and
                  // the submitted answer: a correct answer promotes its box (a
                  // longer interval before it resurfaces), a wrong one resets it
                  // to box 0 (it comes back fastest). Other modes do not touch the
                  // schedule. "Clear from review" already prunes the entry, so no
                  // extra cleanup is needed here.
                  if (mode === "review") {
                    reviewQuestion(q.id, isAnswerCorrect(q, answers[q.id] ?? []));
                  }
                  setRevealed((r) => ({ ...r, [q.id]: true }));
                }}
                className="btn-primary"
              >
                Check answer
              </button>
              <button
                type="button"
                onClick={() => {
                  // Skipping leaves the question unanswered: it scores as a
                  // miss at finish, which is the honest reading of a skip.
                  if (isLast) {
                    finish(questions, answers, startedAt as number);
                  } else {
                    setCurrent((c) => c + 1);
                  }
                }}
                className="btn-ghost"
              >
                Skip
              </button>
              {selected.length > 0 && !confidence[q.id] && (
                <p
                  id={`confidence-hint-${q.id}`}
                  className="t-body-sm text-ink-2"
                >
                  Rate your confidence first
                </p>
              )}
            </>
          ) : (
            <>
              {!isLast ? (
                <button
                  type="button"
                  onClick={() => setCurrent((c) => c + 1)}
                  className="btn-primary"
                >
                  Next question
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => finish(questions, answers, startedAt as number)}
                  className="btn-primary"
                >
                  See results
                </button>
              )}
              {mode === "review" && (
                <button
                  type="button"
                  onClick={() => clearMissed(q.id)}
                  className="btn-secondary"
                >
                  Clear from review
                </button>
              )}
            </>
          )}
        </div>
      )}

    </div>
  );
}
