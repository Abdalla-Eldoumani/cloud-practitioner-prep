import DiagramFigure, { type DiagramNode } from "@/components/diagrams/DiagramFigure";
import type { KnowledgeCheckDatum } from "@/components/diagrams/KnowledgeCheck";
import { serviceById } from "@/data/services/index";

// The core-services map for the ec2-fundamentals lesson (the first Domain-3
// compute lesson, where the EC2 <-> Lambda axis gives the map real anchors). It
// supplies the static SVG geometry + the node notes to the shared DiagramFigure
// (which owns the accessibility contract). The figure groups core AWS service
// CATEGORIES a learner meets on the exam, each with one or two flagship services
// beneath it, so the categories and their headline services read as one labelled
// topology. No JS is needed to read it: every label is in the static SVG.
//
// This is the highest invention-risk diagram (it names many services AND asserts
// their categories), so the guard is STRUCTURAL and total: each column lists only
// service IDS; BOTH the service name AND the category header are resolved from the
// verified service catalog (serviceById) at module load, never hand-typed. A
// column whose services do not all share one catalog category throws here (see
// resolveGroup), so a service can never be shown under the wrong category and the
// header can never drift from the catalog the way a hand-typed label could. The
// module also exports its ids in meta.serviceIds so the check:diagrams
// service-labels-resolve rule asserts every one resolves. Colors come from
// currentColor on token-colored <g> wrappers (text-ink / text-brand / text-accent
// / text-ink-soft) so both themes resolve and no raw hex appears; each category is
// labelled in TEXT, so the grouping is never carried by color alone.

// One category column: only the flagship service IDS are authored. The category
// label and each service name/note are resolved from the catalog, so the only
// authored fact about a column is which services it groups — a name or a category
// can never drift from the verified entry.
type CategoryColumn = string[];

// The authored grouping: each column is a set of service ids that share ONE catalog
// category. The category label is derived from the catalog (resolveGroup), so the
// header always matches the verified category of the services beneath it. The picks
// mirror what the EC2 lesson names (EC2, Lambda) plus the headline service of each
// other core category.
const CATEGORY_COLUMNS: CategoryColumn[] = [
  ["amazon-ec2"], // Compute
  ["aws-lambda", "aws-fargate"], // Serverless
  ["amazon-s3", "amazon-ebs"], // Storage
  ["amazon-rds", "amazon-dynamodb"], // Database
  ["amazon-vpc", "amazon-route-53"], // Networking and Content Delivery
];

interface ResolvedService {
  id: string;
  name: string;
  note: string;
}

// Resolve one service id to its verified catalog entry, throwing on a non-resolving
// id so the map NEVER shows an unverified name.
function resolveEntry(id: string) {
  const entry = serviceById(id);
  if (entry === undefined) {
    throw new Error(
      `CoreServicesDiagram: service id "${id}" does not resolve to a catalog entry; every label must come from the verified catalog.`,
    );
  }
  return entry;
}

// Resolve one column to its catalog-derived category label + its resolved services.
// Every service in the column must share one catalog category; a mixed column throws
// here (at module load, which the gate triggers on import), so a service can never
// be filed under the wrong category and the header IS the catalog's own verified
// category string.
function resolveGroup(ids: CategoryColumn): {
  category: string;
  services: ResolvedService[];
} {
  const entries = ids.map(resolveEntry);
  const category = entries[0].category;
  for (const entry of entries) {
    if (entry.category !== category) {
      throw new Error(
        `CoreServicesDiagram: column [${ids.join(", ")}] mixes catalog categories ("${entry.category}" vs "${category}"); every service in a column must share one verified category.`,
      );
    }
  }
  const services = entries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    // The note names the SAME catalog category shown in the header, so the callout
    // and the column header can never disagree.
    note: `${entry.category}: ${entry.purpose}`,
  }));
  return { category, services };
}

const RESOLVED_GROUPS = CATEGORY_COLUMNS.map(resolveGroup);

// The flat list of every service id the map renders, for meta.serviceIds — what
// arms the gate's service-labels-resolve rule.
const SERVICE_IDS = CATEGORY_COLUMNS.flat();

// The interactive nodes: one per flagship service, its visible label the verified
// catalog name and its note the verified one-line purpose. Built from the resolved
// groups so a label can never be authored free-hand.
const nodes: DiagramNode[] = RESOLVED_GROUPS.flatMap((group) =>
  group.services.map((service) => ({
    id: service.id,
    label: service.name,
    note: service.note,
  })),
);

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
// SVG so the figure reads fully without interaction. currentColor inherits from the
// per-element token text color.
function CoreServicesGeometry() {
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

      {RESOLVED_GROUPS.map((group, columnIndex) => {
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

export default function CoreServicesDiagram() {
  return (
    <DiagramFigure
      idBase="core-services"
      title="A map of core AWS service categories"
      description="Core AWS service categories the exam covers — Compute, Serverless, Storage, Database, and Networking and Content Delivery — each shown with one or two of its flagship services beneath it. Every service name and category is drawn from the verified service catalog. Select a service below to read what it does."
      nodes={nodes}
      viewBox="0 0 320 180"
      calloutLabel="Service"
    >
      <CoreServicesGeometry />
    </DiagramFigure>
  );
}

// The inline knowledge-check datum the lesson embeds after the diagram. Single
// answer, stable content-named option ids, no option-letter or positional phrasing;
// the option text is real catalog names and the explanation names option CONTENT. It
// checks that a learner can place a flagship service in its category — the skill the
// map builds. Traces to the EC2 service page.
const coreServicesCheck: KnowledgeCheckDatum = {
  prompt: "Which of these AWS services is in the Compute category?",
  options: [
    { id: "ec2-compute", text: "Amazon EC2" },
    { id: "s3-storage", text: "Amazon S3" },
    { id: "rds-database", text: "Amazon RDS" },
    { id: "route53-networking", text: "Amazon Route 53" },
  ],
  correct: ["ec2-compute"],
  explanation:
    "Amazon EC2 is the flagship Compute service: resizable virtual servers you launch and scale. Amazon S3 is object Storage, Amazon RDS is a managed relational Database, and Amazon Route 53 is a Networking and Content Delivery (DNS) service, so each of those belongs to a different core category.",
  reference: {
    label: "AWS: What is Amazon EC2?",
    url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html",
  },
};

export const meta = {
  lessonSlug: "ec2-fundamentals",
  check: coreServicesCheck,
  serviceIds: SERVICE_IDS,
};
