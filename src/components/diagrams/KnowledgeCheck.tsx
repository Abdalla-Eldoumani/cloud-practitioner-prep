import { useEffect, useId, useMemo, useState } from "react";
import { shuffle } from "@/lib/exam";
import MarkPill, { type MarkState } from "@/components/quiz/MarkPill";

// A LOCAL inline self-check. It mirrors the quiz reveal idiom in miniature but
// holds its own state ONLY: no nanostores, no $progress, no markLessonComplete,
// no scoring lib, no network. It records NOTHING anywhere — answering it is
// private self-assessment, consistent with the no-tracking posture. Reload the
// lesson and the check is fresh; nothing was persisted.
//
// The shipped QuestionCard is engine-shaped (it takes a Question, confidence,
// flag, index/total), so this does NOT import it; it shares only the small
// MarkPill primitive and replicates the reveal styling, the way the small
// islands stay small and focused.

// One option: a stable id and its visible text. Ids are how correctness is
// compared — never a letter, never a position.
export interface KnowledgeCheckOption {
  id: string;
  text: string;
}

// The full datum for one check. JSON-serializable so it passes from MDX or a
// typed constant, and so the build-time gate can import and validate it without
// a browser. The diagram modules and scripts/check-diagrams.ts import this type.
export interface KnowledgeCheckDatum {
  prompt: string;
  // 2-5 options with stable ids and NO option-letter text.
  options: KnowledgeCheckOption[];
  // The correct option ids (length 1 = single-answer, 2+ = multi). A subset of
  // options[].id — the gate hard-fails an answer key that names a missing id.
  correct: string[];
  // The one-line why, shown on reveal. Names option CONTENT, never a letter or
  // position (the same rule the question bank obeys).
  explanation: string;
  // An optional official AWS source link.
  reference?: { label: string; url: string };
}

function markState(
  revealed: boolean,
  isCorrect: boolean,
  isSelected: boolean,
): MarkState {
  if (!revealed) return isSelected ? "marked" : "empty";
  if (isCorrect && isSelected) return "ok";
  if (isCorrect) return "ok-outline";
  if (isSelected) return "err";
  return "dim";
}

// The reveal surface logic, mirroring the quiz option rows so the check looks
// native inside a lesson.
function rowClass(
  revealed: boolean,
  isCorrect: boolean,
  isSelected: boolean,
): string {
  if (!revealed) {
    return isSelected
      ? "border-blueprint bg-blueprint-dim"
      : "border-line-1 bg-ground-1 hover:border-line-2 hover:bg-ground-2";
  }
  if (isCorrect) return "border-ok-line bg-ok-fill";
  if (isSelected) return "border-err-line bg-err-fill";
  return "border-line-1 bg-ground-1 opacity-[0.62]";
}

