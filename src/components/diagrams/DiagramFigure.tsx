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
      className="my-6 flex flex-col gap-4 rounded-lg border border-hairline bg-raised p-4 sm:p-5"
    >
      {/* role="img" gives the graphic a single accessible name+description for a
          screen reader reading the static figure; the <title>/<desc> are its
          first children, referenced by the ids above. The wrapper is a token
          text color so any currentColor stroke in the geometry is theme-aware. */}
      <div className="text-ink">
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
        <div className="flex flex-col gap-3">
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
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-accent bg-info-soft text-ink"
                        : "border-hairline bg-surface text-ink-soft hover:border-brand hover:text-ink"
                    }`}
                  >
                    {/* The leading marker is the non-color cue: a filled dot when
                        active, a hollow ring otherwise, so the selected part is
                        legible without relying on the border tint. */}
                    <span aria-hidden="true">{isActive ? "●" : "○"}</span>
                    {node.label}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* The adjacent callout: a labelled aria-live region, NOT a tooltip
              that traps focus. The active node's note appears here, announced
              politely so a screen reader hears it without focus moving. It is
              always in the DOM (so the live region is registered before the
              first update) and reads a resting prompt when nothing is active. */}
          <div
            id={calloutId}
            role="status"
            aria-live="polite"
            className="min-h-[2.5rem] rounded-md border border-hairline bg-surface p-3 text-sm text-ink"
          >
            <span className="mr-1 font-semibold text-ink-soft">
              {calloutLabel}:
            </span>
            {activeNode ? (
              <span>
                <span className="font-semibold text-ink">
                  {activeNode.label}
                </span>{" "}
                — {activeNode.note}
              </span>
            ) : (
              <span className="text-ink-soft">
                Select a part above to read about it.
              </span>
            )}
          </div>
        </div>
      )}
    </figure>
  );
}
