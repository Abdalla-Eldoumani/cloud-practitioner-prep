import { useRef, useState } from "react";
import { $progress } from "@/lib/store";
import { saveProgress, storageAvailable } from "@/lib/progress";
import { exportProgress, importProgress } from "@/lib/progress-io";

// Back up and restore progress as a JSON file the learner owns. The pure
// serialize/validate core lives in lib/progress-io.ts; this island is only the
// browser IO around it: a Blob download for export and a file input for import.
//
// Import is untrusted input. importProgress validates defensively and never
// throws, returning a discriminated result. On success we OVERWRITE the store
// only after an explicit confirm; on failure we keep current progress and show
// the reason. Any imported string (the error, restored values) renders as TEXT
// only — React escapes by default, so a forged file cannot inject markup; we
// never use innerHTML / dangerouslySetInnerHTML.
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
      // Untrusted: render the reason as plain text, keep current progress.
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
  }

  return (
    <div className="rounded-lg border border-hairline bg-raised p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-ink">Back up your progress</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Download a JSON copy of your progress, or restore one on this device.
        Importing replaces what is saved here.
      </p>

      {!persists && (
        <div className="mt-4 rounded-md border border-flag bg-surface px-4 py-3 text-sm text-ink">
          Storage is unavailable in this browser, so an import will not be saved
          between visits.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong"
        >
          Download progress
        </button>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-brand">
          <span>Import progress</span>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="sr-only"
          />
        </label>
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-ink-soft">
        {status}
      </p>
    </div>
  );
}
