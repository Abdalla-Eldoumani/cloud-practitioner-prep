import { useRef, useState } from "react";
import { $progress } from "@/lib/store";
import {
  clearProgress,
  defaultProgress,
  saveProgress,
  storageAvailable,
} from "@/lib/progress";
import { exportProgress, importProgress } from "@/lib/progress-io";

// The data controls: progress is a file the learner owns. Export and import
// are ordinary secondaries; Clear is the destructive one and takes a typed
// word, not a click. The pure serialize/validate core lives in
// lib/progress-io.ts; this island is only the browser IO around it.
//
// Import is untrusted input. importProgress validates defensively and never
// throws; on success the store is overwritten only after an explicit confirm,
// and any imported string renders as TEXT only (React escapes by default;
// never innerHTML).
export default function ProgressIO() {
  const persists = storageAvailable();
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = exportProgress($progress.get());
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ccp-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus("Progress downloaded.");
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // Reset the value so picking the SAME file again still fires change.
    input.value = "";
    if (!file) return;

    let text: string;
    try {
      text = await file.text();
    } catch {
      setStatus("Could not read that file.");
      return;
    }

    const result = importProgress(text);
    if (!result.ok) {
      setStatus(`Import failed: ${result.error}`);
      return;
    }

    const ok = window.confirm(
      "Replace your current progress on this device with the imported file?",
    );
    if (!ok) {
      setStatus("Import cancelled. Your progress is unchanged.");
      return;
    }

    $progress.set(result.state);
    saveProgress(result.state);
    setStatus("Progress imported.");
    if (!persists) {
      setStatus("Progress imported for this session; storage is unavailable.");
    }
  }

  function handleClear() {
    const typed = window.prompt(
      "This erases every mark on this device — lessons, attempts, the review queue. Type CLEAR to confirm.",
    );
    if (typed === null || typed.trim().toUpperCase() !== "CLEAR") {
      setStatus("Clear cancelled. Your progress is unchanged.");
      return;
    }
    clearProgress();
    $progress.set(defaultProgress());
    setStatus("Progress cleared.");
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={handleExport}
          className="btn-secondary px-4 py-2 text-[13.5px]"
        >
          Export JSON
        </button>
        <label className="btn-secondary cursor-pointer px-4 py-2 text-[13.5px]">
          <span>Import</span>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="sr-only"
          />
        </label>
        <button
          type="button"
          onClick={handleClear}
          className="btn-destructive px-4 py-2 text-[13.5px]"
        >
          Clear…
        </button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="t-body-sm min-h-5 text-ink-3"
      >
        {status}
      </p>
    </div>
  );
}
