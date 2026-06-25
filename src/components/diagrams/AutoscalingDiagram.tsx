import DiagramFigure, { type DiagramNode } from "@/components/diagrams/DiagramFigure";
import type { KnowledgeCheckDatum } from "@/components/diagrams/KnowledgeCheck";

// The Auto-Scaling-behind-a-load-balancer diagram for the
// scaling-and-load-balancing lesson. It supplies the static SVG geometry + the
// node notes to the shared DiagramFigure (which owns the accessibility
// contract). The figure shows the topology a learner must be able to read: one
// load balancer as the single entry point distributing across an Auto Scaling
// group that spans two Availability Zones, instances in each AZ, a
// minimum/desired/maximum annotation on the group, a scaling policy that triggers
// scale-out/scale-in on a metric, and the auto-register/deregister relationship
// between launched instances and the load balancer. No JS is needed to read it:
// every label is in the static SVG.
//
// Every label traces to an official AWS source (see the per-node notes and the
// plan's aws_sources). It references Elastic Load Balancing / current-generation
// load balancers, NEVER the Classic Load Balancer. Colors come from currentColor
// on token-colored <g> wrappers (text-ink / text-brand / text-accent /
// text-ink-soft) so both themes resolve and no raw hex appears; the healthy-vs-
// the rest distinction and every relationship are carried in TEXT, not color.

// The interactive nodes. Each note is drawn ONLY from verified AWS phrasing.
const nodes: DiagramNode[] = [
  {
    id: "load-balancer",
    label: "Load balancer",
    note: "The single point of contact for clients. It automatically distributes incoming traffic across multiple targets, such as EC2 instances, in one or more Availability Zones, monitors the health of its registered targets, and routes traffic only to the healthy targets.",
  },
  {
    id: "asg",
    label: "Auto Scaling group",
    note: "Holds the group between a minimum it never goes below and a maximum it never goes above, at a desired capacity it tries to hold. It balances instances evenly across the Availability Zones as the group scales, and replaces terminated or impaired instances to maintain the desired capacity.",
  },
  {
    id: "min-desired-max",
    label: "Min / desired / max",
    note: "The minimum is the size the group never drops below, the maximum is the size it never exceeds, and the desired capacity is the number of instances the group ensures it has between them.",
  },
  {
    id: "scaling-policy",
    label: "Scaling policy",
    note: "A policy on a metric drives dynamic scaling: it scales out to add instances when demand rises and scales in to remove them when demand falls, keeping capacity tracking demand within the minimum and maximum.",
  },
  {
    id: "register",
    label: "Auto-register",
    note: "Instances launched by Auto Scaling are automatically registered with the load balancer, and instances that are terminated are automatically de-registered, so traffic always flows to current, healthy capacity.",
  },
];

