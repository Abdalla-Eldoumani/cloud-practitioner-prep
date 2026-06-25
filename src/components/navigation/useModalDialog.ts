import { useCallback, useEffect, useRef } from "react";

// The shared behavior every modal dialog in this directory owes: while it is
// open, background scroll is locked (and the EXACT prior inline overflow is
// restored on close, never clobbered to empty), the element that had focus when
// the dialog opened is remembered and re-focused on close, and Tab / Shift+Tab
// are trapped so focus cannot leave the dialog. Hand-rolled on purpose — the
// palette and the help overlay are both accessible primitives the repo authors
// directly rather than pulling in a dialog dependency.
//
// It is a hook, not a component, so both dialogs share ONE implementation of the
// trap + scroll lock + focus return without a wrapper element getting in the way
// of each dialog's own markup. The caller passes the dialog node ref, whether it
// is open, and what to focus first; the hook wires the rest.

interface ModalDialogOptions {
  // Whether the dialog is currently mounted-open. The lock/trap engage on the
  // open transition and tear down on close.
  open: boolean;
  // The dialog container (role="dialog"). Its focusable descendants form the
  // trap boundary.
  dialogRef: React.RefObject<HTMLElement | null>;
  // The element to focus when the dialog opens (the search input for the
  // palette, the close button for the help). Falls back to the first focusable
  // descendant if this ref is empty.
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

// The selector for the elements a Tab cycle should visit. Kept conservative:
// the interactive controls a dialog actually renders (inputs, buttons, links,
// and anything explicitly made tabbable), minus anything disabled or removed
// from the tab order.
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useModalDialog({
  open,
  dialogRef,
  initialFocusRef,
}: ModalDialogOptions): void {
  // The element focused at open time, restored on close so focus never gets
  // stranded on the body after the dialog goes away.
  const openerRef = useRef<HTMLElement | null>(null);

  // List the dialog's focusable descendants in DOM order at call time (the set
  // changes as results render), so the trap always reflects the current content.
  const focusables = useCallback((): HTMLElement[] => {
    const root = dialogRef.current;
    if (!root) return [];
    return Array.from(
      root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }, [dialogRef]);

  // Scroll lock with snapshot + restore. Capturing the opener and moving focus
  // in happen here too so the open transition is one effect: remember the prior
  // overflow string EXACTLY (it may be a real value, not ""), set hidden, and on
  // cleanup put the original string back rather than assuming empty.
  useEffect(() => {
    if (!open) return;

    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const body = document.body;
    const priorOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    // Move focus into the dialog on open: the requested element, or the first
    // focusable descendant as a fallback.
    const toFocus = initialFocusRef?.current ?? focusables()[0] ?? null;
    toFocus?.focus();

    return () => {
      // Restore the exact prior overflow (never clobber a pre-existing value).
      body.style.overflow = priorOverflow;
      // Return focus to whoever opened the dialog, if it is still in the page.
      const opener = openerRef.current;
      if (opener && document.contains(opener)) {
        opener.focus();
      }
      openerRef.current = null;
    };
  }, [open, initialFocusRef, focusables]);

  // The Tab trap. Intercept only at the boundaries so the browser's natural Tab
  // order works inside the dialog, and wrap from the last focusable back to the
  // first (and vice versa) so focus cycles within the dialog only.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        // Nothing focusable yet: keep focus on the dialog rather than letting
        // Tab escape to the page behind it.
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !dialogRef.current?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !dialogRef.current?.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, focusables, dialogRef]);
}
