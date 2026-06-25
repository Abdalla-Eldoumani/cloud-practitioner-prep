import DiagramFigure, { type DiagramNode } from "@/components/diagrams/DiagramFigure";
import type { KnowledgeCheckDatum } from "@/components/diagrams/KnowledgeCheck";

// The Regions-and-Availability-Zones diagram for the global-infrastructure
// lesson. It supplies the static SVG geometry + the node notes to the shared
// DiagramFigure (which owns the accessibility contract). The figure shows the
// containment a learner must be able to draw from memory: one Region frame
// holding three Availability Zones (each "one or more discrete data centers")
// interconnected by low-latency links, with a SEPARATE edge-location layer
// OUTSIDE the Region tied to Amazon CloudFront, and a "you choose the Region"
// cue. No JS is needed to read it: every label is in the static SVG.
//
// Every label traces to an official AWS source (see the per-node notes). The
// count caution is honored: the diagram shows ">= 3 AZs per Region", never a
// specific or global tally (those are volatile). Colors come from currentColor
// on token-colored <g> wrappers (text-ink / text-brand / text-accent /
// text-ink-soft) so both themes resolve and no raw hex appears.

// The interactive nodes. Each note is drawn ONLY from verified AWS phrasing.
const nodes: DiagramNode[] = [
  {
    id: "region",
    label: "AWS Region",
    note: "A physical location, a separate geographic area, where AWS clusters data centers. Each Region consists of a minimum of three isolated and physically separate Availability Zones. You choose which Region your resources run in, and they stay there unless you move them.",
  },
  {
    id: "az",
    label: "Availability Zone",
    note: "One or more discrete data centers, each with redundant power, networking, and connectivity, housed in separate facilities. The AZs in a Region are physically separated by a meaningful distance, many kilometers, so a single event is unlikely to hit more than one.",
  },
  {
    id: "interconnect",
    label: "Low-latency links",
    note: "The Availability Zones in a Region are interconnected with high-bandwidth, low-latency networking, so a workload can run across several AZs at once. Spreading across AZs is what makes an application more highly available and fault tolerant than one data center.",
  },
  {
    id: "edge",
    label: "Edge locations",
    note: "A separate, much larger network of sites that sits OUTSIDE the Regions. Amazon CloudFront, the AWS content delivery network, serves cached content from the edge location with the lowest latency to the user, shortening the path the request travels.",
  },
];

