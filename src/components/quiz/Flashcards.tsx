import { useCallback, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import type { Flashcard, Question, ServiceEntry } from "@/lib/types";
import { buildDeck } from "@/lib/flashcards";
import { storageAvailable } from "@/lib/progress";
import { $progress, setFlashcardStatus } from "@/lib/store";

// INTEGRITY NOTE — flashcards are self-graded recall, NOT option-scored. There
// are NO options here, so the option-shuffle, the score-by-id, and the
// correct-answer-position uniformity check (see scripts/check-shuffle-uniformity)
// DO NOT apply to this component. The only shuffle a deck carries is deck ORDER,
// per sitting (buildDeck reuses `shuffle`), stable while a card is on screen. Do
// not bolt a uniformity check onto flashcards — there is no position to be
// uniform over. What this component owes instead: full keyboard operation with
// visible controls, a reduced-motion-safe flip, and aria-live announcements.

interface FlashcardsProps {
  // The verified service catalog (ALL_SERVICES), serialized by the page. Every
  // entry becomes a card. Passed in as a prop, never imported here (per the
  // islands-take-JSON-props rule), so the deck stays data-driven.
  services: ServiceEntry[];
  // The full question pool (ALL_QUESTIONS). The missed ids come from the store
  // client-side; the pool is what resolves them into question cards.
  pool: Question[];
}

// The mark state of the current card, read from the persisted store so a card
// the learner already graded shows its status when it comes back around.
type Mark = "known" | "learning" | "none";

export default function Flashcards({ services, pool }: FlashcardsProps) {
  // Read missed ids from the persisted store. Subscribing keeps the tally live as
  // marks are made; the deck itself is built ONCE on mount so its order is stable
  // for the sitting (a restart reshuffles deliberately).
  const progress = useStore($progress);

  // Build the deck once on mount. The missed ids are read at build time from the
  // store snapshot; rebuilding on every progress change would reshuffle the deck
  // under the learner mid-session, so the deck is seeded once and only a manual
  // restart rebuilds it. `epoch` bumps to force a fresh shuffle on restart.
  const [epoch, setEpoch] = useState(0);
  const deck = useMemo(
    () =>
      buildDeck({
        services,
        questions: pool,
        missedIds: $progress.get().incorrectQuestions,
      }),
    // epoch is the deliberate rebuild trigger; services/pool are stable props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [services, pool, epoch],
  );

  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // The polite live-region message, updated on flip / advance / mark so a screen
  // reader hears the new face, position, or grade without moving focus.
  const [announce, setAnnounce] = useState("");

  const total = deck.length;
  const card: Flashcard | undefined = deck[current];

  // Whether the current card is marked, from the persisted slice.
  const mark: Mark = useMemo(() => {
    if (!card) return "none";
    if (progress.flashcards.known.includes(card.id)) return "known";
    if (progress.flashcards.learning.includes(card.id)) return "learning";
    return "none";
  }, [card, progress.flashcards.known, progress.flashcards.learning]);

  const knownCount = progress.flashcards.known.length;
  const learningCount = progress.flashcards.learning.length;

  const flip = useCallback(() => {
    setFlipped((f) => {
      const next = !f;
      if (card) {
        setAnnounce(next ? `Back: ${card.back}` : `Front: ${card.front}`);
      }
      return next;
    });
  }, [card]);

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      // Clamp within the deck; do not wrap, so "next" on the last card is a no-op
      // the counter makes obvious rather than a surprising jump to the start.
      const next = Math.max(0, Math.min(total - 1, index));
      setCurrent(next);
      setFlipped(false);
      setAnnounce(`Card ${next + 1} of ${total}`);
    },
    [total],
  );

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  const grade = useCallback(
    (status: "known" | "learning") => {
      if (!card) return;
      setFlashcardStatus(card.id, status);
      setAnnounce(status === "known" ? "Marked known" : "Marked to revisit");
      // Advance after grading so a run flows card to card, mirroring the
      // mark-and-move keyboard map. The advance announcement is deferred so the
      // grade is heard first, then the new position on the next tick.
      if (current < total - 1) {
        window.setTimeout(() => goTo(current + 1), 0);
      }
    },
    [card, current, total, goTo],
  );

  // Restart the deck: a fresh shuffle and back to the first card. Confirmed so a
  // mid-deck restart is deliberate, mirroring the shipped exam discard idiom. The
  // self-graded known/learning marks persist (they are progress, not place).
  const restart = useCallback(() => {
    const ok = window.confirm(
      "Start over? Your place in this set will be cleared.",
    );
    if (!ok) return;
    setCurrent(0);
    setFlipped(false);
    setEpoch((e) => e + 1);
    setAnnounce("Deck restarted");
  }, []);

  // Full keyboard map on the focusable card region. Space/Enter flip; →/N next;
  // ←/P prev; K mark known; J mark learning. When the event originates on a
  // <button> inside the region, the browser already fires that button's onClick
  // for Space/Enter, so those keys are ignored here to avoid a double-flip; the
  // movement/mark letters always act (buttons do not bind them). Every action
  // also has a visible control below, so the deck is fully operable by mouse,
  // touch, and keyboard.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (total === 0) return;
      if (e.repeat) return; // ignore auto-repeat from a held key
      const onButton =
        e.target instanceof HTMLElement && e.target.closest("button") !== null;
      switch (e.key) {
        case " ":
        case "Enter":
          if (onButton) return; // the button handles it natively
          e.preventDefault();
          flip();
          break;
        case "ArrowRight":
        case "n":
        case "N":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "p":
        case "P":
          e.preventDefault();
          prev();
          break;
        case "k":
        case "K":
          e.preventDefault();
          grade("known");
          break;
        case "j":
        case "J":
          e.preventDefault();
          grade("learning");
          break;
        default:
          break;
      }
    },
    [total, flip, next, prev, grade],
  );

  // ---- empty state ----
  if (total === 0 || !card) {
    return (
      <div className="rounded-lg border border-hairline bg-raised p-8 text-center">
        <h2 className="text-xl font-semibold text-ink">No cards to study yet</h2>
        <p className="mx-auto mt-2 max-w-prose text-ink-soft">
          Browse the service catalog and miss a few practice questions; both feed
          your flashcard deck.
        </p>
        <a
          href="/catalog"
          className="mt-5 inline-block rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong"
        >
          Browse the catalog
        </a>
      </div>
    );
  }

  const eyebrow = card.kind === "service" ? "SERVICE" : "MISSED QUESTION";

  return (
    <div className="flex flex-col gap-5">
      {/* Progress: a mono counter, the shipped thin bar scaled by width, and a
          running known/to-revisit tally. */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-sm tabular-nums text-ink-soft">
            {current + 1} / {total}
          </span>
          <span className="text-sm text-ink-soft">
            {knownCount} known &middot; {learningCount} to revisit
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full bg-brand transition-[width]"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {!storageAvailable() && (
        <p className="text-sm text-ink-soft">
          Progress will not be saved in this browser.
        </p>
      )}

      {/* The focusable card region. The flip is a presentational rotateY; both
          faces stay in the DOM and the visible content is swapped via `flipped`
          state, so under reduced motion (the global rule collapses the duration)
          it is an instant, upright swap that never depends on the animation
          finishing. The back is its own upright face, never a CSS-mirrored front. */}
      <div
        role="group"
        aria-label="Flashcard"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
      >
        <div
          className="rounded-lg border border-hairline bg-raised p-5 transition-transform sm:p-6"
          style={{ transform: flipped ? "rotateY(360deg)" : "rotateY(0deg)" }}
        >
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            {eyebrow}
          </p>

          {!flipped ? (
            <div className="mt-3">
              <p className="text-lg font-semibold text-ink">{card.front}</p>
              <p className="mt-6 text-sm text-ink-soft">
                Press Space or Enter to flip
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-base text-ink">{card.back}</p>
              {card.detail && (
                <p className="mt-2 text-sm text-ink-soft">{card.detail}</p>
              )}
              <a
                href={card.reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-brand underline underline-offset-2"
              >
                {card.reference.label}
              </a>
              <p className="mt-6 text-sm text-ink-soft">
                K &mdash; know it &middot; J &mdash; still learning &middot;
                &larr; &rarr; move
              </p>
            </div>
          )}
        </div>
      </div>

      {/* The current card's mark, shape + label (never color alone): a check in a
          correct-bordered chip for known, a cross in a danger-bordered chip for
          still-learning. */}
      {mark !== "none" && (
        <p
          className={`inline-flex items-center gap-2 self-start rounded-md border px-2.5 py-1 text-sm font-medium text-ink ${
            mark === "known" ? "border-correct" : "border-danger"
          }`}
        >
          <span aria-hidden="true">{mark === "known" ? "✓" : "✗"}</span>
          {mark === "known" ? "Known" : "Still learning"}
        </p>
      )}

      {/* Visible controls — every keyboard action has a button so the deck is
          fully operable by mouse and touch. */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={flip}
          className="rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong"
        >
          Flip
        </button>
        <button
          type="button"
          onClick={prev}
          disabled={current === 0}
          className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={next}
          disabled={current === total - 1}
          className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => grade("known")}
          className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-correct"
        >
          Know it
        </button>
        <button
          type="button"
          onClick={() => grade("learning")}
          className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-danger"
        >
          Still learning
        </button>
        <button
          type="button"
          onClick={restart}
          className="ml-auto text-sm font-medium text-ink-soft underline underline-offset-2 hover:text-ink"
        >
          Restart deck
        </button>
      </div>

      {/* Keyboard legend so the map is discoverable without trial and error. */}
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
        <span>Space / Enter: flip</span>
        <span>&larr; &rarr; or P / N: move</span>
        <span>K: know it</span>
        <span>J: still learning</span>
      </p>

      {/* Polite live region: announces the new face on flip, the position on
          advance, and the grade on mark, without stealing focus. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