export default function KnowledgeCheck({
  prompt,
  options,
  correct,
  explanation,
  reference,
}: KnowledgeCheckDatum) {
  // Local UI state only — the whole point of this widget. `selected` holds the
  // chosen option ids; `revealed` flips on Check. Nothing leaves this component.
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);

  // The same fairness rule as the quiz: authored order (correct first) never
  // reaches the screen. Shuffled once per mount, stable while the check is on
  // screen, fresh on the next visit to the lesson. The shuffle is client-only
  // (the server would draw a different order and hydration would mismatch),
  // so the check renders nothing until mounted — the honest alternatives are
  // an authored-order flash or a seeded, never-changing order, and both lose.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const displayOptions = useMemo(() => shuffle(options), [options]);

  // Single-answer when exactly one id is correct: native radios. Otherwise
  // checkboxes with a "select all that apply" hint, matching the quiz idiom.
  const isMulti = correct.length !== 1;
  const inputType = isMulti ? "checkbox" : "radio";
  const uid = useId();
  const groupName = `kc-${uid}`;
  const resultId = `kc-result-${uid}`;
  const correctSet = new Set(correct);

  function toggle(id: string): void {
    if (revealed) return; // locked once checked
    setSelected((current) => {
      if (isMulti) {
        return current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id];
      }
      // Single-answer: the latest pick replaces any prior one.
      return [id];
    });
  }

  // Correctness is an id-SET comparison, never a position or a letter. Single:
  // the one selected id is the one correct id. Multi: the selected set equals
  // the correct set exactly (no missing, no extra).
  const selectedSet = new Set(selected);
  const isCorrect =
    selectedSet.size === correctSet.size &&
    [...correctSet].every((id) => selectedSet.has(id));

  function reset(): void {
    setSelected([]);
    setRevealed(false);
  }

  if (!mounted) return null;

  return (
    <div className="my-6 rounded-lg border border-line-1 bg-ground-1 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <svg width="13" height="13" viewBox="0 0 18 18" aria-hidden="true">
          <circle
            cx="9"
            cy="9"
            r="6.6"
            fill="none"
            stroke="var(--kicker-ink)"
            strokeWidth="1.6"
          />
          <circle cx="9" cy="9" r="2.3" fill="var(--kicker-ink)" />
        </svg>
        <p className="kicker">Knowledge check</p>
        <span className="t-mono-sm ml-auto uppercase text-ink-3">
          Not scored
        </span>
      </div>

      <fieldset disabled={revealed}>
        <legend className="t-sub mb-3 text-ink-1">{prompt}</legend>
        {isMulti && (
          <p className="t-body-sm mb-3 -mt-1 text-ink-2">
            Select all that apply.
          </p>
        )}

        <ul className="flex flex-col gap-2.5">
          {displayOptions.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const optIsCorrect = correctSet.has(opt.id);
            return (
              <li key={opt.id}>
                <label
                  className={`flex min-h-11 cursor-pointer items-center gap-[15px] rounded-md border px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${rowClass(
                    revealed,
                    optIsCorrect,
                    isSelected,
                  )}`}
                >
                  <input
                    type={inputType}
                    name={groupName}
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => toggle(opt.id)}
                    className="sr-only"
                  />
                  <MarkPill
                    multi={isMulti}
                    state={markState(revealed, optIsCorrect, isSelected)}
                  />
                  {/* Rendered as TEXT (React escapes it); never innerHTML, so an
                      authored label can carry no markup injection. */}
                  <span className="t-body min-w-0 flex-1 font-sans text-ink-1">
                    {opt.text}
                  </span>
                  {/* The state labels are TEXT, not color alone, so the reveal
                      reads the same to a screen reader and in high contrast. */}
                  {revealed && optIsCorrect && isSelected && (
                    <span className="t-mono-sm shrink-0 uppercase text-ok">
                      Your mark — correct
                    </span>
                  )}
                  {revealed && optIsCorrect && !isSelected && (
                    <span className="t-mono-sm shrink-0 uppercase text-ok">
                      Correct answer
                    </span>
                  )}
                  {revealed && isSelected && !optIsCorrect && (
                    <span className="t-mono-sm shrink-0 uppercase text-err">
                      Your mark — incorrect
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            disabled={selected.length === 0}
            className="btn-primary"
          >
            Check
          </button>
        ) : (
          <button type="button" onClick={reset} className="btn-secondary">
            Try again
          </button>
        )}
      </div>

      {/* The result + explanation live in a polite live region so the verdict is
          immediate and screen-reader-audible without moving focus. The verdict
          word (Correct / Not quite) carries the state in TEXT; the explanation
          names option content, never a letter. */}
      <div id={resultId} role="status" aria-live="polite" className="mt-4">
        {revealed && (
          <div className="rounded-lg bg-ground-2 p-4">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <p
                className={`t-mono-label ${isCorrect ? "text-ok" : "text-err"}`}
              >
                {isCorrect ? "Correct" : "Not quite"}
              </p>
              {reference && (
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="t-mono-sm inline-flex items-center gap-1 rounded-sm border px-2 py-1 uppercase text-blueprint-strong transition-colors hover:text-ink-1"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--blueprint) 40%, transparent)",
                  }}
                >
                  {reference.label} ↗
                </a>
              )}
            </div>
            <p className="t-note text-ink-2">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
