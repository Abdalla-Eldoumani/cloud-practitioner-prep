import { useStore } from "@nanostores/react";
import { $progress, markLessonComplete } from "@/lib/store";

interface LessonCompleteProps {
  slug: string;
}

export default function LessonComplete({ slug }: LessonCompleteProps) {
  const progress = useStore($progress);
  const done = progress.completedLessons.includes(slug);

  return (
    <button
      type="button"
      onClick={() => markLessonComplete(slug, !done)}
      aria-pressed={done}
      className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 font-medium transition-colors ${
        done
          ? "border-correct bg-correct-soft text-correct"
          : "border-hairline text-ink hover:border-brand"
      }`}
    >
      {done ? "Completed" : "Mark complete"}
    </button>
  );
}
