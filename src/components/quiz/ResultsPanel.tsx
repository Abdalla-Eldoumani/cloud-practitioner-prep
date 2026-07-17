import { useEffect, useState } from "react";
import type { AttemptResult, QuizMode, Readiness } from "@/lib/types";
import { domainName, EXAM } from "@/lib/constants";
import BandChip, { readinessVars } from "@/components/BandChip";
import { readinessLabel } from "@/lib/scoring";

// The results view: a quiet ceremony over the answer sheet. The percent
// counts up once, the band stamps, and the marks are tallied — no confetti,
// no failure theater. One readiness scale everywhere; the copy points at the
// measured gap, never at the learner.

export interface TallyMark {
  n: number; // 1-based question number
  correct: boolean;
}

interface ResultsPanelProps {
  result: AttemptResult;
  onRetake: () => void;
  // Exam sittings pass the per-question tally (drawn as the 65-mark sheet,
  // misses linking into the review list) and the attempt number.
  tally?: TallyMark[];
  attemptNumber?: number;
}

const KICKER_BY_MODE: Record<QuizMode, string> = {
  exam: "MOCK EXAM COMPLETE",
  practice: "PRACTICE SET COMPLETE",
  drill: "DRILL COMPLETE",
  review: "REVIEW SESSION COMPLETE",
};

// One plain sentence per band. The building/not-ready sentences name the
// domains where the marks went missing, computed by the caller of weakNames.
function bandSentence(r: Readiness, weakNames: string[], marksBelow: number): string {
  const weak =
    weakNames.length === 0
      ? "the weakest domains"
      : weakNames.length === 1
        ? weakNames[0]
        : `${weakNames.slice(0, -1).join(", ")} and ${weakNames[weakNames.length - 1]}`;
  switch (r) {
    case "exam-ready":
      return "This is the exam-ready band. If your last two mocks both read exam-ready, trust them and book the exam.";
    case "on-track":
      return `Close to the exam-ready line. Tighten ${weak} and run another full mock.`;
    case "building":
      return `${marksBelow} mark${marksBelow === 1 ? "" : "s"} below the on-track line. The gap is measured, not mysterious: ${weak} ${weakNames.length === 1 ? "is" : "are"} where the marks went missing.`;
    case "not-ready":
      return `Under the building line. Work back through the lessons before the next attempt — start with ${weak}.`;
  }
}

// Count-up for the hero percent (M4): 0 to N over 560ms, settled easing,
// tabular numerals so nothing shifts. Reduced motion renders the final value
// at once.
function useCountUp(target: number): number {
  const [value, setValue] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? target
      : 0,
  );
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 560);
      const eased = 1 - (1 - t) * (1 - t);
      setValue(Math.round(target * eased));
      if (t < 1) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

