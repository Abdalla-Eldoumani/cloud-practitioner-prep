import type { AttemptResult, Readiness } from "@/lib/types";
import { domainName, EXAM } from "@/lib/constants";
import { readinessLabel } from "@/lib/scoring";

interface ResultsPanelProps {
  result: AttemptResult;
  onRetake: () => void;
  // Optional: walk back through every question with answers revealed.
  onReview?: () => void;
}

function readinessClasses(r: Readiness): string {
  switch (r) {
    case "not-ready":
      return "border-danger text-danger bg-danger-soft";
    case "building":
      return "border-flag text-flag";
    case "on-track":
      return "border-brand text-brand bg-info-soft";
    case "exam-ready":
      return "border-correct text-correct bg-correct-soft";
  }
}

function readinessSentence(r: Readiness): string {
  switch (r) {
    case "not-ready":
      return "Keep studying. Work through the lessons again before your next attempt.";
    case "building":
      return "Progress is showing. Focus on your weakest domains below, then retake.";
    case "on-track":
      return "Close to ready. Tighten up the domains scoring lowest and run another full mock.";
    case "exam-ready":
      return "Strong result. Repeat it on another full mock to confirm before you book.";
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default function ResultsPanel({
  result,
  onRetake,
  onReview,
}: ResultsPanelProps) {
  return (
    <div className="rounded-lg border border-hairline bg-raised p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink-soft">Your score</p>
          <p className="text-5xl font-bold tracking-tight text-ink">
            {result.percent}%
          </p>
          <p className="mt-1 text-ink-soft">
            {result.correct} of {result.total} correct
            {result.mode === "exam" &&
              ` in ${formatDuration(result.durationSeconds)}`}
          </p>
        </div>
        <div
          className={`self-start rounded-lg border px-4 py-3 ${readinessClasses(
            result.readiness,
          )}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-ink">
            Readiness
          </p>
          <p className="text-xl font-bold">{readinessLabel(result.readiness)}</p>
        </div>
      </div>

      <p className="mt-4 text-ink-soft">{readinessSentence(result.readiness)}</p>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-ink">
          By exam domain
        </h3>
        <ul className="flex flex-col gap-3">
          {result.byDomain.map((d) => (
            <li key={d.domain}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-ink">
                  {domainName(d.domain)}
                </span>
                <span className="text-ink-soft">
                  {d.total === 0
                    ? "no questions"
                    : `${d.correct}/${d.total} (${d.percent}%)`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${d.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong"
        >
          Retake
        </button>
        {onReview && (
          <button
            type="button"
            onClick={onReview}
            className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-brand"
          >
            Review answers
          </button>
        )}
        <a
          href="/progress"
          className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-brand"
        >
          View progress
        </a>
      </div>

      <p className="mt-6 border-t border-hairline pt-4 text-sm text-ink-soft">
        {result.mode === "exam" && (
          <>
            This mock scores all {EXAM.questionCount} questions. The real exam
            scores only {EXAM.scoredCount} of its {EXAM.questionCount}; the other{" "}
            {EXAM.questionCount - EXAM.scoredCount} are unscored and not
            identified.{" "}
          </>
        )}
        This percentage and readiness band are study signals from this question
        set. They are not the official AWS scaled score, which runs from 100 to
        1000 with a passing mark of {EXAM.passingScaledScore} and is calculated
        by AWS.
      </p>
    </div>
  );
}
