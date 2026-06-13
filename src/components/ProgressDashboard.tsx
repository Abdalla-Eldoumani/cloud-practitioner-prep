import { useStore } from "@nanostores/react";
import { $progress } from "@/lib/store";
import {
  clearProgress,
  defaultProgress,
  storageAvailable,
} from "@/lib/progress";
import { domainName } from "@/lib/constants";
import { readinessFromPercent, readinessLabel } from "@/lib/scoring";
import type { QuizMode } from "@/lib/types";

interface ProgressDashboardProps {
  // Passed from the Astro page, which can count the content collection.
  totalLessons: number;
}

function modeLabel(mode: QuizMode): string {
  if (mode === "exam") return "Mock exam";
  if (mode === "review") return "Review";
  return "Practice";
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ProgressDashboard({
  totalLessons,
}: ProgressDashboardProps) {
  const progress = useStore($progress);
  const persists = storageAvailable();

  const lessonsDone = progress.completedLessons.length;
  const lessonPercent =
    totalLessons === 0
      ? 0
      : Math.round((lessonsDone / totalLessons) * 100);

  const examAttempts = progress.attempts.filter((a) => a.mode === "exam");
  const bestExam =
    examAttempts.length > 0
      ? Math.max(...examAttempts.map((a) => a.percent))
      : null;

  function handleClear() {
    const ok = window.confirm(
      "Clear all saved progress on this device? This cannot be undone.",
    );
    if (!ok) return;
    clearProgress();
    $progress.set(defaultProgress());
  }

  return (
    <div className="flex flex-col gap-6">
      {!persists && (
        <div className="rounded-md border border-flag bg-surface px-4 py-3 text-sm text-ink">
          Storage is unavailable in this browser, so progress will not be saved
          between visits. Everything still works for this session.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-raised p-5">
          <p className="text-sm font-medium text-ink-soft">Lessons complete</p>
          <p className="mt-1 text-3xl font-bold text-ink">
            {lessonsDone}
            <span className="text-lg font-medium text-ink-soft">
              {" "}
              / {totalLessons}
            </span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${lessonPercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-raised p-5">
          <p className="text-sm font-medium text-ink-soft">Best mock score</p>
          <p className="mt-1 text-3xl font-bold text-ink">
            {bestExam === null ? "—" : `${bestExam}%`}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {bestExam === null
              ? "No full mock yet"
              : readinessLabel(readinessFromPercent(bestExam))}
          </p>
        </div>

        <div className="rounded-lg border border-hairline bg-raised p-5">
          <p className="text-sm font-medium text-ink-soft">Review queue</p>
          <p className="mt-1 text-3xl font-bold text-ink">
            {progress.flaggedQuestions.length + progress.incorrectQuestions.length}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {progress.flaggedQuestions.length} flagged,{" "}
            {progress.incorrectQuestions.length} missed
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-raised p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Recent attempts</h2>
        {progress.attempts.length === 0 ? (
          <p className="mt-2 text-ink-soft">
            Your practice and mock results will appear here.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-hairline">
            {progress.attempts.slice(0, 12).map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div>
                  <span className="font-medium text-ink">
                    {modeLabel(a.mode)}
                  </span>
                  <span className="text-ink-soft">
                    {a.domain === "all"
                      ? " · all domains"
                      : ` · ${domainName(a.domain)}`}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-ink-soft">{formatDate(a.finishedAt)}</span>
                  <span className="font-semibold text-ink">{a.percent}%</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href="/practice"
          className="rounded-md bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-strong"
        >
          Practice now
        </a>
        {progress.attempts.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-medium text-ink-soft underline underline-offset-2 hover:text-danger"
          >
            Clear all progress
          </button>
        )}
      </div>
    </div>
  );
}
