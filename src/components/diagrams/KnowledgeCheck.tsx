import { useId, useState } from "react";

// A LOCAL inline self-check. It mirrors the quiz reveal idiom in miniature but
// holds its own state ONLY: no nanostores, no $progress, no markLessonComplete,
// no scoring lib, no network. It records NOTHING anywhere — answering it is
// private self-assessment, consistent with the no-tracking posture. Reload the
// lesson and the check is fresh; nothing was persisted.
//
// The shipped QuestionCard is engine-shaped (it takes a Question, confidence,
// flag, index/total), so this does NOT import it; it replicates the few lines of
// reveal styling and the fieldset/legend + native input structure instead, the
// way the small islands stay small and focused.

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

// The reveal color logic, replicated from the shipped question reveal so the
// check looks native. Not revealed: selected is brand/info, the rest are plain.
// Revealed: a correct option is green, a selected-but-wrong option is red, and
// every other option dims so the eye lands on the answer.
function optionStateClass(
  revealed: boolean,
  isCorrect: boolean,
  isSelected: boolean,
): string {
  if (!revealed) {
    return isSelected
      ? "border-brand bg-info-soft"
      : "border-hairline bg-raised hover:border-brand";
  }
  if (isCorrect) return "border-correct bg-correct-soft";
  if (isSelected) return "border-danger bg-danger-soft";
  return "border-hairline bg-raised opacity-70";
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

  return (
    <div className="my-6 rounded-lg border border-hairline bg-raised p-4 sm:p-5">
      <p className="mb-3 font-mono text-xs uppercase tracking-wide text-ink-soft">
        Check yourself
      </p>

      <fieldset disabled={revealed}>
        <legend className="mb-3 text-base font-semibold leading-snug text-ink">
          {prompt}
        </legend>
        {isMulti && (
          <p className="mb-3 -mt-1 text-sm text-ink-soft">
            Select all that apply.
          </p>
        )}

        <ul className="flex flex-col gap-2.5">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const optIsCorrect = correctSet.has(opt.id);
            return (
              <li key={opt.id}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${optionStateClass(
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
                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                  />
                  {/* Rendered as TEXT (React escapes it); never innerHTML, so an
                      authored label can carry no markup injection. */}
                  <span className="text-ink">{opt.text}</span>
                  {/* The state labels are TEXT, not color alone, so the reveal
                      reads the same to a screen reader and in high contrast. */}
                  {revealed && optIsCorrect && (
                    <span className="ml-auto shrink-0 text-sm font-semibold text-ink">
                      Correct
                    </span>
                  )}
                  {revealed && isSelected && !optIsCorrect && (
                    <span className="ml-auto shrink-0 text-sm font-semibold text-ink">
                      Your choice
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
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-raised transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand"
          >
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
          <div className="rounded-md border border-hairline bg-surface p-4">
            <p className="mb-1 text-sm font-semibold text-ink">
              {isCorrect ? "Correct" : "Not quite"}
            </p>
            <p className="text-ink-soft">{explanation}</p>
            {reference && (
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-brand underline underline-offset-2"
              >
                {reference.label}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
