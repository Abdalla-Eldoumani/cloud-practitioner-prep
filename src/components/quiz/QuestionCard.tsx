import type { Question } from "@/lib/types";

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
}: QuestionCardProps) {
  const isMulti = question.type === "multi";
  const inputType = isMulti ? "checkbox" : "radio";
  const groupName = `q-${question.id}`;

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
          {question.options.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const isCorrect = question.correct.includes(opt.id);
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
                    <span className="ml-auto shrink-0 text-sm font-semibold text-correct">
                      Correct
                    </span>
                  )}
                  {revealed && isSelected && !isCorrect && (
                    <span className="ml-auto shrink-0 text-sm font-semibold text-danger">
                      Your choice
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

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
