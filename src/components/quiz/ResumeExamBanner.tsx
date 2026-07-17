import { useEffect, useState } from "react";
import { EXAM } from "@/lib/constants";
import { remainingSeconds } from "@/lib/exam";
import {
  clearSavedExam,
  confirmDiscardExam,
  readSavedExam,
  savedAnsweredCount,
  type SavedExam,
} from "@/lib/exam-save";

// While a mock attempt lives in storage, the home and practice pages surface
// it as a slim T1 bar: the facts (time left, marks made) and the two exits.
// The timer keeps counting here because the real one does — reloading the
// site mid-exam never pauses the clock. Renders nothing when no attempt is
// saved, which is almost always.
export default function ResumeExamBanner() {
  const [saved, setSaved] = useState<SavedExam | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Read after mount: localStorage is a client concern and the banner must
  // render nothing during hydration either way.
  useEffect(() => {
    setSaved(readSavedExam());
  }, []);

  useEffect(() => {
    if (!saved) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [saved]);

  if (!saved) return null;

  const remaining = remainingSeconds(EXAM.timeLimitSeconds, saved.startedAt, now);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const answered = savedAnsweredCount(saved);

  const discard = () => {
    if (!confirmDiscardExam()) return;
    clearSavedExam();
    setSaved(null);
  };

  return (
    <div className="relative mb-8 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-r3 border border-line-1 bg-ground-1 py-3.5 pr-4 pl-5 sm:pl-7">
      <span
        aria-hidden="true"
        className="absolute -top-px -left-px size-3 border-t-2 border-l-2 border-blueprint"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-px -left-px size-3 border-b-2 border-l-2 border-blueprint"
      />
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="var(--blueprint)"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="8" cy="9" r="5.4" />
        <path d="M8 9V5.8M6.5 1.5h3" />
      </svg>
      <span className="text-sm font-[560] text-ink-1">Exam in progress</span>
      <span className="font-mono text-xs tabular-nums text-ink-3">
        {mins}:{secs.toString().padStart(2, "0")} REMAINING · {answered} OF{" "}
        {saved.questionIds.length} ANSWERED
      </span>
      <span className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={discard}
          className="btn-ghost px-3.5 py-2 text-[13.5px]"
        >
          Discard
        </button>
        {/* Hash, not query: the service worker's navigation fallback only
            precache-matches clean URLs, and a hash never reaches it. */}
        <a
          href="/practice/exam#resume"
          className="btn-primary px-[18px] py-2 text-[13.5px]"
        >
          Resume exam
        </a>
      </span>
    </div>
  );
}
