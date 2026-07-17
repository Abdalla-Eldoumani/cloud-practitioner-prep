// The answer-sheet mark. A filled mark always means "your commitment"; the
// outline weight and glyph carry the verdict so state never rides on color
// alone. Single-answer questions use the oval bubble, multi-answer use the
// square box (checkbox semantics at a glance).

export type MarkState =
  | "empty" // untouched
  | "marked" // selected, pre-reveal
  | "ok" // your mark, correct (filled, check)
  | "ok-outline" // the correct answer you did not pick (outline only)
  | "err" // your mark, incorrect (filled, cross)
  | "dim"; // an unchosen distractor after reveal

interface MarkPillProps {
  multi?: boolean;
  state: MarkState;
}

const GLYPH_STROKE = "var(--ground-1)";

function Glyph({ kind }: { kind: "check" | "cross" }) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
      {kind === "check" ? (
        <path
          d="M1.5 5.5 4 8l4.5-6"
          fill="none"
          stroke={GLYPH_STROKE}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M2 2l6 6M8 2l-6 6"
          fill="none"
          stroke={GLYPH_STROKE}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default function MarkPill({ multi = false, state }: MarkPillProps) {
  const shape = multi
    ? "h-[17px] w-[17px] rounded-[4px]"
    : "h-[11px] w-[26px] rounded-full";

  let look = "";
  let glyph: "check" | "cross" | null = null;
  switch (state) {
    case "empty":
      look = "border-2";
      break;
    case "marked":
      look = "bg-blueprint";
      glyph = multi ? "check" : null;
      break;
    case "ok":
      look = "bg-ok";
      glyph = "check";
      break;
    case "ok-outline":
      look = "border-2 border-ok";
      break;
    case "err":
      look = "bg-err";
      glyph = "cross";
      break;
    case "dim":
      look = "border-2 border-line-1";
      break;
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${shape} ${look}`}
      style={
        state === "empty"
          ? { borderColor: "color-mix(in srgb, var(--blueprint) 55%, transparent)" }
          : undefined
      }
    >
      {glyph && <Glyph kind={glyph} />}
    </span>
  );
}