export default function ResultsPanel({
  result,
  onRetake,
  tally,
  attemptNumber,
}: ResultsPanelProps) {
  const isExam = result.mode === "exam";
  const shown = useCountUp(result.percent);
  const pass = result.readiness === "on-track" || result.readiness === "exam-ready";

  const scoredDomains = result.byDomain.filter((d) => d.total > 0);
  const weakDomains = scoredDomains.filter((d) => d.percent < 75);
  const weakNames = weakDomains.map((d) => domainName(d.domain));
  // Marks below the on-track line: how many more correct answers 75% needed.
  const marksBelow = Math.max(
    0,
    Math.ceil(result.total * 0.75) - result.correct,
  );
  const missedCount = result.total - result.correct;
  const usedMin = Math.round(result.durationSeconds / 60);
  const limitMin = Math.round(EXAM.timeLimitSeconds / 60);

  return (
    <section aria-label="Result">
      <p className="t-mono-sm uppercase" style={{ color: "var(--kicker-ink)" }}>
        {KICKER_BY_MODE[result.mode]}
        {isExam && attemptNumber ? ` · ATTEMPT ${attemptNumber}` : ""}
        {isExam ? ` · ${usedMin} OF ${limitMin} MIN USED` : ""}
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-x-7 gap-y-4">
        <span
          className="t-mono-hero tabular-nums text-ink-1"
          aria-label={`${result.percent} percent`}
        >
          {shown}
          <span className="text-[34px] text-ink-3">%</span>
        </span>
        <BandChip
          readiness={result.readiness}
          className="result-stamp-in mb-1"
        />
        <span className="t-mono mb-1.5 ml-auto uppercase text-ink-3">
          {result.correct} of {result.total} correct
        </span>
      </div>

      <p className="t-body mt-4 max-w-[640px] text-ink-2">
        {bandSentence(result.readiness, weakNames, marksBelow)}
      </p>

      {tally && tally.length > 0 && (
        <div
          className="result-fade-in mt-8 rounded-r3 border border-line-1 bg-ground-1 px-5 py-5 sm:px-6"
          style={{ animationDelay: "480ms" }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p
              className="t-mono-label"
              style={{ color: "var(--kicker-ink)" }}
            >
              Your {tally.length} marks
            </p>
            <p className="t-mono-sm uppercase text-ink-3">
              Filled = correct · outlined = missed (tap to review)
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tally.map((t) =>
              t.correct ? (
                <span
                  key={t.n}
                  role="img"
                  aria-label={`Question ${t.n}, correct`}
                  className="block h-[11px] w-[22px] rounded-full"
                  style={{ background: "var(--ok)" }}
                />
              ) : (
                <a
                  key={t.n}
                  href={`#rq-${t.n}`}
                  aria-label={`Question ${t.n}, missed — jump to its review`}
                  className="box-border block h-[11px] w-[22px] rounded-full border-2 transition-colors hover:bg-err-fill"
                  style={{ borderColor: "var(--err)" }}
                />
              ),
            )}
          </div>
        </div>
      )}

      {scoredDomains.length > 0 && (
        <div className="mt-5 rounded-r3 border border-line-1 bg-ground-1 px-5 py-5 sm:px-6">
          <p className="t-mono-label" style={{ color: "var(--kicker-ink)" }}>
            By domain
          </p>
          <div className="mt-4 flex flex-col gap-3.5">
            {scoredDomains.map((d, i) => {
              const domainVar = `var(--d${d.domain})`;
              const rowBand: Readiness =
                d.percent >= 85
                  ? "exam-ready"
                  : d.percent >= 75
                    ? "on-track"
                    : d.percent >= 60
                      ? "building"
                      : "not-ready";
              const focus = d.percent < 75;
              return (
                <div
                  key={d.domain}
                  className="result-fade-in flex flex-wrap items-center gap-x-3.5 gap-y-1.5"
                  style={{ animationDelay: `${560 + i * 60}ms` }}
                >
                  <span className="flex w-full items-center gap-2 sm:w-[250px] sm:flex-none">
                    <span
                      className="t-mono-sm"
                      style={{ color: domainVar }}
                    >
                      D{d.domain}
                    </span>
                    <span className="t-body-sm text-ink-2">
                      {domainName(d.domain)}
                    </span>
                    {focus && (
                      <span
                        className="rounded-r1 border px-1.5 py-px font-mono text-[9px] tracking-[0.12em]"
                        style={{
                          color: "var(--err)",
                          borderColor: "var(--err-line)",
                        }}
                      >
                        FOCUS
                      </span>
                    )}
                  </span>
                  <span
                    className="flex min-w-0 flex-1 flex-wrap gap-1"
                    role="img"
                    aria-label={`${d.correct} of ${d.total} correct`}
                  >
                    {Array.from({ length: d.total }, (_, p) => (
                      <span
                        key={p}
                        className="box-border block h-[9px] w-4 rounded-full"
                        style={
                          p < d.correct
                            ? { background: domainVar }
                            : { border: "1.5px solid var(--line-2)" }
                        }
                      />
                    ))}
                  </span>
                  <span className="t-mono w-[52px] flex-none text-right tabular-nums text-ink-1">
                    {d.correct}/{d.total}
                  </span>
                  <span
                    className="hidden w-[96px] flex-none text-right font-mono text-[10px] uppercase tracking-[0.1em] sm:block"
                    style={{ color: readinessVars(rowBand).color }}
                  >
                    {readinessLabel(rowBand)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 border-l-[3px] border-blueprint py-1 pl-[18px]">
        <p className="t-body-sm max-w-[680px] text-ink-3">
          {isExam
            ? `Raw percent of the ${result.total} scored questions. It is not the AWS scaled score (100–1000), and the real exam adds unscored items. Treat 85+ here as a conservative signal, not a promise.`
            : "Raw percent of this set. It is not the AWS scaled score (100–1000), which AWS calculates from scored items only."}
        </p>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3.5">
        {isExam && pass && (
          <>
            <a href="#review" className="btn-primary">
              Review all {result.total}
            </a>
            <button type="button" onClick={onRetake} className="btn-secondary">
              Retake the mock
            </button>
            <a href="/progress" className="btn-ghost">
              See progress &rarr;
            </a>
          </>
        )}
        {isExam && !pass && (
          <>
            <a href="/practice/drill" className="btn-primary">
              Drill the weak areas
            </a>
            <a href="#review" className="btn-secondary">
              Review the {missedCount} missed
            </a>
            <button type="button" onClick={onRetake} className="btn-ghost">
              Retake later
            </button>
          </>
        )}
        {!isExam && (
          <>
            <button type="button" onClick={onRetake} className="btn-primary">
              Run it again
            </button>
            <a href="/progress" className="btn-ghost">
              See progress &rarr;
            </a>
          </>
        )}
      </div>
    </section>
  );
}
