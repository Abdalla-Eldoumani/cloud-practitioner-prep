import { useMemo, type ReactNode } from "react";
import type { Confidence, Option, Question } from "@/lib/types";
import { orderedOptions } from "@/lib/options";
import MarkPill, { type MarkState } from "./MarkPill";

// The confidence levels in ascending order, left to right. The label carries
// the state (never color alone), and the value is what the store records.
const CONFIDENCE_LEVELS: { value: Confidence; label: string }[] = [
  { value: "guessing", label: "Guessing" },
  { value: "unsure", label: "Unsure" },
  { value: "confident", label: "Confident" },
];

// Compact domain wayfinding on the card header. Presentation only; the full
// domain names live with the data.
const DOMAIN_SHORT: Record<number, string> = {
  1: "Concepts",
  2: "Security",
  3: "Technology",
  4: "Billing",
};

const CHOOSE_WORD: Record<number, string> = { 2: "two", 3: "three" };

interface QuestionCardProps {
  question: Question;
  selected: string[];
  // When true, the card shows which options are correct and the explanation.
  revealed: boolean;
  flagged: boolean;
  // index and total drive the "Q.03 / 10" label.
  index: number;
  total: number;
  onToggleOption: (optionId: string) => void;
  onToggleFlag: () => void;
  // Ordered option ids, computed once per sitting by the engine and passed in
  // so a resumed exam shows the exact saved order (never a fresh shuffle).
  // When absent, the card shuffles once per question instance itself, so every
  // mode renders a fair order by construction: the authored order (correct
  // options first) can never reach the screen.
  optionOrder?: string[];
  // Confidence gate (practice/review only). When showConfidence is false
  // (exam, results-review) the fieldset is not rendered and there is no gate.
  showConfidence?: boolean;
  confidence?: Confidence;
  onSetConfidence?: (level: Confidence) => void;
  // The exam room hides the domain badge: the real exam does not label
  // questions by domain, and the mock simulates the room.
  showDomain?: boolean;
  // Exam-room presentation: wider padding, the F key hint on the flag chip,
  // no domain badge, and the flag chip yields to the bottom action bar's flag
  // square on small screens (one control per fact per viewport).
  examRoom?: boolean;
  // Rendered inside the card after everything else; the exam room passes its
  // Previous/Next row here so navigation reads as part of the sheet.
  footer?: ReactNode;
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
  showDomain = true,
  examRoom = false,
  footer,
}: QuestionCardProps) {
  const isMulti = question.type === "multi";
  const inputType = isMulti ? "checkbox" : "radio";
  const groupName = `q-${question.id}`;
  const rationales = question.distractorRationales;
  const chooseCount = question.correct.length;

  // The fairness guarantee of the quiz surface: when the engine has not fixed
  // an order (every non-exam mode), shuffle once per question instance and
  // hold it while the question is on screen. Keyed on the question id, so
  // moving to the next question redraws while re-renders of the same question
  // never reshuffle under the learner.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fallbackOrder = useMemo(
    () => orderedOptions(question).map((o) => o.id),
    [question.id],
  );

  const byId = new Map(question.options.map((o) => [o.id, o]));
  const orderIds =
    optionOrder && optionOrder.length > 0 ? optionOrder : fallbackOrder;
  const displayOptions: Option[] = orderIds
    .map((id) => byId.get(id))
    .filter((o): o is Option => o !== undefined);

  const answeredCorrectly =
    selected.length === question.correct.length &&
    question.correct.every((id) => selected.includes(id));

  const wrongAndConfident =
    revealed && showConfidence && confidence === "confident" && !answeredCorrectly;

  // Rationales for wrong options the learner did NOT pick, folded into the
  // explanation panel; the picked-wrong option gets its reason inline.
  const alsoWrong = revealed
    ? displayOptions.filter(
        (o) =>
          !question.correct.includes(o.id) &&
          !selected.includes(o.id) &&
          rationales?.[o.id],
      )
    : [];

  return (
    <article
      className={`rounded-lg border border-line-1 bg-ground-1 p-5 ${
        examRoom ? "sm:px-9 sm:py-[30px]" : "sm:p-6"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <span className="t-mono text-ink-3">
            <span className="font-[620] text-ink-1">
              Q.{String(index + 1).padStart(2, "0")}
            </span>{" "}
            / {total}
          </span>
          {showDomain && !examRoom && (
            <span
              className="t-mono-sm inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 uppercase"
              style={{
                color: `var(--d${question.domain})`,
                borderColor: `color-mix(in srgb, var(--d${question.domain}) 40%, transparent)`,
                background: `color-mix(in srgb, var(--d${question.domain}) 10%, transparent)`,
              }}
            >
              D{question.domain} · {DOMAIN_SHORT[question.domain]}
            </span>
          )}
          {isMulti && (
            <span className="t-mono-sm rounded-sm border border-line-2 px-2 py-0.5 uppercase text-ink-2">
              Choose {CHOOSE_WORD[chooseCount] ?? chooseCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleFlag}
          aria-pressed={flagged}
          className={`t-mono-sm flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-1.5 uppercase transition-colors ${
            examRoom ? "max-sm:hidden" : ""
          } ${
            flagged
              ? "border-flag-line bg-flag-fill text-flag"
              : "border-line-1 text-ink-3 hover:border-flag-line hover:text-flag"
          }`}
        >
          <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
            <path
              d="M1.5 1v10M1.5 1.5h7L6 4l2.5 2.5h-7"
              fill={flagged ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"></path>
          </svg>
          {flagged ? "Flagged" : "Flag"}
          {examRoom && (
            <span
              aria-hidden="true"
              className="rounded-r1 border border-line-2 bg-ground-0 px-[5px] text-[10px] normal-case text-ink-3"
            >
              F
            </span>
          )}
        </button>
      </div>

      <fieldset>
        <legend className="t-stem mb-4 text-ink-1">{question.stem}</legend>
        {isMulti && (
          <p className="t-body-sm mb-3 -mt-2 text-ink-2" aria-live="polite">
            {revealed
              ? "Select all that apply."
              : `${selected.length} of ${chooseCount} marked`}
          </p>
        )}

        <ul className="flex flex-col gap-2.5">
          {displayOptions.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const isCorrect = question.correct.includes(opt.id);
            // Inline reason only under the wrong option the learner actually
            // picked; the other distractors' reasons fold into the panel below.
            const reason =
              revealed && !isCorrect && isSelected
                ? rationales?.[opt.id]
                : undefined;
            return (
              <li key={opt.id}>
                <label
                  className={`flex min-h-11 cursor-pointer items-center gap-[15px] rounded-md border px-4 py-3.5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${rowClass(
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
                    className="sr-only"
                  />
                  <MarkPill
                    multi={isMulti}
                    state={markState(revealed, isCorrect, isSelected)}
                  />
                  <span className="t-body min-w-0 flex-1 text-ink-1">
                    {opt.text}
                  </span>
                  {!revealed && isSelected && (
                    <span className="t-mono-sm shrink-0 uppercase text-blueprint-strong">
                      Marked
                    </span>
                  )}
                  {revealed && isCorrect && isSelected && (
                    <span className="t-mono-sm shrink-0 uppercase text-ok">
                      Your mark — correct
                    </span>
                  )}
                  {revealed && isCorrect && !isSelected && (
                    <span className="t-mono-sm shrink-0 uppercase text-ok">
                      Correct answer
                    </span>
                  )}
                  {revealed && !isCorrect && isSelected && (
                    <span className="t-mono-sm shrink-0 uppercase text-err">
                      Your mark — incorrect
                    </span>
                  )}
                </label>
                {reason && (
                  <div
                    className="ml-[41px] mt-1.5 border-l-[3px] py-0.5 pl-3"
                    style={{ borderColor: "var(--err-line)" }}
                  >
                    <p className="t-mono-label text-err">Why not</p>
                    <p className="t-body-sm mt-0.5 text-ink-2">{reason}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      {showConfidence && (
        // Confidence gate: a level must be picked before Check answer is
        // enabled, so confidence is captured before the reveal. After reveal
        // the segments lock (disabled) but the chosen one stays selected.
        <fieldset className="mt-5" disabled={revealed}>
          <div className="flex flex-wrap items-center gap-3">
            <legend className="t-body-sm float-left mr-1 text-ink-2">
              How sure?
            </legend>
            <div className="inline-flex overflow-hidden rounded-sm border border-line-1">
              {CONFIDENCE_LEVELS.map((level, i) => {
                const isActive = confidence === level.value;
                return (
                  <label
                    key={level.value}
                    className={`t-mono-sm cursor-pointer px-[15px] py-[7px] uppercase transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-focus ${
                      i > 0 ? "border-l border-line-1" : ""
                    } ${
                      isActive
                        ? "bg-action text-ink-inverse"
                        : "text-ink-3 hover:bg-ground-2 hover:text-ink-1"
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
                    {isActive ? " ✓" : ""}
                  </label>
                );
              })}
            </div>
          </div>
        </fieldset>
      )}

      {wrongAndConfident && (
        <p className="t-mono-sm mt-4 inline-flex items-center gap-1.5 rounded-sm border border-flag-line bg-flag-fill px-2.5 py-1.5 uppercase text-flag">
          <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
            <path
              d="M1.5 1v10M1.5 1.5h7L6 4l2.5 2.5h-7"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"></path>
          </svg>
          Marked confident — logged for review
        </p>
      )}

      {revealed && (
        <div className="mt-5 rounded-lg bg-ground-2 p-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="t-mono-label text-blueprint-strong">Why</p>
            <a
              href={question.reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="t-mono-sm inline-flex items-center gap-1 rounded-sm border px-2 py-1 uppercase text-blueprint-strong transition-colors hover:text-ink-1"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--blueprint) 40%, transparent)",
              }}
            >
              {question.reference.label} ↗
            </a>
          </div>
          <p className="t-note text-ink-2">{question.explanation}</p>
          {alsoWrong.length > 0 && (
            <div className="mt-3 border-t border-line-1 pt-3">
              {alsoWrong.map((o) => (
                <p key={o.id} className="t-body-sm mt-1 text-ink-2">
                  <span className="t-mono-label mr-2 text-ink-3">
                    Also wrong
                  </span>
                  {rationales?.[o.id]}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {footer}
    </article>
  );
}
