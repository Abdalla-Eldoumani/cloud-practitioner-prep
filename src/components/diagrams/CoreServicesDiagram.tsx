import DiagramFigure, { type DiagramNode } from "@/components/diagrams/DiagramFigure";
import type { KnowledgeCheckDatum } from "@/components/diagrams/KnowledgeCheck";
import { serviceById } from "@/data/services/index";

// The core-services map for the ec2-fundamentals lesson (the first Domain-3
// compute lesson, where the EC2 <-> Lambda axis gives the map real anchors). It
// supplies the static SVG geometry + the node notes to the shared DiagramFigure
// (which owns the accessibility contract). The figure groups the core AWS service
// CATEGORIES a learner meets on the exam — Compute, Storage, Database,
// Networking, Serverless — each with one or two flagship services beneath it, so
// the categories and their headline services read as one labelled topology. No JS
// is needed to read it: every label is in the static SVG.
//
// This is the highest invention-risk diagram (it names many services), so the
// guard is STRUCTURAL: every service label is resolved from the verified service
// catalog via serviceById at module load, NEVER hand-typed. A typo'd or invented
// id throws here (see resolveService) rather than rendering an unverified name,
// and the module also exports its ids in meta.serviceIds so the check:diagrams
// service-labels-resolve rule asserts every one resolves. Category names mirror
// AWS's own service categories. Colors come from currentColor on token-colored
// <g> wrappers (text-ink / text-brand / text-accent / text-ink-soft) so both
// themes resolve and no raw hex appears; each category is labelled in TEXT, so
// the grouping is never carried by color alone.

// One category group: the AWS category name a learner recognizes, and the
// flagship service IDS under it. The label and note for each service are resolved
// from the catalog below — only the id is authored here, so a name can never
// drift from the verified entry.
interface CategoryGroup {
  // The category label, mirroring the catalog's AWS category names.
  category: string;
  // The flagship service ids for this category. Every id must resolve via
  // serviceById; resolveService throws on one that does not.
  serviceIds: string[];
}

// The authored grouping. Each id is confirmed present in the verified catalog
// (compute / serverless / storage / database / networking). The flagship picks
// mirror what the EC2 lesson already names (EC2, Lambda) plus the headline
// service of each other core category.
const CATEGORY_GROUPS: CategoryGroup[] = [
  { category: "Compute", serviceIds: ["amazon-ec2", "aws-lambda"] },
  { category: "Storage", serviceIds: ["amazon-s3", "amazon-ebs"] },
  { category: "Database", serviceIds: ["amazon-rds", "amazon-dynamodb"] },
  { category: "Networking", serviceIds: ["amazon-vpc", "amazon-route-53"] },
  { category: "Serverless", serviceIds: ["aws-fargate", "amazon-ecs"] },
];

// Resolve one service id to its verified catalog name + a short note, throwing on
// a non-resolving id so the map NEVER shows an unverified name. The note is the
// first clause of the entry's official `purpose` (the verified one-line summary),
// trimmed to a single phrase for the callout.
function resolveService(id: string): { id: string; name: string; note: string } {
  const entry = serviceById(id);
  if (entry === undefined) {
    throw new Error(
      `CoreServicesDiagram: service id "${id}" does not resolve to a catalog entry; every label must come from the verified catalog.`,
    );
  }
  const note = `${entry.category}: ${entry.purpose}`;
  return { id: entry.id, name: entry.name, note };
}

// Build-time resolution: a flat list of every group with its services resolved
// to verified names. Evaluated once at module load (typed data, no DOM), so the
// island receives only plain serializable shapes and the gate can import() this
// module safely. A bad id throws right here, at discovery.
const RESOLVED_GROUPS = CATEGORY_GROUPS.map((group) => ({
  category: group.category,
  services: group.serviceIds.map(resolveService),
}));

// The flat list of every service id the map renders, for meta.serviceIds. This is
// what arms the gate's service-labels-resolve rule.
const SERVICE_IDS = CATEGORY_GROUPS.flatMap((group) => group.serviceIds);

// The interactive nodes: one per flagship service, its visible label the verified
// catalog name and its note the verified one-line purpose. Built from the
// resolved groups so a label can never be authored free-hand.
const nodes: DiagramNode[] = RESOLVED_GROUPS.flatMap((group) =>
  group.services.map((service) => ({
    id: service.id,
    label: service.name,
    note: service.note,
  })),
);

// The static SVG geometry. Five category columns across a 16:9 frame, each a
// labelled category header with its flagship service tiles beneath, connected by
// a short link so the "category contains these services" relationship reads. Every
// label lives in the SVG (the category name in the header, each service name in
// its tile) so the figure reads fully without interaction. currentColor inherits
// from the per-element token text color; stroke widths stay ~1.5 for the design
// weight. The column layout is computed so the labels stay aligned as the group
// list changes, but no value is hand-typed twice.
function CoreServicesGeometry() {
  const columnWidth = 60;
  const columnGap = 4;
  const firstColumnX = 6;
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
        return (
          <g key={group.category}>
            {/* The category header box, labelled with the AWS category name. */}
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
                y={headerY + 13}
                textAnchor="middle"
                className="fill-current font-sans text-[8px] font-semibold"
                fill="currentColor"
              >
                {group.category}
              </text>
            </g>

            {/* The flagship service tiles beneath the header, each labelled with
                the verified catalog name, connected to the header by a short
                link so the containment reads. */}
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

      {/* The takeaway label: the categories are how AWS groups its services, and
          a learner navigates the exam by category first. Text, not color. */}
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
      description="The core AWS service categories the exam covers — Compute, Storage, Database, Networking, and Serverless — each shown with one or two of its flagship services beneath it. Every service name is drawn from the verified service catalog. Select a service below to read what it does."
      nodes={nodes}
      viewBox="0 0 320 180"
      calloutLabel="Service"
    >
      <CoreServicesGeometry />
    </DiagramFigure>
  );
}

// The inline knowledge-check datum the lesson embeds after the diagram. Single
// answer, stable content-named option ids, no option-letter or positional
// phrasing; the option text is real catalog names and the explanation names
// option CONTENT. It checks that a learner can place a flagship service in its
// category — the skill the map builds. Traces to the EC2 service page.
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
    "Amazon EC2 is the flagship Compute service: resizable virtual servers you launch and scale. Amazon S3 is object Storage, Amazon RDS is a managed relational Database, and Amazon Route 53 is a Networking (DNS) service, so each of those belongs to a different core category.",
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