// The static SVG geometry. A load balancer band at the top as the single entry
// point; an Auto Scaling group frame spanning two Availability Zone tiles, each
// holding instances; a min/desired/max annotation on the group; a scaling-policy
// trigger; and labelled arrows showing the LB distributing to healthy targets
// and instances auto-registering. Every label lives in the SVG so the figure
// reads fully without interaction. currentColor inherits from the per-element
// token text color; stroke widths stay ~1.5 for the design weight.
function AutoscalingGeometry() {
  return (
    <>
      {/* Clients arriving at the single entry point. */}
      <g className="text-ink-soft">
        <text
          x="160"
          y="12"
          textAnchor="middle"
          className="fill-current font-sans text-[8px]"
          fill="currentColor"
        >
          Incoming traffic
        </text>
      </g>

      {/* The load balancer: the single point of contact. */}
      <g className="text-brand">
        <rect
          x="96"
          y="18"
          width="128"
          height="24"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="160"
          y="29"
          textAnchor="middle"
          className="fill-current font-sans text-[8px] font-semibold"
          fill="currentColor"
        >
          Load balancer
        </text>
        <text
          x="160"
          y="38"
          textAnchor="middle"
          className="fill-current font-sans text-[6px]"
          fill="currentColor"
        >
          Single entry point, routes to healthy targets
        </text>
      </g>

      {/* The two distribution paths, one into each AZ, labelled "healthy" so the
          routes-only-to-healthy rule reads in text. */}
      <g className="text-accent">
        <line
          x1="120"
          y1="42"
          x2="84"
          y2="64"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="200"
          y1="42"
          x2="236"
          y2="64"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="92"
          y="58"
          textAnchor="middle"
          className="fill-current font-sans text-[6px]"
          fill="currentColor"
        >
          to healthy
        </text>
        <text
          x="228"
          y="58"
          textAnchor="middle"
          className="fill-current font-sans text-[6px]"
          fill="currentColor"
        >
          to healthy
        </text>
      </g>

      {/* The Auto Scaling group frame spanning the two Availability Zones. */}
      <g className="text-brand">
        <rect
          x="14"
          y="64"
          width="292"
          height="86"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />
        <text
          x="22"
          y="77"
          className="fill-current font-sans text-[8px] font-semibold"
          fill="currentColor"
        >
          Auto Scaling group — balances evenly across AZs
        </text>
      </g>

      {/* Two Availability Zone tiles inside the group, each with instances. */}
      <g className="text-ink">
        {[
          { x: 24, label: "Availability Zone A" },
          { x: 168, label: "Availability Zone B" },
        ].map((az) => (
          <g key={az.label}>
            <rect
              x={az.x}
              y="84"
              width="128"
              height="40"
              rx="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <text
              x={az.x + 64}
              y="97"
              textAnchor="middle"
              className="fill-current font-sans text-[7px] font-semibold"
              fill="currentColor"
            >
              {az.label}
            </text>
            {[0, 1].map((i) => (
              <rect
                key={i}
                x={az.x + 38 + i * 28}
                y="102"
                width="24"
                height="12"
                rx="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            ))}
            <text
              x={az.x + 64}
              y="121"
              textAnchor="middle"
              className="fill-current font-sans text-[5.5px]"
              fill="currentColor"
            >
              instances
            </text>
          </g>
        ))}
      </g>

      {/* The min/desired/max annotation on the group. */}
      <g className="text-ink-soft">
        <text
          x="160"
          y="136"
          textAnchor="middle"
          className="fill-current font-sans text-[7px]"
          fill="currentColor"
        >
          Minimum &le; desired capacity &le; maximum; impaired instances replaced
        </text>
      </g>

      {/* The scaling-policy trigger and the auto-register relationship. */}
      <g className="text-accent">
        <text
          x="160"
          y="148"
          textAnchor="middle"
          className="fill-current font-sans text-[6.5px]"
          fill="currentColor"
        >
          Scaling policy scales out / in on a metric; instances auto-register with the LB
        </text>
      </g>
    </>
  );
}

export default function AutoscalingDiagram() {
  return (
    <DiagramFigure
      idBase="autoscaling"
      title="Auto Scaling behind a load balancer across Availability Zones"
      description="A load balancer is the single entry point that distributes incoming traffic only to healthy targets across two Availability Zones. Behind it an Auto Scaling group spans both Availability Zones, holding instances between a minimum and a maximum at a desired capacity, balancing them evenly across the zones and replacing impaired instances. A scaling policy scales the group out and in on a metric, and instances launched by Auto Scaling automatically register with the load balancer."
      nodes={nodes}
      viewBox="0 0 320 180"
      calloutLabel="Part"
    >
      <AutoscalingGeometry />
    </DiagramFigure>
  );
}

// The inline knowledge-check datum the lesson embeds after the diagram. Single
// answer, stable content-named option ids, no option-letter or positional
// phrasing; the explanation names option CONTENT. Traces to the EC2 Auto Scaling
// user guide.
const autoscalingCheck: KnowledgeCheckDatum = {
  prompt:
    "In an Auto Scaling group, what do the minimum, desired, and maximum settings do?",
  options: [
    {
      id: "floor-target-ceiling",
      text: "The minimum is the size the group never drops below, the maximum is the size it never exceeds, and the desired capacity is the number of instances it tries to hold between them.",
    },
    {
      id: "desired-is-a-hard-cap",
      text: "The desired capacity is a hard ceiling the group can never go above, making the maximum setting unnecessary.",
    },
    {
      id: "minimum-is-per-az-only",
      text: "The minimum applies to one Availability Zone at a time, so the group ignores it whenever it spans more than one zone.",
    },
    {
      id: "maximum-forces-constant-size",
      text: "Setting a maximum forces the group to run that exact number of instances at all times, with no scaling in.",
    },
  ],
  correct: ["floor-target-ceiling"],
  explanation:
    "The minimum is the floor the group never goes below, the maximum is the ceiling it never goes above, and the desired capacity is the number of instances Auto Scaling ensures it holds between them, replacing impaired instances to keep that capacity. The desired capacity is not a ceiling, the minimum and maximum apply to the whole group rather than one Availability Zone, and a maximum sets an upper bound rather than forcing a constant size.",
  reference: {
    label: "AWS: What is Amazon EC2 Auto Scaling?",
    url: "https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html",
  },
};

export const meta = {
  lessonSlug: "scaling-and-load-balancing",
  check: autoscalingCheck,
};
