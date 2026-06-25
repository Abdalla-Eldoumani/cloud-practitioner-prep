import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CommandItem,
  LessonIndexEntry,
  NavTarget,
  ServiceIndexEntry,
} from "@/lib/navigation";
import { filterCommands } from "@/lib/navigation";
import { useModalDialog } from "./useModalDialog";
import ShortcutsHelp from "./ShortcutsHelp";

// The keyboard command palette: a single hand-rolled modal dialog (no
// command-palette dependency) mounted once by the layout and opened from
// anywhere with Cmd/Ctrl+K. It searches one combined list of navigation
// targets, lessons, and services through the ONE shared substring matcher
// (filterCommands) and navigates to a chosen entry's authored href. The same
// island also owns the "?" shortcuts overlay, so both global shortcuts are
// wired in one place.
//
// Accessibility is the bar here: role="dialog" aria-modal with an accessible
// name, focus moves into the search input on open and is trapped, Escape / a
// backdrop click / navigating all close and return focus to the opener, and
// background scroll is locked and restored exactly (the shared useModalDialog
// hook owns the trap + scroll lock + focus return). The results are a
// combobox-controlled listbox: arrow keys move a VISIBLE highlight via
// aria-activedescendant while the input keeps DOM focus, the active index is
// clamped (no wrap), Enter activates, and a polite live region announces the
// result count.

interface CommandPaletteProps {
  // The primary navigation destinations (NAV_TARGETS), serialized by the layout.
  routes: NavTarget[];
  // The build-time lesson index (buildLessonIndex over the lessons collection).
  lessons: LessonIndexEntry[];
  // The build-time service index (buildServiceIndex over ALL_SERVICES).
  services: ServiceIndexEntry[];
}

// The CustomEvents the layout's inline script dispatches. Named constants so the
// island and the layout cannot drift on the string.
const OPEN_PALETTE_EVENT = "ccp:open-palette";
const OPEN_HELP_EVENT = "ccp:open-help";

// Debounce the query before it drives the filter and the live-region count, so
// typing stays smooth and the announcement is not chatty (the catalog idiom).
// The input value updates immediately; only the derived results and the count
// lag by this interval.
const DEBOUNCE_MS = 180;

// The human label for each group, shown as a section heading and used to order
// the combined list: Go to first, then Lessons, then Services, so the roving
// highlight moves through the list in a predictable order.
const GROUP_LABEL: Record<CommandItem["group"], string> = {
  navigate: "Go to",
  lesson: "Lessons",
  service: "Services",
};
const GROUP_ORDER: CommandItem["group"][] = ["navigate", "lesson", "service"];

// The display text for one result row. Each item type renders its own primary
// label as JSX text only (never innerHTML); a lesson also shows its description
// as muted secondary text.
function primaryText(item: CommandItem): string {
  switch (item.group) {
    case "navigate":
      return item.label;
    case "lesson":
      return item.title;
    case "service":
      return item.name;
  }
}

// A stable id for an item, used for the React key and the option's DOM id so
// aria-activedescendant can point at it. Discriminate on `group` because the
// union members carry different identity fields (a lesson is keyed by slug, a
// nav target and a service by id).
function itemKey(item: CommandItem): string {
  switch (item.group) {
    case "navigate":
      return `navigate:${item.id}`;
    case "lesson":
      return `lesson:${item.slug}`;
    case "service":
      return `service:${item.id}`;
  }
}

