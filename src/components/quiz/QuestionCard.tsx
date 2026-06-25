import type { Confidence, Option, Question } from "@/lib/types";

// The confidence levels in ascending order, left to right. The label carries the
// state (never color alone), and the value is what the store records.
const CONFIDENCE_LEVELS: { value: Confidence; label: string }[] = [
  { value: "guessing", label: "Guessing" },
  { value: "unsure", label: "Unsure" },
  { value: "confident", label: "Confident" },
];

interface QuestionCardProps {
  question: Question;
  selected: string[];
  // When true, the card shows which options are correct and the explanation.
  revealed: boolean;
  flagged: boolean;
  // index and total drive the small "Question 3 of 10" label.
  index: number;
  total: number;
  onToggleOption: (optionId: string) => void;
  onToggleFlag: () => void;
  // Ordered option ids, computed once per instance by the engine and passed in so
  // a resumed exam shows the exact saved order (never a fresh shuffle). When
  // absent or empty the card renders question.options as-is.
  optionOrder?: string[];
  // Confidence gate (practice/review only). When showConfidence is false (exam,
  // results-review map) the fieldset is not rendered and there is no gate.
  showConfidence?: boolean;
  confidence?: Confidence;
  onSetConfidence?: (level: Confidence) => void;
}

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

export default function QuestionCard({
  question,
  selected,
  revealed,
  flagged,
  index,
  total,
  onToggleOption,
  onToggleFlag,
  optionOrder,
  showConfidence = false,
  confidence,
  onSetConfidence,
}: QuestionCardProps) {
  const isMulti = question.type === "multi";
  const inputType = isMulti ? "checkbox" : "radio";
  const groupName = `q-${question.id}`;
  const rationales = question.distractorRationales;
  // Render in the engine-supplied id order when given (resume restores the exact
  // shown order); map each id to its option, dropping any id with no match
  // defensively. Fall back to question.options when no order is supplied.
  const byId = new Map(question.options.map((o) => [o.id, o]));
  const displayOptions: Option[] =
    optionOrder && optionOrder.length > 0
      ? optionOrder
          .map((id) => byId.get(id))
          .filter((o): o is Option => o !== undefined)
      : question.options;

  return (
    <article className="rounded-lg border border-hairline bg-raised p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink-soft">
          Question {index + 1} of {total}
        </span>
        <button
          type="button"
          onClick={onToggleFlag}
          aria-pressed={flagged}
          className={`rounded-md border px-2.5 py-1 text-sm font-medium transition-colors ${
            flagged
              ? "border-flag text-flag"
              : "border-hairline text-ink-soft hover:border-flag hover:text-flag"
          }`}
        >
          {flagged ? "Flagged" : "Flag"}
        </button>
      </div>

      <fieldset>
        <legend className="mb-4 text-lg font-semibold leading-snug text-ink">
          {question.stem}
        </legend>
        {isMulti && (
          <p className="mb-3 -mt-2 text-sm text-ink-soft">
            Select all that apply.
          </p>
        )}

        <ul className="flex flex-col gap-2.5">
          {displayOptions.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const isCorrect = question.correct.includes(opt.id);
            // Per-distractor reason: only for wrong options, only when an
            // authored rationale exists. No structured reason -> no line; the
            // reveal-block prose explanation always carries the why.
            const reason =
              revealed && !isCorrect ? rationales?.[opt.id] : undefined;
            return (
              <li key={opt.id}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-colors ${optionStateClass(
                    revealed,
                    isCorrect,
                    isSelected,
                  )}`}
                >
                  <input
                    type={inputType}
                    name={groupName}
                    value={opt.id}
                    checked={isSelected}
                    disabled={revealed}
                    onChange={() => onToggleOption(opt.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-brand"
                  />
                  <span className="text-ink">{opt.text}</span>
                  {revealed && isCorrect && (
                    <span className="ml-auto shrink-0 text-sm font-semibold text-ink">
                      Correct
                    </span>
                  )}
                  {revealed && isSelected && !isCorrect && (
                    <span className="ml-auto shrink-0 text-sm font-semibold text-ink">
                      Your choice
                    </span>
                  )}
                </label>
                {reason && (
                  // Indented to align under the option text (clears the control
                  // box + gap). Muted text, not text-danger: the row border
                  // already signals wrong, and color-as-text fails AA.
                  <div className="mt-1.5 pl-7">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Why not this
                    </p>
                    <p className="text-sm text-ink-soft">{reason}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      {showConfidence && (
        // Confidence gate: a level must be picked before Check answer is
        // enabled, so confidence is captured before the reveal. After reveal the
        // pills lock (disabled) but the chosen one stays visibly selected.
        <fieldset className="mt-5" disabled={revealed}>
          <legend className="mb-2 text-sm font-medium text-ink">
            How sure are you?
          </legend>
          <div className="flex flex-wrap gap-2">
            {CONFIDENCE_LEVELS.map((level) => {
              const isActive = confidence === level.value;
              return (
                <label
                  key={level.value}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
                    isActive
                      ? "border-brand bg-info-soft text-brand"
                      : "border-hairline text-ink-soft hover:border-brand"
                  } ${revealed ? "cursor-default" : ""}`}
                >
                  <input
                    type="radio"
                    name={`confidence-${question.id}`}
                    value={level.value}
                    checked={isActive}
                    onChange={() => onSetConfidence?.(level.value)}
                    className="sr-only"
                  />
                  {level.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {revealed && (
        <div className="mt-5 rounded-md border border-hairline bg-surface p-4">
          <p className="mb-1 text-sm font-semibold text-ink">Explanation</p>
          <p className="text-ink-soft">{question.explanation}</p>
          <a
            href={question.reference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-brand underline underline-offset-2"
          >
            {question.reference.label}
          </a>
        </div>
      )}
    </article>
  );
}
