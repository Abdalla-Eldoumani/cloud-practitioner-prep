import type { Readiness } from "@/lib/types";
import { readinessLabel } from "@/lib/scoring";

// The one readiness scale, drawn one way everywhere: a station glyph plus a
// mono label in the band's family. Only exam-ready earns the fixed-station
// center dot; the lower bands stay open. Glyph + label + color together, so
// the state never rides on color alone.
export function readinessVars(r: Readiness): {
  color: string;
  line: string;
  fill: string;
} {
  switch (r) {
    case "not-ready":
      return { color: "var(--err)", line: "var(--err-line)", fill: "var(--err-fill)" };
    case "building":
      return { color: "var(--flag)", line: "var(--flag-line)", fill: "var(--flag-fill)" };
    case "on-track":
      return {
        color: "var(--kicker-ink)",
        line: "color-mix(in srgb, var(--blueprint) 40%, transparent)",
        fill: "var(--blueprint-dim)",
      };
    case "exam-ready":
      return { color: "var(--ok)", line: "var(--ok-line)", fill: "var(--ok-fill)" };
  }
}

interface BandChipProps {
  readiness: Readiness;
  size?: "sm" | "md";
  className?: string;
  style?: React.CSSProperties;
}

export default function BandChip({
  readiness,
  size = "md",
  className = "",
  style,
}: BandChipProps) {
  const v = readinessVars(readiness);
  const glyph = size === "md" ? 14 : 12;
  return (
    <span
      className={`inline-flex items-center rounded-r1 border font-mono uppercase ${
        size === "md"
          ? "gap-2.5 px-4 py-2.5 text-xs tracking-[0.16em]"
          : "gap-2 px-3 py-2 text-[10.5px] tracking-[0.14em]"
      } ${className}`}
      style={{ color: v.color, borderColor: v.line, background: v.fill, ...style }}
    >
      <svg width={glyph} height={glyph} viewBox="0 0 18 18" aria-hidden="true">
        <circle
          cx="9"
          cy="9"
          r="6.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        {readiness === "exam-ready" && (
          <circle cx="9" cy="9" r="2.3" fill="currentColor" />
        )}
      </svg>
      {readinessLabel(readiness)}
    </span>
  );
}
