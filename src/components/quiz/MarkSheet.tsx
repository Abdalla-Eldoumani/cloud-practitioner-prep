import { useRef } from "react";
import { useModalDialog } from "@/components/navigation/useModalDialog";

// The 65-cell mark sheet: the exam's jump grid, drawn like the paper answer
// sheet the motif comes from. Two presentations of one cell vocabulary: a T1
// rail beside the question at wide viewports, and a bottom sheet over the
// scrim below 1200 (where the submit control also lives, still guarded by the
// confirm bar). Five cell states, none carried by color alone: every cell
// speaks its state to assistive tech and the legend always sits beside the
// grid.

export interface MarkCell {
  id: string;
  n: number; // 1-based question number
  answered: boolean;
  flagged: boolean;
  current: boolean;
}

interface MarkSheetProps {
  cells: MarkCell[];
  onJump: (index: number) => void;
  variant: "rail" | "sheet";
  // Sheet-only concerns; ignored by the rail.
  open?: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
  answered?: number;
  total?: number;
}

function cellState(c: MarkCell): string {
  if (c.current) return "current";
  if (c.flagged && c.answered) return "flagged and answered";
  if (c.flagged) return "flagged";
  if (c.answered) return "answered";
  return "not answered";
}

function Cell({
  cell,
  index,
  size,
  onJump,
}: {
  cell: MarkCell;
  index: number;
  size: number;
  onJump: (index: number) => void;
}) {
  const { answered, flagged, current, n } = cell;
  const filled = answered && !current;
  const reticleSize = size + 10;
  return (
    <button
      type="button"
      onClick={() => onJump(index)}
      aria-label={`Question ${n}, ${cellState(cell)}`}
      aria-current={current ? "true" : undefined}
      className="relative inline-flex items-center justify-center rounded-r2 font-mono tabular-nums"
      style={{
        width: size,
        height: size,
        fontSize: size >= 40 ? "12.5px" : "12px",
        fontWeight: filled || current ? 620 : 500,
        background: current
          ? "var(--ground-2)"
          : filled
            ? "var(--ink-1)"
            : "transparent",
        border: current
          ? "2px solid var(--ink-1)"
          : filled
            ? "1px solid var(--ink-1)"
            : flagged
              ? "1px solid var(--flag-line)"
              : "1px solid var(--line-1)",
        color: filled ? "var(--ground-0)" : current ? "var(--ink-1)" : "var(--ink-3)",
      }}
    >
      {n}
      {flagged && (
        <svg
          width="9"
          height="9"
          viewBox="0 0 9 9"
          aria-hidden="true"
          className="absolute top-px right-px"
        >
          <polygon points="0,0 9,0 9,9" fill="var(--flag)" />
        </svg>
      )}
      {flagged && filled && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 bg-flag"
        />
      )}
      {current && (
        <svg
          width={reticleSize}
          height={reticleSize}
          viewBox="0 0 43 43"
          aria-hidden="true"
          className="pointer-events-none absolute -top-[5px] -left-[5px]"
        >
          <path
            d="M2 11V2h9M32 2h9v9M41 32v9h-9M11 41H2v-9"
            fill="none"
            stroke="var(--blueprint)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

function Legend() {
  const item =
    "inline-flex items-center gap-[7px] font-mono text-[9px] tracking-[0.06em] text-ink-3";
  return (
    <div className="mt-3.5 grid grid-cols-2 gap-x-2.5 gap-y-[7px] border-t border-line-1 pt-3">
      <span className={item}>
        <span className="size-[13px] flex-none rounded-[3px] bg-ink-1" />
        ANSWERED
      </span>
      <span className={item}>
        <span className="box-border size-[13px] flex-none rounded-[3px] border border-line-1" />
        UNTOUCHED
      </span>
      <span className={item}>
        <span className="relative box-border size-[13px] flex-none rounded-[3px] border border-flag-line">
          <svg
            width="6"
            height="6"
            viewBox="0 0 9 9"
            className="absolute top-0 right-0"
            aria-hidden="true"
          >
            <polygon points="0,0 9,0 9,9" fill="var(--flag)" />
          </svg>
        </span>
        FLAGGED
      </span>
      <span className={item}>
        <span className="relative size-[13px] flex-none rounded-[3px] bg-ink-1">
          <svg
            width="6"
            height="6"
            viewBox="0 0 9 9"
            className="absolute top-0 right-0"
            aria-hidden="true"
          >
            <polygon points="0,0 9,0 9,9" fill="var(--flag)" />
          </svg>
        </span>
        FLAG + ANS
      </span>
      <span className={item}>
        <span className="relative size-[13px] flex-none">
          <svg width="13" height="13" viewBox="0 0 43 43" aria-hidden="true">
            <path
              d="M2 11V2h9M32 2h9v9M41 32v9h-9M11 41H2v-9"
              fill="none"
              stroke="var(--blueprint)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </span>
        CURRENT
      </span>
    </div>
  );
}

export default function MarkSheet({
  cells,
  onJump,
  variant,
  open = false,
  onClose,
  onSubmit,
  answered = 0,
  total = 0,
}: MarkSheetProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  // The sheet is a modal: scroll locks, focus is trapped inside, and focus
  // returns to the grid button on close. The rail passes open=false so the
  // hook stays inert there.
  useModalDialog({ open: variant === "sheet" && open, dialogRef });

  if (variant === "rail") {
    return (
      <nav
        aria-label="Mark sheet, jump to question"
        className="relative rounded-r3 border border-line-1 bg-ground-1 p-[18px] pb-4"
      >
        <span
          aria-hidden="true"
          className="absolute -top-px -left-px size-3 border-t-2 border-l-2 border-blueprint"
        />
        <span
          aria-hidden="true"
          className="absolute -top-px -right-px size-3 border-t-2 border-r-2 border-blueprint"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-px -left-px size-3 border-b-2 border-l-2 border-blueprint"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-px -right-px size-3 border-b-2 border-r-2 border-blueprint"
        />
        <p
          className="mb-3 font-mono text-[10px] tracking-[0.16em]"
          style={{ color: "var(--kicker-ink)" }}
        >
          MARK SHEET — JUMP TO
        </p>
        <div className="flex flex-wrap gap-1.5">
          {cells.map((c, i) => (
            <Cell key={c.id} cell={c} index={i} size={34} onJump={onJump} />
          ))}
        </div>
        <Legend />
      </nav>
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 min-[1200px]:hidden">
      {/* Flat scrim, never blurred. Clicking it closes the sheet. */}
      <button
        type="button"
        aria-label="Close mark sheet"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-scrim"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mark sheet, jump to question"
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-r3 border-t border-line-2 bg-ground-1 px-4 pt-4 pb-6"
        style={{ boxShadow: "var(--shadow-float)" }}
      >
        <div className="mb-3 flex items-center">
          <p
            className="font-mono text-[10px] tracking-[0.16em]"
            style={{ color: "var(--kicker-ink)" }}
          >
            MARK SHEET — JUMP TO
          </p>
          <span className="ml-auto font-mono text-[10px] tabular-nums text-ink-3">
            {answered}/{total} · ESC
          </span>
        </div>
        <div className="flex flex-wrap gap-[5px]">
          {cells.map((c, i) => (
            <Cell key={c.id} cell={c} index={i} size={40} onJump={onJump} />
          ))}
        </div>
        <Legend />
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary h-12 flex-1"
          >
            Close
          </button>
          {/* Secondary on purpose: the only primary submit is in the confirm
              bar this opens. */}
          <button
            type="button"
            onClick={onSubmit}
            className="btn-secondary h-12 flex-1"
          >
            Submit exam
          </button>
        </div>
      </div>
    </div>
  );
}
