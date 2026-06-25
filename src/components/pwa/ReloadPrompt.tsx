import { useRegisterSW } from "virtual:pwa-register/react";

// The reload prompt: a single client:idle island, mounted once by the layout,
// that surfaces a new version as an opt-in reload. The app registers its
// service worker in prompt mode (not auto-update) on purpose, so a fresh deploy
// NEVER reloads a learner out of an in-progress timed exam — the new version
// waits until someone clicks Reload here.
//
// Accessibility is the bar: this is a NON-modal status affordance, not a
// focus-trapping dialog. It is a labelled polite live region that appears
// asynchronously WITHOUT stealing or trapping focus (no auto-focus, no trap,
// never alert()). The update is stated in visible TEXT so color is never the
// only signal, Reload and Dismiss are real native <button>s in the tab order
// with the global focus ring, and the card uses design tokens only so it is
// correct in both themes and usable with no motion.

// The roughly one-hour update poll. A service worker is otherwise only
// re-checked on a fresh navigation, so a long-open tab (an exam left open
// across a deploy) would never discover a new version. This interval asks the
// browser to byte-check the SW periodically so the prompt can appear at all.
const UPDATE_POLL_MS = 60 * 60 * 1000;

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // The registration succeeded: start the periodic byte-check so a tab left
    // open across a deploy still discovers the new version. (The callback name
    // is onRegisteredSW and the registration is its second argument in the
    // installed virtual module's types.)
    onRegisteredSW(_swScriptUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update();
        }, UPDATE_POLL_MS);
      }
    },
    // Swallow a registration failure on purpose: offline-first must not surface
    // a hard service-worker error to the learner — the page works fine without
    // the SW, and the prompt simply never appears.
    onRegisterError() {},
  });

  // Nothing to show until a new version is waiting.
  if (!needRefresh) return null;

  // Reload into the new version. updateServiceWorker(true) tells the waiting
  // worker to take control (skip waiting, claim the page) and reloads, after
  // which the stale precache is evicted.
  function reload() {
    updateServiceWorker(true);
  }

  // Dismiss for now: hide the prompt this session. The new version still
  // installs on the next full navigation, so dismissing never traps the learner
  // on a stale build.
  function dismiss() {
    setNeedRefresh(false);
  }

  return (
    // A polite live region, not a dialog: it announces itself once when it
    // appears and never moves focus. The accessible name and the visible text
    // both state the update, so the affordance is meaningful without color.
    // The only transition is opacity/transform, which the global reduced-motion
    // rule collapses, leaving the card fully usable with no animation.
    <div
      role="status"
      aria-live="polite"
      aria-label="Update available"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-lg border border-hairline bg-raised p-4 text-ink shadow-lg sm:left-auto sm:right-4 sm:mx-0"
    >
      <p className="text-sm font-semibold">A new version is available.</p>
      <p className="mt-1 text-sm text-ink-soft">
        Reload to get the latest lessons and questions.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={reload}
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-raised transition-colors hover:bg-brand-strong"
        >
          Reload
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss update notice"
          className="rounded-md border border-hairline px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
