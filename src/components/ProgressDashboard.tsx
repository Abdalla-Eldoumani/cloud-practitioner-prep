import { useStore } from "@nanostores/react";
import { $progress } from "@/lib/store";
import {
  clearProgress,
  defaultProgress,
  storageAvailable,
} from "@/lib/progress";
import { domainName, EXAM } from "@/lib/constants";
import { mockTrend, readinessFromPercent, readinessLabel } from "@/lib/scoring";
import {
  computeReadiness,
  EXAM_READY_PERCENT,
  MIN_DOMAIN_SAMPLE,
} from "@/lib/readiness";
import type { Question, QuizMode } from "@/lib/types";

interface ProgressDashboardProps {
  // Passed from the Astro page, which can count the content collection.
  totalLessons: number;
  // The full question pool, passed from the page (islands take the pool as a
  // prop, never import it). Used to attribute each answered topic to its domain
  // for the readiness signal.
  pool: Question[];
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
  pool,
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

  // The mock score trend, oldest-to-newest, from the single pure source so the
  // filter/order rule is not re-derived here. The list below carries the data;
  // the sparkline is the labelled visual summary over the same points.
  const trend = mockTrend(progress.attempts);
  const latestTrendPercent =
    trend.length > 0 ? trend[trend.length - 1].percent : null;

  // Headline of the review queue = the deduplicated union of flagged and missed
  // (a question both flagged and missed counts once); the flagged/missed numbers
  // below it are the detail.
  const reviewQueueSize = new Set([
    ...progress.flaggedQuestions,
    ...progress.incorrectQuestions,
  ]).size;

  // The honest readiness signal: per-domain and per-topic accuracy plus ONE
  // conservative ready/not-yet verdict, derived only from answered questions.
  const readiness = computeReadiness(progress, pool);
  // Per-topic snapshot sorted by domain, then weakest first within a domain, so
  // real weak spots surface at the top of each domain group.
  const topicsByDomain = [...readiness.byTopic].sort(
    (a, b) => a.domain - b.domain || a.percent - b.percent,
  );

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
          <p className="mt-1 text-3xl font-bold text-ink">{reviewQueueSize}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {progress.flaggedQuestions.length} flagged,{" "}
            {progress.incorrectQuestions.length} missed
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-raised p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Readiness</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Based only on the questions you have answered so far.
        </p>

        <div
          className={`mt-4 rounded-lg border px-4 py-3 ${
            readiness.overallReady
              ? "border-correct bg-correct-soft text-correct"
              : "border-flag bg-surface text-flag"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            Overall
          </p>
          <p className="text-xl font-bold">
            {readiness.overallReady ? "Looks ready" : "Not yet ready"}
          </p>
          <p className="mt-1 text-sm text-ink">{readiness.reason}</p>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-ink">By exam domain</h3>
          <ul className="flex flex-col gap-3">
            {readiness.byDomain.map((d) => {
              const underSampled = d.seen < MIN_DOMAIN_SAMPLE;
              return (
                <li key={d.domain}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-ink">
                      {domainName(d.domain)}
                    </span>
                    <span className="text-ink-soft">
                      {underSampled
                        ? "not enough data yet"
                        : `${d.correct}/${d.seen} (${d.percent}%) · ${readinessLabel(
                            readinessFromPercent(d.percent),
                          )}`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {topicsByDomain.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-ink">By topic</h3>
            <ul className="flex flex-col gap-2">
              {topicsByDomain.map((t) => (
                <li
                  key={t.key}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="text-ink">
                    {t.label}
                    <span className="text-ink-soft">
                      {" · "}
                      {domainName(t.domain)}
                    </span>
                  </span>
                  <span className="text-ink-soft">
                    {t.correct}/{t.seen} ({t.percent}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 border-t border-hairline pt-4 text-sm text-ink-soft">
          This percentage and readiness band are study signals from this question
          set. They are not the official AWS scaled score, which runs from 100 to
          1000 with a passing mark of {EXAM.passingScaledScore} and is calculated
          by AWS. A domain reads ready only at {EXAM_READY_PERCENT}% or above over
          at least {MIN_DOMAIN_SAMPLE} answered questions.
        </p>
      </div>

      <div className="rounded-lg border border-hairline bg-raised p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Mock score trend</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Your overall score on each full mock, oldest to newest.
        </p>

        {trend.length === 0 ? (
          <p className="mt-4 text-ink-soft">
            Your mock scores will chart here once you finish a full mock.{" "}
            <a
              href="/practice/exam"
              className="font-medium text-brand underline underline-offset-2 hover:text-brand-strong"
            >
              Sit a mock
            </a>{" "}
            to start your trend.
          </p>
        ) : (
          <>
            {/* The sparkline is a labelled visual summary; the dated list below
                is its text alternative and carries the same data. A single
                attempt renders a dot, never an empty polyline. Percents map
                straight to the 0-100 viewBox, so a corrupt out-of-range value
                only skews a coordinate — it never executes or breaks render. */}
            <div className="mt-4 text-brand">
              {(() => {
                const w = 300;
                const h = 80;
                const padX = 6;
                const padY = 6;
                const span = w - padX * 2;
                const inner = h - padY * 2;
                const n = trend.length;
                const x = (i: number) =>
                  n === 1 ? w / 2 : padX + (span * i) / (n - 1);
                const y = (percent: number) =>
                  padY + inner * (1 - percent / 100);
                const points = trend
                  .map((a, i) => `${x(i)},${y(a.percent)}`)
                  .join(" ");
                const label =
                  n === 1
                    ? `Mock score trend: one mock at ${trend[0].percent}%.`
                    : `Mock score trend over ${n} mocks, from ${trend[0].percent}% to ${latestTrendPercent}%.`;
                return (
                  <svg
                    role="img"
                    aria-label={label}
                    viewBox={`0 0 ${w} ${h}`}
                    preserveAspectRatio="none"
                    className="h-20 w-full"
                  >
                    {n > 1 && (
                      <polyline
                        points={points}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    {trend.map((a, i) => (
                      <circle
                        key={a.id}
                        cx={x(i)}
                        cy={y(a.percent)}
                        r={3}
                        fill="currentColor"
                      />
                    ))}
                  </svg>
                );
              })()}
            </div>

            <ol className="mt-4 flex flex-col divide-y divide-hairline">
              {trend.map((a, i) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="text-ink-soft">
                    Mock {i + 1}
                    <span className="text-ink-soft">
                      {" · "}
                      {formatDate(a.finishedAt)}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-ink-soft">
                      {readinessLabel(readinessFromPercent(a.percent))}
                    </span>
                    <span className="font-semibold text-ink">{a.percent}%</span>
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
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
          className="rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong"
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