export default function CommandPalette({
  routes,
  lessons,
  services,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [deferredQuery, setDeferredQuery] = useState("");
  // The roving highlight: an index into the flat filtered list. Movement clamps
  // at the ends (no wrap), mirroring the flashcard navigation choice.
  const [activeIndex, setActiveIndex] = useState(0);

  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Share the trap, the scroll lock (snapshot + restore), and the focus return
  // with the help overlay; focus lands in the search input when the palette
  // opens.
  useModalDialog({ open, dialogRef, initialFocusRef: inputRef });

  // Precompute the combined item list ONCE per props change, in group order, so
  // a keystroke only runs the substring match, not the assembly. Keeping the
  // order stable (Go to -> Lessons -> Services) makes the roving predictable.
  const items = useMemo<CommandItem[]>(
    () => [...routes, ...lessons, ...services],
    [routes, lessons, services],
  );

  // Debounce the query into deferredQuery; the input itself stays immediate.
  useEffect(() => {
    const id = window.setTimeout(() => setDeferredQuery(query), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  // The filtered, flat result list through the ONE shared matcher. Order is
  // preserved (filterCommands is stable), so the activeIndex maps directly.
  const results = useMemo(
    () => filterCommands(deferredQuery, items),
    [deferredQuery, items],
  );

  // Reset the highlight to the top whenever the filtered list changes, so the
  // active option is always a real, visible row.
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // Group the flat results for rendering while remembering each row's flat index
  // (the index the highlight and Enter act on), so the visual grouping never
  // desyncs from the roving order.
  const grouped = useMemo(() => {
    const out: {
      group: CommandItem["group"];
      label: string;
      rows: { item: CommandItem; index: number }[];
    }[] = [];
    for (const group of GROUP_ORDER) {
      const rows = results
        .map((item, index) => ({ item, index }))
        .filter((r) => r.item.group === group);
      if (rows.length > 0) {
        out.push({ group, label: GROUP_LABEL[group], rows });
      }
    }
    return out;
  }, [results]);

  const activeItem = results[activeIndex];
  const activeId = activeItem
    ? `cmdp-option-${itemKey(activeItem)}`
    : undefined;

  // Close the palette: clears the scroll lock + returns focus via the hook
  // teardown, and resets the query so the next open starts clean.
  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    setDeferredQuery("");
    setActiveIndex(0);
  }, []);

  // Navigate to an item's authored href. Close first (so the scroll lock lifts
  // and focus returns) and then assign — the destination is a build-time,
  // gate-checked href, never a user string.
  const activate = useCallback(
    (item: CommandItem | undefined) => {
      if (!item) return;
      closePalette();
      window.location.assign(item.href);
    },
    [closePalette],
  );

  // Wire the two global CustomEvents. The layout's inline script dispatches
  // these so the shortcuts work before/without hydration; once hydrated the
  // island handles them. A second open request while already open is a no-op
  // (Escape is the canonical close). Opening one dialog closes the other so they
  // stay mutually exclusive.
  useEffect(() => {
    function onOpenPalette() {
      setHelpOpen(false);
      setOpen(true);
    }
    function onOpenHelp() {
      setOpen(false);
      setHelpOpen(true);
    }
    window.addEventListener(OPEN_PALETTE_EVENT, onOpenPalette);
    window.addEventListener(OPEN_HELP_EVENT, onOpenHelp);

    // Replay a keypress that landed before this island hydrated: the inline
    // trigger records its last open intent on a global, which the dispatched
    // event would have missed because no listener was attached yet. Read it once
    // on mount, then clear it so it never reopens on a later remount.
    const pending = (
      window as Window & { __ccpPaletteIntent?: string }
    ).__ccpPaletteIntent;
    if (pending === OPEN_PALETTE_EVENT) {
      onOpenPalette();
    } else if (pending === OPEN_HELP_EVENT) {
      onOpenHelp();
    }
    delete (window as Window & { __ccpPaletteIntent?: string })
      .__ccpPaletteIntent;

    return () => {
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpenPalette);
      window.removeEventListener(OPEN_HELP_EVENT, onOpenHelp);
    };
  }, []);

  // The keyboard map on the search input. Arrows move the highlight (clamped, no
  // wrap) WITHOUT moving DOM focus off the input — the combobox + listbox +
  // aria-activedescendant pattern — Enter activates the active option, and
  // Escape closes. The e.repeat guard mirrors the flashcard idiom so a held key
  // does not stampede the highlight.
  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          if (e.repeat) {
            e.preventDefault();
            return;
          }
          e.preventDefault();
          setActiveIndex((i) => Math.min(results.length - 1, i + 1));
          break;
        case "ArrowUp":
          if (e.repeat) {
            e.preventDefault();
            return;
          }
          e.preventDefault();
          setActiveIndex((i) => Math.max(0, i - 1));
          break;
        case "Enter":
          e.preventDefault();
          activate(results[activeIndex]);
          break;
        case "Escape":
          e.preventDefault();
          closePalette();
          break;
        default:
          break;
      }
    },
    [results, activeIndex, activate, closePalette],
  );

  // Keep the active option scrolled into view as the highlight moves, since the
  // list (not the input) is the scroll container and DOM focus never leaves the
  // input to do this for us.
  useEffect(() => {
    if (!open || !activeId) return;
    const el = listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(activeId)}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeId]);

  const count = results.length;
  const countLabel =
    count === 0
      ? "No results"
      : `${count} ${count === 1 ? "result" : "results"}`;

  return (
    <>
      {open && (
        // The backdrop is decorative (aria-hidden) and closes on click; the
        // dialog stops propagation so a click inside does not close. Any
        // entrance is opacity only and the global reduced-motion rule collapses
        // it, so the palette is fully usable with no motion.
        <div
          aria-hidden="true"
          onClick={closePalette}
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[10vh]"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-hairline bg-raised shadow-lg"
          >
            <div className="border-b border-hairline p-3">
              <label htmlFor="cmdp-search" className="sr-only">
                Search navigation, lessons, and services
              </label>
              <input
                ref={inputRef}
                id="cmdp-search"
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmdp-listbox"
                aria-activedescendant={activeId}
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search pages, lessons, services…"
                className="w-full rounded-md border border-hairline bg-surface px-3 py-2 text-base text-ink"
              />
            </div>

            <ul
              ref={listRef}
              id="cmdp-listbox"
              role="listbox"
              aria-label="Results"
              className="flex-1 overflow-y-auto p-2"
            >
              {count === 0 ? (
                <li
                  role="option"
                  aria-selected="false"
                  aria-disabled="true"
                  className="px-3 py-6 text-center text-sm text-ink-soft"
                >
                  No results. Try a different search.
                </li>
              ) : (
                grouped.map((section) => (
                  <li key={section.group} role="presentation">
                    <p
                      id={`cmdp-group-${section.group}`}
                      role="presentation"
                      className="px-2 pb-1 pt-2 font-mono text-xs uppercase tracking-wide text-ink-soft"
                    >
                      {section.label}
                    </p>
                    <ul role="group" aria-labelledby={`cmdp-group-${section.group}`}>
                      {section.rows.map(({ item, index }) => {
                        const isActive = index === activeIndex;
                        return (
                          <li
                            key={itemKey(item)}
                            id={`cmdp-option-${itemKey(item)}`}
                            role="option"
                            aria-selected={isActive}
                            onClick={() => activate(item)}
                            onMouseMove={() => setActiveIndex(index)}
                            className={`flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 ${
                              isActive
                                ? "bg-info-soft font-semibold text-ink ring-1 ring-brand"
                                : "text-ink"
                            }`}
                          >
                            {/* A non-color active cue: a leading ">" marker plus
                                the font-weight and ring above, so the active row
                                is distinguishable without relying on color. */}
                            <span
                              aria-hidden="true"
                              className="w-3 shrink-0 text-brand"
                            >
                              {isActive ? ">" : ""}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate">
                                {primaryText(item)}
                              </span>
                              {item.group === "lesson" && (
                                <span className="block truncate text-xs text-ink-soft">
                                  {item.description}
                                </span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))
              )}
            </ul>

            <div className="border-t border-hairline px-3 py-2">
              <p className="text-xs text-ink-soft">
                <span className="font-mono">Up/Down</span> to move ·{" "}
                <span className="font-mono">Enter</span> to open ·{" "}
                <span className="font-mono">Esc</span> to close
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The result count, announced politely (lagged with the deferred query,
          not on every keystroke), without moving focus. Lives outside the
          conditional so the count change is announced even as the dialog
          re-renders; it is empty and silent while the palette is closed. */}
      <p role="status" aria-live="polite" className="sr-only">
        {open ? countLabel : ""}
      </p>

      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