// The static SVG geometry. One Region frame (the outer rounded rect) holding
// three AZ tiles connected by short links, plus an edge-location band drawn
// outside the Region and labelled with CloudFront. Text labels live in the SVG
// so the figure reads fully without interaction. currentColor inherits from the
// per-element token text color; stroke widths stay ~1.5 for the design weight.
function RegionsAzGeometry() {
  return (
    <>
      {/* "You choose the Region" cue, above the Region frame. */}
      <g className="text-ink-soft">
        <text
          x="12"
          y="16"
          className="fill-current font-sans text-[9px]"
          fill="currentColor"
        >
          You choose the Region
        </text>
      </g>

      {/* The Region frame: a labelled boundary containing the AZs. */}
      <g className="text-brand">
        <rect
          x="10"
          y="24"
          width="214"
          height="142"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="20"
          y="40"
          className="fill-current font-sans text-[10px] font-semibold"
          fill="currentColor"
        >
          AWS Region
        </text>
      </g>

      {/* The three Availability Zones inside the Region. The "&ge; 3" note is
          drawn as a label so the relationship reads without a count. */}
      <g className="text-ink">
        {[0, 1, 2].map((i) => {
          const x = 22 + i * 66;
          return (
            <g key={i}>
              <rect
                x={x}
                y="58"
                width="56"
                height="78"
                rx="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <text
                x={x + 28}
                y="76"
                textAnchor="middle"
                className="fill-current font-sans text-[8px] font-semibold"
                fill="currentColor"
              >
                AZ {i + 1}
              </text>
              <text
                x={x + 28}
                y="100"
                textAnchor="middle"
                className="fill-current font-sans text-[6.5px]"
                fill="currentColor"
              >
                One or more
              </text>
              <text
                x={x + 28}
                y="110"
                textAnchor="middle"
                className="fill-current font-sans text-[6.5px]"
                fill="currentColor"
              >
                discrete data
              </text>
              <text
                x={x + 28}
                y="120"
                textAnchor="middle"
                className="fill-current font-sans text-[6.5px]"
                fill="currentColor"
              >
                centers
              </text>
            </g>
          );
        })}
      </g>

      {/* The low-latency interconnect between the AZs. Solid lines (not motion)
          so the relationship is legible statically. */}
      <g className="text-accent">
        <line
          x1="78"
          y1="97"
          x2="88"
          y2="97"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="144"
          y1="97"
          x2="154"
          y2="97"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="117"
          y="150"
          textAnchor="middle"
          className="fill-current font-sans text-[7px]"
          fill="currentColor"
        >
          &ge; 3 AZs, low-latency links
        </text>
      </g>

      {/* The edge-location layer OUTSIDE the Region, tied to CloudFront. */}
      <g className="text-ink-soft">
        <rect
          x="236"
          y="40"
          width="74"
          height="110"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text
          x="273"
          y="58"
          textAnchor="middle"
          className="fill-current font-sans text-[8px] font-semibold"
          fill="currentColor"
        >
          Edge
        </text>
        <text
          x="273"
          y="69"
          textAnchor="middle"
          className="fill-current font-sans text-[8px] font-semibold"
          fill="currentColor"
        >
          locations
        </text>
        <text
          x="273"
          y="92"
          textAnchor="middle"
          className="fill-current font-sans text-[6.5px]"
          fill="currentColor"
        >
          Amazon
        </text>
        <text
          x="273"
          y="102"
          textAnchor="middle"
          className="fill-current font-sans text-[6.5px]"
          fill="currentColor"
        >
          CloudFront
        </text>
        <text
          x="273"
          y="124"
          textAnchor="middle"
          className="fill-current font-sans text-[6px]"
          fill="currentColor"
        >
          Separate
        </text>
        <text
          x="273"
          y="133"
          textAnchor="middle"
          className="fill-current font-sans text-[6px]"
          fill="currentColor"
        >
          global layer
        </text>
      </g>
    </>
  );
}

export default function RegionsAzDiagram() {
  return (
    <DiagramFigure
      idBase="regions-az"
      title="AWS Regions and Availability Zones"
      description="One AWS Region frame contains at least three Availability Zones, each one or more discrete data centers, interconnected by high-bandwidth low-latency links. A separate edge-location layer for Amazon CloudFront sits outside the Region. You choose which Region your resources run in."
      nodes={nodes}
      viewBox="0 0 320 180"
      calloutLabel="Part"
    >
      <RegionsAzGeometry />
    </DiagramFigure>
  );
}

// The inline knowledge-check datum the lesson embeds after the diagram. Single
// answer, stable option ids, no option-letter or positional phrasing; the
// explanation names option CONTENT. Traces to the Regions/AZs AWS page.
const regionsAzCheck: KnowledgeCheckDatum = {
  prompt:
    "How does AWS organize Regions and Availability Zones, and where do edge locations fit?",
  options: [
    {
      id: "region-contains-azs",
      text: "A Region is a geographic area containing a minimum of three isolated Availability Zones, while edge locations are a separate layer outside Regions used by CloudFront.",
    },
    {
      id: "az-contains-regions",
      text: "An Availability Zone is a geographic area that contains several Regions, and edge locations live inside each Region.",
    },
    {
      id: "az-single-datacenter-only",
      text: "Each Availability Zone is exactly one data center, and a Region always has precisely two of them.",
    },
    {
      id: "edge-replaces-regions",
      text: "Edge locations replace Regions for compute, so a workload runs in an edge location instead of an Availability Zone.",
    },
  ],
  correct: ["region-contains-azs"],
  explanation:
    "A Region is a geographic area made up of a minimum of three isolated, physically separate Availability Zones, and each AZ is one or more discrete data centers. Edge locations are a separate, larger network outside the Regions that CloudFront uses to cache content close to users.",
  reference: {
    label: "AWS: Regions and Availability Zones",
    url: "https://aws.amazon.com/about-aws/global-infrastructure/regions_az/",
  },
};

export const meta = {
  lessonSlug: "global-infrastructure-and-resilience",
  check: regionsAzCheck,
};
