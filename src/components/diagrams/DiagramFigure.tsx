import { useId, useState } from "react";

// The shared accessibility shell every interactive lesson diagram wraps in. It
// owns the SEMANTICS (a named group, an SVG image with a title/desc, focusable
// node controls, an adjacent live-region callout, the active-node state); each
// per-diagram module owns the SHAPES (the static SVG geometry) and the node
// definitions. So one accessibility implementation is shared across every
// diagram rather than re-derived five times — the same way the quiz reveal lives
// in one place and the shuffle lives in one place.
//
// The static SVG is ALWAYS rendered and fully labelled, so the diagram is
// understandable before hydration, with no JavaScript, and under reduced motion.
// Any motion a diagram adds is additive and the global reduced-motion rule
// collapses it, so this component adds NO media query of its own; the static
// base must carry the full meaning on its own.

// One interactive node: a stable id, a short visible label (its accessible
// name), and the plain-language note shown when the node is activated.
export interface DiagramNode {
  id: string;
  label: string;
  note: string;
}

export interface DiagramFigureProps {
  // A stable base for the generated title/desc ids so aria-labelledby and
  // aria-describedby resolve. Pass the diagram's own slug (e.g. "regions-az").
  idBase: string;
  // The accessible name of the whole figure (also the SVG <title> text).
  title: string;
  // The longer description (the SVG <desc> text) read by assistive tech.
  description: string;
  // The interactive nodes. Activating one writes its note into the callout. An
  // empty list is allowed: a diagram with no interactive node is a pure static
  // figure that still gets the named-group + title/desc contract.
  nodes: DiagramNode[];
  // The hand-authored static SVG geometry for this diagram. Rendered inside the
  // shared <svg> AFTER the <title>/<desc>, so the module controls layout while
  // this shell controls semantics. Token utilities or currentColor only — no raw
  // hex (the design-token rule; both themes must resolve).
  children: React.ReactNode;
  // The SVG viewBox the module's geometry is drawn in. Defaults to a 16:9 frame.
  viewBox?: string;
  // Optional className for the <svg> (sizing/wrapper color for currentColor).
  svgClassName?: string;
  // Optional label for the callout region heading; defaults to "Details".
  calloutLabel?: string;
}

export default function DiagramFigure({
  idBase,
  title,
  description,
  nodes,
  children,
  viewBox = "0 0 320 180",
  svgClassName = "h-auto w-full",
  calloutLabel = "Details",
}: DiagramFigureProps) {
  // A render-unique prefix so two instances of the same diagram on one page do
  // not collide on ids. Combined with the caller's idBase for readable ids.
  const uid = useId();
  const titleId = `${idBase}-${uid}-title`;
  const descId = `${idBase}-${uid}-desc`;
  const calloutId = `${idBase}-${uid}-callout`;

  // The active node, local UI state only. Activating a node writes its note into
  // the live region below; activating it again clears it (a toggle), so the
  // callout never traps the reader on one node.
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeNode = nodes.find((n) => n.id === activeId) ?? null;

  function toggle(id: string): void {
    setActiveId((current) => (current === id ? null : id));
  }

  return (
    // role="group" + an accessible name names the whole figure as one unit. The
    // name is the <title> via aria-labelledby; the description is the <desc>.
    <figure
      role="group"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="substrate relative my-6 flex flex-col gap-4 rounded-r3 border border-line-1 bg-ground-1 p-4 not-prose sm:p-5"
    >
      {/* T1 survey plot: reticle ends on the panel, the grid substrate behind
          the geometry, and the mono plot header. */}
      <span
        aria-hidden="true"
        className="absolute -top-px -left-px size-3.5 border-t-2 border-l-2 border-blueprint"
      />
      <span
        aria-hidden="true"
        className="absolute -top-px -right-px size-3.5 border-t-2 border-r-2 border-blueprint"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-px -left-px size-3.5 border-b-2 border-l-2 border-blueprint"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-px -right-px size-3.5 border-b-2 border-r-2 border-blueprint"
      />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="t-mono-label" style={{ color: "var(--kicker-ink)" }}>
          Survey plot — {title}
        </p>
        {nodes.length > 0 && (
          <p className="t-mono-sm hidden uppercase text-ink-3 sm:block">
            Tap a part · tab works too
          </p>
        )}
      </div>
      {/* role="img" gives the graphic a single accessible name+description for a
          screen reader reading the static figure; the <title>/<desc> are its
          first children, referenced by the ids above. The wrapper is a token
          text color so any currentColor stroke in the geometry is theme-aware. */}
      <div className="text-ink-1">
        <svg
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          viewBox={viewBox}
          className={svgClassName}
        >
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          {children}
        </svg>
      </div>

      {/* The interactive layer: a real <button> per node, keyboard-focusable and
          operable with Enter/Space natively (no custom key handler needed since
          these are real buttons), each carrying its node label as its accessible
          name. The active button is marked with aria-pressed AND a visible
          shape/label change (a token outline plus a leading marker) so the state
          is never signalled by color alone. The global :focus-visible rule draws
          the focus ring. When there are no nodes this block renders nothing and
          the static figure stands alone. */}
      {nodes.length > 0 && (
        <div className="flex flex-col gap-3.5">
          <ul className="flex flex-wrap gap-2" aria-label="Diagram parts">
            {nodes.map((node) => {
              const isActive = node.id === activeId;
              return (
                <li key={node.id}>
                  <button
                    type="button"
                    onClick={() => toggle(node.id)}
                    aria-pressed={isActive}
                    aria-controls={calloutId}
                    className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-r1 border px-3.5 py-[7px] font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors ${
                      isActive
                        ? "border-blueprint bg-blueprint-dim"
                        : "border-line-1 text-ink-3 hover:border-line-2 hover:text-ink-1"
                    }`}
                    style={isActive ? { color: "var(--kicker-ink)" } : undefined}
                  >
                    {node.label}
                    {/* The trailing check is the non-color cue for the
                        selected part. */}
                    {isActive && <span aria-hidden="true">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* The SELECTED panel: a labelled aria-live region, NOT a tooltip
              that traps focus. The active node's note appears here in the
              reflection voice, announced politely so a screen reader hears it
              without focus moving. It is always in the DOM (so the live
              region is registered before the first update) and reads a
              resting prompt when nothing is active. */}
          <div
            id={calloutId}
            role="status"
            aria-live="polite"
            className="min-h-[2.5rem] border-t border-line-1 pt-3.5"
          >
            <p className="t-mono-label" style={{ color: "var(--kicker-ink)" }}>
              Selected{activeNode ? ` — ${activeNode.label}` : ""}
            </p>
            <p className="t-note mt-2 text-ink-2">
              {activeNode ? (
                activeNode.note
              ) : (
                <span className="text-ink-3">
                  Select a {calloutLabel.toLowerCase()} above to read about it.
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </figure>
  );
}
