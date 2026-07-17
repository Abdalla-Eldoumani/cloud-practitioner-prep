import { useEffect, useRef } from "react";
import { useModalDialog } from "./useModalDialog";

// The discoverable keyboard-shortcuts overlay, opened with "?" from anywhere
// outside a text field. It is the same modal-dialog recipe as the command
// palette (a labelled role="dialog" aria-modal, focus moves in on open, focus
// trapped, Escape and a backdrop click close and return focus, background scroll
// locked) sharing the trap + scroll-lock + focus-return through useModalDialog,
// so there is one implementation of that behavior. Its body is just the shortcut
// list rendered as text: each row is a key and the action it performs, so the
// meaning never depends on color alone.

interface ShortcutsHelpProps {
  // Whether the overlay is open. The parent (the palette island) owns this and
  // the two are mutually exclusive.
  open: boolean;
  // Close request: Escape, a backdrop click, or the visible Close button all
  // call this; the parent flips `open` to false and focus returns to the opener.
  onClose: () => void;
}

// The shortcuts shown, as plain data so each renders as key + action text. Kept
// in lockstep with the global trigger in the layout and the palette's own keys.
const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: "Cmd / Ctrl + K", action: "Open the command palette" },
  { keys: "?", action: "Open this shortcuts help" },
  { keys: "Esc", action: "Close the palette or this help" },
  { keys: "Up / Down", action: "Move the highlighted result" },
  { keys: "Enter", action: "Open the highlighted result" },
];

export default function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Share the trap, the scroll lock (snapshot + restore), and the focus return
  // with the palette; focus lands on the Close button when the overlay opens.
  useModalDialog({ open, dialogRef, initialFocusRef: closeRef });

  // Escape closes from anywhere in the overlay. Bound while open only.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // The backdrop is decorative (aria-hidden) and closes on click; the dialog
    // stops propagation so a click inside it does not close. Any entrance is
    // opacity only and the global reduced-motion rule collapses it, so the
    // overlay is fully usable with no motion.
    <div
      aria-hidden="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-scrim p-4 pt-[12vh]"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-help-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-r3 border border-line-2 bg-ground-1 p-5 sm:p-6" style={{ boxShadow: "var(--shadow-float)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="shortcuts-help-title"
            className="t-title text-[19px] text-ink-1"
          >
            Keyboard shortcuts
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="t-mono-sm rounded-r1 border border-line-1 px-2.5 py-1 uppercase text-ink-3 transition-colors hover:border-line-2 hover:text-ink-1"
          >
            Close
          </button>
        </div>

        <dl className="mt-4 flex flex-col gap-2">
          {SHORTCUTS.map((s) => (
            <div
              key={s.keys}
              className="flex items-center justify-between gap-4 border-b border-line-1 pb-2 last:border-0 last:pb-0"
            >
              <dt>
                <kbd className="rounded-r1 border border-line-1 bg-ground-0 px-2 py-0.5 font-mono text-xs text-ink-1">
                  {s.keys}
                </kbd>
              </dt>
              <dd className="text-right text-sm text-ink-2">{s.action}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
