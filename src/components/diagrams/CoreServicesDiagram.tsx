import DiagramFigure, {
  type DiagramNode,
} from "@/components/diagrams/DiagramFigure";
import {
  CORE_SERVICE_IDS,
  coreServicesCheck,
  type ResolvedCategory,
} from "@/components/diagrams/core-services-columns";

// The core-services map for the ec2-fundamentals lesson (the first Domain-3 compute
// lesson, where the EC2 <-> Lambda axis gives the map real anchors). It groups core
// AWS service CATEGORIES a learner meets on the exam, each with one or two flagship
// services beneath it, so the categories and their headline services read as one
// labelled topology. No JS is needed to read it: every label is in the static SVG.
//
// This island is PRESENTATIONAL only. It receives the resolved category groups as a
// prop — built from the verified service catalog AT BUILD TIME by core-services-map.ts
// and passed in by the lesson — and imports NO catalog itself, so the ~113-entry
// service catalog is never bundled to the browser; only the ten resolved
// { id, name, note } arrive as serialized props. The build-time resolver throws on a
// non-resolving id or a mixed-category column (the invention guard), and check:diagrams
// asserts meta.serviceIds all resolve. Colors come from currentColor on token-colored
// <g> wrappers (text-ink / text-brand / text-accent / text-ink-soft) so both themes
// resolve and no raw hex appears; each category is labelled in TEXT, so the grouping is
// never carried by color alone.

interface CoreServicesDiagramProps {
  // The catalog-resolved category columns (from buildCoreServicesGroups() in the
  // lesson body). Plain serializable data; the island never resolves the catalog.
  groups: ResolvedCategory[];
}

// Split a category label into at most two balanced lines so a long verified label
// (e.g. "Networking and Content Delivery") fits a fixed-width column header without
// truncating the catalog's own wording. Short labels stay on one line.
function headerLines(category: string): string[] {
  if (category.length <= 16) return [category];
  const words = category.split(" ");
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(
      words.slice(0, i).join(" ").length - words.slice(i).join(" ").length,
    );
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

// The static SVG geometry. Five category columns across the frame, each a labelled
// category header (its verified catalog category, wrapped to two lines when long)
// with its flagship service tiles beneath, connected by a short link so the
// "category contains these services" relationship reads. Every label lives in the
// SVG so the figure reads fully without interaction.
function CoreServicesGeometry({ groups }: { groups: ResolvedCategory[] }) {
  const columnWidth = 60;
  const columnGap = 3;
  const firstColumnX = 4;
  const headerY = 26;
  const headerHeight = 20;

  return (
    <>
      {/* The framing caption: these are the core service categories the exam
          covers. Drawn as a label, not color, so it reads statically. */}
      <g className="text-ink-soft">
        <text
          x="160"
          y="14"
          textAnchor="middle"
          className="fill-current font-sans text-[9px]"
          fill="currentColor"
        >
          Core AWS service categories and their flagship services
        </text>
      </g>

      {groups.map((group, columnIndex) => {
        const x = firstColumnX + columnIndex * (columnWidth + columnGap);
        const centerX = x + columnWidth / 2;
        const lines = headerLines(group.category);
        return (
          <g key={group.category}>
            {/* The category header box, labelled with the verified catalog category
                name (wrapped to two lines when it is long). */}
            <g className="text-brand">
              <rect
                x={x}
                y={headerY}
                width={columnWidth}
                height={headerHeight}
                rx="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <text
                x={centerX}
                y={lines.length === 1 ? headerY + 13 : headerY + 9}
                textAnchor="middle"
                className="fill-current font-sans text-[7px] font-semibold"
                fill="currentColor"
              >
                {lines.length === 1
                  ? group.category
                  : lines.map((line, i) => (
                      <tspan key={line} x={centerX} dy={i === 0 ? 0 : 8}>
                        {line}
                      </tspan>
                    ))}
              </text>
            </g>

            {/* The flagship service tiles beneath the header, each labelled with the
                verified catalog name, connected to the header by a short link so the
                containment reads. */}
            <g className="text-ink">
              {group.services.map((service, serviceIndex) => {
                const tileY = 58 + serviceIndex * 30;
                const tileHeight = 22;
                return (
                  <g key={service.id}>
                    {/* The link from the header (or the tile above) down to this
                        tile: the "category contains this service" relationship. */}
                    <line
                      x1={centerX}
                      y1={serviceIndex === 0 ? headerY + headerHeight : tileY - 8}
                      x2={centerX}
                      y2={tileY}
                      className="text-accent"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <rect
                      x={x}
                      y={tileY}
                      width={columnWidth}
                      height={tileHeight}
                      rx="4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <text
                      x={centerX}
                      y={tileY + 14}
                      textAnchor="middle"
                      className="fill-current font-sans text-[7px]"
                      fill="currentColor"
                    >
                      {service.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        );
      })}

      {/* The takeaway label: the categories are how AWS groups its services, and a
          learner navigates the exam by category first. Text, not color. */}
      <g className="text-ink-soft">
        <text
          x="160"
          y="168"
          textAnchor="middle"
          className="fill-current font-sans text-[7px]"
          fill="currentColor"
        >
          Each category groups services that solve the same kind of problem
        </text>
      </g>
    </>
  );
}

export default function CoreServicesDiagram({
  groups,
}: CoreServicesDiagramProps) {
  // The interactive nodes, derived from the passed groups: one per flagship service,
  // its label the verified catalog name and its note the verified one-line purpose.
  const nodes: DiagramNode[] = groups.flatMap((group) =>
    group.services.map((service) => ({
      id: service.id,
      label: service.name,
      note: service.note,
    })),
  );

  return (
    <DiagramFigure
      idBase="core-services"
      title="A map of core AWS service categories"
      description="Core AWS service categories the exam covers — Compute, Serverless, Storage, Database, and Networking and Content Delivery — each shown with one or two of its flagship services beneath it. Every service name and category is drawn from the verified service catalog. Select a service below to read what it does."
      nodes={nodes}
      viewBox="0 0 320 180"
      calloutLabel="Service"
    >
      <CoreServicesGeometry groups={groups} />
    </DiagramFigure>
  );
}

// meta is read by check:diagrams (discovery + service-labels-resolve). It is
// self-contained (the ids + the check carry no catalog import), so reading it never
// pulls the catalog into the island bundle.
export const meta = {
  lessonSlug: "ec2-fundamentals",
  check: coreServicesCheck,
  serviceIds: CORE_SERVICE_IDS,
};
