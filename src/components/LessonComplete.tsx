import { useStore } from "@nanostores/react";
import { $progress, markLessonComplete } from "@/lib/store";

interface LessonCompleteProps {
  slug: string;
}

// Marking a lesson complete fixes its station: the button's open ring gains
// the center dot and the label settles to fixed (M8, one 200ms transition;
// the global reduced-motion rule flattens it). Clicking again un-fixes it —
// progress is the learner's to edit.
export default function LessonComplete({ slug }: LessonCompleteProps) {
  const progress = useStore($progress);
  const done = progress.completedLessons.includes(slug);

  return (
    <button
      type="button"
      onClick={() => markLessonComplete(slug, !done)}
      aria-pressed={done}
      className={
        done
          ? "btn-secondary inline-flex items-center gap-2.5"
          : "btn-primary inline-flex items-center gap-2.5"
      }
      style={
        done
          ? {
              color: "var(--ok)",
              borderColor: "var(--ok-line)",
              transition:
                "color 200ms var(--ease-settle), border-color 200ms var(--ease-settle)",
            }
          : undefined
      }
    >
      <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
        <circle
          cx="9"
          cy="9"
          r="6.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle
          cx="9"
          cy="9"
          r="2.3"
          fill="currentColor"
          style={{
            opacity: done ? 1 : 0,
            transition: "opacity 200ms var(--ease-settle)",
          }}
        />
      </svg>
      {done ? "Fixed — tap to undo" : "Mark lesson complete"}
    </button>
  );
}
