import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $progress } from "@/lib/store";
import { storageAvailable } from "@/lib/progress";
import { domainName } from "@/lib/constants";
import { mockTrend, readinessFromPercent, readinessLabel } from "@/lib/scoring";
import { computeReadiness, MIN_DOMAIN_SAMPLE } from "@/lib/readiness";
import BandChip, { readinessVars } from "@/components/BandChip";
import type { AttemptSummary, Question, Readiness } from "@/lib/types";

// The progress page: readiness legible in three seconds. Verdict chip first,
// one plain sentence naming what holds it down, three stats — then the mock
// traverse (attempts as survey stations against the band contours), domain
// bars, and the attempt history. Conservative by design: the overall verdict
// is only as strong as the weakest domain.

interface ProgressDashboardProps {
  totalLessons: number;
  // Slim projection of the bank (topic + domain per question) for readiness
  // attribution; islands take data as props, never import the bank.
  pool: Pick<Question, "topic" | "domain">[];
}

const BAND_RANK: Record<Readiness, number> = {
  "not-ready": 0,
  building: 1,
  "on-track": 2,
  "exam-ready": 3,
};

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

// The mock traverse: attempts as stations on a percent elevation, band
// thresholds as dotted contours. One drawing for any count — the axis never
// changes, nothing extrapolates. Desktop and mobile are separate drawings of
// the same data, never a shrunken copy.
function Traverse({
  trend,
  compact,
}: {
  trend: AttemptSummary[];
  compact: boolean;
}) {
  const w = compact ? 560 : 1120;
  const h = compact ? 250 : 268;
  const yAt60 = compact ? 164 : 176;
  const k = compact ? 3.0 : 3.2; // px per percent
  // Elevation is honest; only the drawing position clamps so an outlier
  // cannot leave the panel. The printed number stays the true score.
  const y = (p: number) => yAt60 - (Math.max(30, Math.min(100, p)) - 60) * k;
  const xL = compact ? 42 : 76;
  const xR = compact ? 476 : 1000;
  const n = trend.length;
  const x = (i: number) =>
    n === 1 ? (xL + xR) / 2 : xL + ((xR - xL) * i) / (n - 1);
  const lineEnd = compact ? 508 : 1020;
  const labelX = compact ? 512 : 1028;
  const labelStep = Math.max(1, Math.ceil(n / 8));
  const label =
    n === 1
      ? `One mock attempt at ${trend[0].percent} percent.`
      : `${n} mock attempts drawn as survey stations from ${trend[0].percent} to ${trend[n - 1].percent} percent against the band contours at 60, 75, and 85.`;
  const contours: { p: number; color: string; text: string }[] = [
    { p: 60, color: "var(--err)", text: compact ? "60" : "60 — BUILDING LINE" },
    { p: 75, color: "var(--flag)", text: compact ? "75" : "75 — ON TRACK LINE" },
    { p: 85, color: "var(--ok)", text: compact ? "85" : "85 — EXAM READY" },
  ];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-3 h-auto w-full"
      role="img"
      aria-label={label}
    >
      {contours.map((c) => (
        <g key={c.p}>
          <path
            d={`M${xL - (compact ? 22 : 36)} ${y(c.p)}H${lineEnd}`}
            stroke={c.color}
            strokeOpacity="0.4"
            strokeWidth="1"
            strokeDasharray="2 5"
          />
          <text
            x={labelX}
            y={y(c.p) + 4}
            fontFamily="Sometype Mono Variable, monospace"
            fontSize={compact ? 12 : 9}
            fill={c.color}
          >
            {c.text}
          </text>
        </g>
      ))}
      {n > 1 && (
        <polyline
          points={trend.map((a, i) => `${x(i)},${y(a.percent)}`).join(" ")}
          fill="none"
          stroke="var(--blueprint)"
          strokeWidth="1.6"
          strokeDasharray="0.1 6.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      )}
      {trend.map((a, i) => {
        const last = i === n - 1;
        return (
          <g key={a.id}>
            {last && (
              <circle
                cx={x(i)}
                cy={y(a.percent)}
                r="10"
                fill="none"
                stroke="color-mix(in srgb, var(--blueprint) 50%, transparent)"
                strokeWidth="1.5"
              />
            )}
            <circle
              cx={x(i)}
              cy={y(a.percent)}
              r="7"
              fill="var(--ground-1)"
              stroke="var(--ink-1)"
              strokeWidth="1.6"
            />
            <circle cx={x(i)} cy={y(a.percent)} r="2.4" fill="var(--ink-1)" />
            {(i % labelStep === 0 || last) && (
              <text
                x={x(i)}
                y={h - (compact ? 30 : 36)}
                textAnchor="middle"
                fontFamily="Sometype Mono Variable, monospace"
                fontSize={compact ? 13 : 9.5}
                fill={last ? "var(--ink-1)" : "var(--ink-3)"}
              >
                {compact ? a.percent : `A${i + 1} · ${a.percent}`}
              </text>
            )}
            {last && !compact && (
              <text
                x={x(i)}
                y={y(a.percent) - 21}
                textAnchor="middle"
                fontFamily="Sometype Mono Variable, monospace"
                fontSize="8.5"
                fill="var(--blueprint)"
              >
                LATEST
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function ProgressDashboard({
  totalLessons,
  pool,
}: ProgressDashboardProps) {
  const progress = useStore($progress);
  const persists = storageAvailable();
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("ccp-prep:storage-banner") === "dismissed";
    } catch {
      return false;
    }
  });
  const [showAllAttempts, setShowAllAttempts] = useState(false);
  // Everything here reads browser-only state (the store, storage
  // availability), so the server renders nothing and the view mounts after
  // hydration; otherwise the server's empty snapshot mismatches the client's
  // loaded one.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const lessonsDone = progress.completedLessons.length;
  const trend = mockTrend(progress.attempts);
  const bestMock =
    trend.length > 0 ? Math.max(...trend.map((a) => a.percent)) : null;
  const reviewQueueSize = new Set([
    ...progress.flaggedQuestions,
    ...progress.incorrectQuestions,
  ]).size;

  const readiness = computeReadiness(progress, pool);
  const answeredTotal = readiness.byDomain.reduce((s, d) => s + d.seen, 0);

  const empty =
    progress.attempts.length === 0 && lessonsDone === 0 && reviewQueueSize === 0;

  // The verdict: exam-ready only when every domain clears the bar over a real
  // sample; otherwise the weakest measured domain's band, capped at building
  // while any domain is still unmeasured.
  const measured = readiness.byDomain.filter((d) => d.seen > 0);
  const unmeasured = readiness.byDomain.filter((d) => d.seen === 0);
  let verdict: Readiness | null = null;
  if (measured.length > 0) {
    verdict = readiness.overallReady
      ? "exam-ready"
      : measured.reduce<Readiness>((acc, d) => {
          const b = readinessFromPercent(d.percent);
          return BAND_RANK[b] < BAND_RANK[acc] ? b : acc;
        }, "exam-ready");
    if (!readiness.overallReady && unmeasured.length > 0 && BAND_RANK[verdict] > 1) {
      verdict = "building";
    }
  }

  const weakNames = measured
    .filter((d) => d.seen >= MIN_DOMAIN_SAMPLE && d.percent < 75)
    .map((d) => domainName(d.domain));
  const thinNames = readiness.byDomain
    .filter((d) => d.seen < MIN_DOMAIN_SAMPLE)
    .map((d) => domainName(d.domain));
  const naming = (names: string[]) =>
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  const sentence = readiness.overallReady
    ? "Every domain reads exam-ready over a real sample. If your last two mocks agree, trust them and book."
    : weakNames.length > 0
      ? `${naming(weakNames)} ${weakNames.length === 1 ? "is" : "are"} holding the verdict down. Exam-ready needs every domain on track — the verdict is only as strong as the weakest one.`
      : thinNames.length > 0
        ? `${naming(thinNames)} ${thinNames.length === 1 ? "has" : "have"} not logged enough answers to read yet. A domain needs ${MIN_DOMAIN_SAMPLE} answered questions before its band counts.`
        : "Every measured domain is on track. Push each one past 85 to read exam-ready.";

  const historyRows = [...trend].reverse();
  const visibleRows = showAllAttempts ? historyRows : historyRows.slice(0, 4);

  const dismissBanner = () => {
    setBannerDismissed(true);
    try {
      sessionStorage.setItem("ccp-prep:storage-banner", "dismissed");
    } catch {
      // session-only dismissal simply will not stick
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-5">
      {!persists && !bannerDismissed && (
        <div
          className="flex flex-wrap items-center gap-3 rounded-r2 border px-4 py-3"
          style={{
            background: "var(--flag-fill)",
            borderColor: "var(--flag-line)",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--flag)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3.5 14.5V2.5" />
            <path d="M3.5 3h8.5l-2.2 2.8L12 8.5H3.5" />
          </svg>
          <span className="t-body-sm font-[520]" style={{ color: "var(--flag)" }}>
            This browser is blocking storage. Everything works — nothing will
            persist after you leave.
          </span>
          <button
            type="button"
            onClick={dismissBanner}
            className="t-mono-sm ml-auto rounded-r1 border px-2.5 py-1 uppercase text-ink-3 transition-colors hover:text-ink-1"
            style={{ borderColor: "var(--flag-line)" }}
          >
            Dismiss
          </button>
        </div>
      )}

      {empty ? (
        <div className="flex flex-col items-start gap-3.5 rounded-r3 border border-line-1 bg-ground-1 px-6 py-9 sm:px-8">
          <span className="inline-flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
              <circle
                cx="9"
                cy="9"
                r="6.6"
                fill="none"
                stroke="var(--ink-3)"
                strokeWidth="1.6"
              />
            </svg>
            <span
              aria-hidden="true"
              className="inline-block w-[72px] border-t-2 border-dotted"
              style={{
                borderColor: "color-mix(in srgb, var(--blueprint) 50%, transparent)",
              }}
            />
            <span
              className="font-mono text-[10px] tracking-[0.14em]"
              style={{ color: "var(--kicker-ink)" }}
            >
              FIRST STATION AHEAD
            </span>
          </span>
          <p className="t-sub text-ink-1">No marks yet.</p>
          <p className="t-body-sm max-w-[400px] text-ink-2">
            Fix your first station — day one is 75 minutes — or sit a mock cold
            to see where you stand. Both leave marks here.
          </p>
          <div className="mt-1.5 flex flex-wrap gap-3">
            <a href="/learn" className="btn-primary">
              Start day 1
            </a>
            <a href="/practice/exam" className="btn-secondary">
              Sit a mock cold
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* The three-second readout. */}
          <div className="flex flex-col rounded-r3 border border-line-1 bg-ground-1 md:flex-row md:items-stretch">
            <div className="flex flex-[1.4] flex-col gap-2.5 px-6 py-6 sm:px-8">
              {verdict ? (
                <BandChip readiness={verdict} className="w-fit" />
              ) : (
                <span className="t-mono-sm w-fit rounded-r1 border border-line-2 px-3 py-2 uppercase tracking-[0.14em] text-ink-3">
                  No verdict yet
                </span>
              )}
              <p className="t-body-sm max-w-[420px] text-ink-2">{sentence}</p>
            </div>
            <div className="flex flex-col justify-center gap-1 border-t border-line-1 px-6 py-5 md:flex-1 md:border-t-0 md:border-l sm:px-8">
              <span className="font-mono text-[9.5px] tracking-[0.18em] text-ink-3">
                BEST MOCK
              </span>
              <span className="t-mono-lg tabular-nums text-ink-1">
                {bestMock === null ? "—" : bestMock}
                {bestMock !== null && (
                  <span className="text-sm text-ink-3">%</span>
                )}
              </span>
            </div>
            <div className="flex flex-col justify-center gap-1 border-t border-line-1 px-6 py-5 md:flex-1 md:border-t-0 md:border-l sm:px-8">
              <span className="font-mono text-[9.5px] tracking-[0.18em] text-ink-3">
                LESSONS FIXED
              </span>
              <span className="t-mono-lg tabular-nums text-ink-1">
                {lessonsDone}
                <span className="text-sm text-ink-3">/{totalLessons}</span>
              </span>
              <span
                className="mt-1 flex flex-wrap gap-[3px]"
                role="img"
                aria-label={`${lessonsDone} of ${totalLessons} lessons fixed`}
              >
                {Array.from({ length: totalLessons }, (_, i) => (
                  <span
                    key={i}
                    className="block h-1 w-[9px]"
                    style={{
                      background:
                        i < lessonsDone
                          ? "var(--ink-1)"
                          : "color-mix(in srgb, var(--blueprint) 30%, transparent)",
                    }}
                  />
                ))}
              </span>
            </div>
            <div className="flex flex-col justify-center gap-1 border-t border-line-1 px-6 py-5 md:flex-1 md:border-t-0 md:border-l sm:px-8">
              <span className="font-mono text-[9.5px] tracking-[0.18em] text-ink-3">
                REVIEW QUEUE
              </span>
              <span className="t-mono-lg tabular-nums text-ink-1">
                {reviewQueueSize}
              </span>
              <a
                href="/practice/review"
                className="t-mono-sm uppercase text-ink-3 transition-colors hover:text-ink-1"
              >
                Unfixed points &rarr;
              </a>
            </div>
          </div>

          {/* The mock traverse: the page's one instrument. */}
          <div className="substrate relative rounded-r3 border border-line-1 bg-ground-1 px-5 py-5 sm:px-7">
            <span
              aria-hidden="true"
              className="absolute -top-px -left-px size-3.5 border-t-2 border-l-2 border-blueprint"
            />
            <span
              aria-hidden="true"
              className="absolute -top-px -right-px size-3.5 border-t-2 border-r-2 border-blueprint"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-px -left-px size-3.5 border-b-2 border-l-2 border-blueprint"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-px -right-px size-3.5 border-b-2 border-r-2 border-blueprint"
            />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="t-mono-label" style={{ color: "var(--kicker-ink)" }}>
                Mock traverse — {trend.length} attempt{trend.length === 1 ? "" : "s"}
              </p>
              {trend.length > 0 && (
                <p className="t-mono-sm hidden uppercase text-ink-3 sm:block">
                  Elev = raw % · contours = bands
                </p>
              )}
            </div>
            {trend.length === 0 ? (
              <div className="mt-4 flex flex-col items-start gap-3 py-4">
                <span className="inline-flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                    <circle
                      cx="9"
                      cy="9"
                      r="6.6"
                      fill="none"
                      stroke="var(--ink-3)"
                      strokeWidth="1.6"
                    />
                  </svg>
                  <span
                    aria-hidden="true"
                    className="inline-block w-[64px] border-t-2 border-dotted"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--blueprint) 50%, transparent)",
                    }}
                  />
                </span>
                <p className="t-body-sm max-w-[420px] text-ink-2">
                  The traverse draws after your first full mock. Every attempt
                  becomes a station on this elevation.
                </p>
                <a href="/practice/exam" className="btn-secondary">
                  Sit a mock
                </a>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Traverse trend={trend} compact={false} />
                </div>
                <div className="md:hidden">
                  <Traverse trend={trend} compact />
                </div>
                {trend.length <= 2 && (
                  <p className="t-body-sm mt-2 text-ink-3">
                    {trend.length === 1
                      ? "One attempt in. The contours already mean something."
                      : "Two attempts in. The traverse is short — the contours already mean something."}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            {/* Domain accuracy bars. */}
            <div className="rounded-r3 border border-line-1 bg-ground-1 px-5 py-5 sm:px-7">
              <p className="t-mono-label" style={{ color: "var(--kicker-ink)" }}>
                By domain — practice accuracy
              </p>
              <div className="mt-4 flex flex-col gap-4">
                {readiness.byDomain.map((d) => {
                  const domainVar = `var(--d${d.domain})`;
                  const thin = d.seen < MIN_DOMAIN_SAMPLE;
                  const rowBand = readinessFromPercent(d.percent);
                  return (
                    <div
                      key={d.domain}
                      className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5"
                    >
                      <span
                        className="t-mono-sm w-6 flex-none"
                        style={{ color: domainVar }}
                      >
                        D{d.domain}
                      </span>
                      <span className="t-body-sm w-[170px] flex-none truncate text-ink-2">
                        {domainName(d.domain)}
                      </span>
                      <span className="relative h-1.5 min-w-[80px] flex-1 overflow-hidden rounded-[1px] bg-ground-3">
                        <span
                          className="absolute inset-y-0 left-0"
                          style={{ width: `${d.percent}%`, background: domainVar }}
                        />
                      </span>
                      <span className="t-mono w-[42px] flex-none text-right tabular-nums text-ink-1">
                        {thin ? "—" : `${d.percent}%`}
                      </span>
                      <span className="hidden w-[92px] flex-none text-right font-mono text-[10px] text-ink-3 sm:block">
                        {d.seen} ANSWERED
                      </span>
                      <span
                        className="hidden w-[90px] flex-none text-right font-mono text-[10px] uppercase tracking-[0.1em] sm:block"
                        style={{
                          color: thin
                            ? "var(--ink-3)"
                            : readinessVars(rowBand).color,
                        }}
                      >
                        {thin ? "THIN DATA" : readinessLabel(rowBand)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="t-body-sm mt-4 text-ink-3">
                {answeredTotal} answers recorded across {pool.length} questions.
                Accuracy counts every recorded answer; a domain reads only after{" "}
                {MIN_DOMAIN_SAMPLE} of them.
              </p>
            </div>

            {/* Attempt history. */}
            <div className="rounded-r3 border border-line-1 bg-ground-1 px-5 py-5 sm:px-7">
              <div className="flex items-baseline justify-between">
                <p className="t-mono-label" style={{ color: "var(--kicker-ink)" }}>
                  Attempt history
                </p>
                <p className="t-mono-sm uppercase text-ink-3">
                  {trend.length} total
                </p>
              </div>
              {historyRows.length === 0 ? (
                <p className="t-body-sm mt-3 text-ink-2">
                  Finished mocks log here, newest first.
                </p>
              ) : (
                <div className="mt-2 flex flex-col">
                  {visibleRows.map((a, i) => {
                    const number = historyRows.length - i;
                    const rowBand = readinessFromPercent(a.percent);
                    return (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 border-b border-line-1 py-2.5 last:border-b-0"
                      >
                        <span className="t-mono-sm w-7 flex-none text-ink-3">
                          A{number}
                        </span>
                        <span className="w-11 flex-none font-mono text-sm tabular-nums text-ink-1">
                          {a.percent}%
                        </span>
                        <span
                          className="font-mono text-[9.5px] uppercase tracking-[0.1em]"
                          style={{ color: readinessVars(rowBand).color }}
                        >
                          {readinessLabel(rowBand)}
                        </span>
                        <span className="t-mono-sm ml-auto flex-none text-ink-3">
                          {Math.round(a.durationSeconds / 60)} MIN
                        </span>
                        <span className="t-mono-sm flex-none text-ink-3">
                          {formatDate(a.finishedAt)}
                        </span>
                      </div>
                    );
                  })}
                  {historyRows.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllAttempts((v) => !v)}
                      className="t-mono-sm self-start pt-3 uppercase text-ink-3 transition-colors hover:text-ink-1"
                    >
                      {showAllAttempts
                        ? "Show fewer ▴"
                        : `Show all ${historyRows.length} ▾`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
