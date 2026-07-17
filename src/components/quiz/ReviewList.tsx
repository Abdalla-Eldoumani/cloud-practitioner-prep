import type { Question } from "@/lib/types";
import { isAnswerCorrect } from "@/lib/scoring";

// The post-mock review list: every question as a compact expandable row,
// missed first, then the rest in sitting order. A row opens to the fact of
// the matter — your mark against the correct one, then the why — without
// re-rendering the whole question card. Rows carry anchors (rq-N) so the
// tally's outlined marks jump straight to their review.

interface ReviewListProps {
  questions: Question[];
  answers: Record<string, string[]>;
}

// Domain glyphs, matched to the domain color tokens: D1 circle, D2 diamond,
// D3 triangle-down, D4 square. Shape + label together, never color alone.
function DomainGlyph({ domain }: { domain: 1 | 2 | 3 | 4 }) {
  const stroke = `var(--d${domain})`;
  return (
    <svg width="9" height="9" viewBox="0 0 11 11" aria-hidden="true">
      {domain === 1 && (
        <circle cx="5.5" cy="5.5" r="4.2" fill="none" stroke={stroke} strokeWidth="1.6" />
      )}
      {domain === 2 && (
        <rect
          x="2.4"
          y="2.4"
          width="6.2"
          height="6.2"
          fill="none"
          stroke={stroke}
          strokeWidth="1.6"
          transform="rotate(45 5.5 5.5)"
        />
      )}
      {domain === 3 && (
        <polygon points="1.5,2.5 9.5,2.5 5.5,9" fill="none" stroke={stroke} strokeWidth="1.6" />
      )}
      {domain === 4 && (
        <rect x="2.2" y="2.2" width="6.6" height="6.6" fill="none" stroke={stroke} strokeWidth="1.6" />
      )}
    </svg>
  );
}

function optionText(q: Question, ids: string[]): string {
  const byId = new Map(q.options.map((o) => [o.id, o.text]));
  return ids
    .map((id) => byId.get(id))
    .filter((t): t is string => !!t)
    .join(" + ");
}

export default function ReviewList({ questions, answers }: ReviewListProps) {
  const rows = questions.map((q, i) => ({
    q,
    n: i + 1,
    selected: answers[q.id] ?? [],
    correct: isAnswerCorrect(q, answers[q.id] ?? []),
  }));
  const ordered = [...rows.filter((r) => !r.correct), ...rows.filter((r) => r.correct)];
  const missedCount = rows.length - rows.filter((r) => r.correct).length;

  return (
    <section id="review" aria-label="Review every question" className="mt-10 border-t border-line-1 pt-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="t-mono-label" style={{ color: "var(--kicker-ink)" }}>
          Review — every question
        </p>
        <p className="t-mono-sm uppercase text-ink-3">
          {missedCount} missed first · then 1–{rows.length}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {ordered.map(({ q, n, selected, correct }) => {
          const yourMark =
            selected.length > 0 ? optionText(q, selected) : "none — left blank";
          const correctMark = optionText(q, q.correct);
          return (
            <details
              key={q.id}
              id={`rq-${n}`}
              className={`overflow-hidden rounded-r2 border bg-ground-1 ${
                correct ? "border-line-1 opacity-75 open:opacity-100" : ""
              }`}
              style={correct ? undefined : { borderColor: "var(--err-line)" }}
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3.5 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <span className="t-mono-sm flex-none tabular-nums text-ink-3">
                  Q.{String(n).padStart(2, "0")}
                </span>
                <span className="flex flex-none items-center gap-1.5">
                  <DomainGlyph domain={q.domain} />
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: `var(--d${q.domain})` }}
                  >
                    D{q.domain}
                  </span>
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[14.5px] ${
                    correct ? "text-ink-2" : "text-ink-1"
                  }`}
                >
                  {q.stem}
                </span>
                <span
                  className="flex-none font-mono text-[10px] tracking-[0.12em]"
                  style={{ color: correct ? "var(--ok)" : "var(--err)" }}
                >
                  {correct ? "✓ CORRECT" : "✗ MISSED"}
                </span>
                <span aria-hidden="true" className="flex-none text-ink-3">
                  &#9662;
                </span>
              </summary>
              <div className="border-t border-line-1 bg-ground-2 px-4 py-4">
                <div className="flex flex-wrap gap-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-r1 border px-3 py-1.5 text-[13px] text-ink-1"
                    style={{
                      borderColor: correct ? "var(--ok-line)" : "var(--err-line)",
                      background: correct ? "var(--ok-fill)" : "var(--err-fill)",
                    }}
                  >
                    <span
                      className="inline-block h-[9px] w-[18px] rounded-full"
                      style={{ background: correct ? "var(--ok)" : "var(--err)" }}
                    />
                    Your mark: {yourMark}
                  </span>
                  {!correct && (
                    <span
                      className="inline-flex items-center gap-2 rounded-r1 border px-3 py-1.5 text-[13px] text-ink-1"
                      style={{
                        borderColor: "var(--ok-line)",
                        background: "var(--ok-fill)",
                      }}
                    >
                      <span
                        className="box-border inline-block h-[9px] w-[18px] rounded-full border-2"
                        style={{ borderColor: "var(--ok)" }}
                      />
                      Correct: {correctMark}
                    </span>
                  )}
                </div>
                <p className="t-note mt-3 text-ink-2">{q.explanation}</p>
                <a
                  href={q.reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="t-mono-sm mt-3 inline-flex items-center gap-1 rounded-r1 border px-2 py-1 uppercase transition-colors hover:text-ink-1"
                  style={{
                    color: "var(--kicker-ink)",
                    borderColor:
                      "color-mix(in srgb, var(--blueprint) 40%, transparent)",
                  }}
                >
                  {q.reference.label} &#8599;
                </a>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
