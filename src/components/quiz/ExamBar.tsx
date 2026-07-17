// The exam room's instrument bar: while an attempt is live this is the only
// chrome on screen. One T1 surface (reticle ends, cells split by hairline
// rules) carrying the facts of the sitting: what this is, time left, marks
// made, flags raised, and the two controls (grid, submit). The timer changes
// state exactly twice — flag at 5:00, err at 1:00 — each as a single settled
// transition, never a pulse, with a polite live announcement for screen
// readers.
interface ExamBarProps {
  remaining: number; // seconds left on the clock
  answered: number;
  total: number;
  flaggedCount: number;
  // Whether the mark-sheet is showing (the rail at wide viewports). The button
  // reads GRID ON/OFF at rail widths and just GRID where it opens the sheet.
  gridOn: boolean;
  onToggleGrid: () => void;
  // Opens the submit confirm bar; the bar's own button is secondary because
  // the only primary submit lives in the confirm bar.
  onSubmit: () => void;
}

function formatClock(remaining: number): string {
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ExamBar({
  remaining,
  answered,
  total,
  flaggedCount,
  gridOn,
  onToggleGrid,
  onSubmit,
}: ExamBarProps) {
  const crit = remaining <= 60;
  const warn = !crit && remaining <= 300;
  const timeColor = crit ? "var(--err)" : warn ? "var(--flag)" : undefined;

  return (
    <div className="exam-bar-in sticky top-0 z-30 border-b border-line-1 bg-ground-1">
      <div className="relative flex h-[52px] items-stretch sm:h-16">
        {/* T1 reticle ends: the bar is an instrument, not a card. */}
        <span
          aria-hidden="true"
          className="absolute -top-px -left-px size-3.5 border-t-2 border-l-2 border-blueprint"
        />
        <span
          aria-hidden="true"
          className="absolute -top-px -right-px size-3.5 border-t-2 border-r-2 border-blueprint"
        />

        {/* Brand cell: the fixed-station wordmark glyph plus the sitting's
            name. Drops out below the width where the cells need the room. */}
        <div className="hidden items-center gap-2.5 border-r border-line-1 px-7 lg:flex">
          <svg width="17" height="17" viewBox="0 0 56 56" aria-hidden="true">
            <circle
              cx="28"
              cy="28"
              r="15"
              fill="none"
              stroke="var(--ink-1)"
              strokeWidth="4"
            />
            <circle cx="28" cy="28" r="5.5" fill="var(--ink-1)" />
            <path
              d="M28 3v8M28 45v8M3 28h8M45 28h8"
              stroke="var(--blueprint)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-mono text-[11px] tracking-[0.14em] text-ink-2">
            MOCK EXAM — CLF-C02
          </span>
        </div>

        {/* TIME cell. The whole cell carries the threshold states: label and
            digits to flag at 5:00 (warning triangle outlined, 2px flag rule
            under the cell), digits to err with the cell filling err at 1:00
            (triangle solid). One transition each, 400ms then 200ms. */}
        <div
          className="relative flex min-w-[92px] flex-col justify-center border-r border-line-1 px-3.5 transition-colors sm:min-w-[128px] sm:px-7"
          style={{
            backgroundColor: crit ? "var(--err-fill)" : undefined,
            transitionDuration: crit ? "200ms" : "400ms",
          }}
        >
          {(warn || crit) && (
            <span
              aria-hidden="true"
              className="absolute inset-x-0 -bottom-px h-0.5"
              style={{ background: timeColor }}
            />
          )}
          <span
            className="font-mono text-[8.5px] tracking-[0.18em] transition-colors sm:text-[9.5px]"
            style={{
              color: timeColor ?? "var(--ink-3)",
              transitionDuration: crit ? "200ms" : "400ms",
            }}
          >
            TIME
          </span>
          <span
            className="flex items-center gap-2 font-mono text-[20px] leading-[1.1] tabular-nums transition-colors sm:text-[26px]"
            style={{
              color: timeColor ?? "var(--ink-1)",
              fontWeight: warn || crit ? 640 : 560,
              transitionDuration: crit ? "200ms" : "400ms",
            }}
          >
            {(warn || crit) && (
              <svg
                width="15"
                height="15"
                viewBox="0 0 18 18"
                aria-hidden="true"
                className="shrink-0"
                style={{
                  animation: "exam-fade-in 120ms var(--ease-settle) backwards",
                }}
              >
                <polygon
                  points="9,2 16.5,15.5 1.5,15.5"
                  fill={crit ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <circle
                  cx="9"
                  cy="12"
                  r="1.6"
                  fill={crit ? "var(--err-fill)" : "currentColor"}
                />
              </svg>
            )}
            {formatClock(remaining)}
          </span>
          <span className="sr-only" aria-live="polite">
            {crit
              ? "1 minute remaining"
              : warn
                ? "5 minutes remaining"
                : ""}
          </span>
        </div>

        <div className="flex flex-col justify-center border-r border-line-1 px-3.5 sm:px-7">
          <span className="font-mono text-[8.5px] tracking-[0.18em] text-ink-3 sm:text-[9.5px]">
            <span className="sm:hidden">ANS</span>
            <span className="hidden sm:inline">ANSWERED</span>
          </span>
          <span className="font-mono text-sm leading-[1.3] tabular-nums text-ink-1 sm:text-base">
            {answered}
            <span className="text-ink-3">/{total}</span>
          </span>
        </div>

        <div className="hidden flex-col justify-center border-r border-line-1 px-7 sm:flex">
          <span className="font-mono text-[9.5px] tracking-[0.18em] text-ink-3">
            FLAGGED
          </span>
          <span className="flex items-center gap-1.5 font-mono text-base leading-[1.3] tabular-nums text-ink-1">
            <svg
              width="12"
              height="12"
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
            {flaggedCount}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3 px-3 sm:px-7">
          <button
            type="button"
            onClick={onToggleGrid}
            aria-pressed={gridOn}
            className={`flex items-center gap-2 rounded-r1 border px-3 py-2 font-mono text-[9.5px] tracking-[0.12em] transition-colors sm:px-3.5 sm:text-[10.5px] ${
              gridOn
                ? "border-blueprint bg-blueprint-dim text-blueprint-strong"
                : "border-line-1 text-ink-3 hover:border-line-2 hover:text-ink-1"
            }`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="2.5" y="2.5" width="4.6" height="4.6" />
              <rect x="8.9" y="2.5" width="4.6" height="4.6" />
              <rect x="2.5" y="8.9" width="4.6" height="4.6" />
              <rect x="8.9" y="8.9" width="4.6" height="4.6" />
            </svg>
            {/* At rail widths the label reports the rail's state; where the
                grid is a sheet, the button is simply its trigger. */}
            <span className="hidden min-[1200px]:inline">
              GRID {gridOn ? "ON" : "OFF"}
            </span>
            <span className="min-[1200px]:hidden">GRID</span>
            <span
              aria-hidden="true"
              className="hidden rounded-r1 border border-current px-[5px] text-[9.5px] opacity-70 sm:inline"
            >
              G
            </span>
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="hidden rounded-r1 border border-line-2 px-[18px] py-2 text-[13.5px] font-[560] text-ink-1 transition-colors hover:bg-ground-2 sm:block"
          >
            Submit exam
          </button>
        </div>
      </div>
    </div>
  );
}
