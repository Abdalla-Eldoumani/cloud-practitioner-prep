import DiagramFigure, { type DiagramNode } from "@/components/diagrams/DiagramFigure";
import type { KnowledgeCheckDatum } from "@/components/diagrams/KnowledgeCheck";

// The VPC-components diagram for the vpc-networking lesson. It supplies the
// static SVG geometry + the node notes to the shared DiagramFigure (which owns
// the accessibility contract). The figure shows the containment a learner must
// be able to read: one VPC boundary holding a PUBLIC subnet and a PRIVATE subnet
// (each in a single Availability Zone), an internet gateway attached to the VPC
// that gives the public subnet its internet route, a NAT gateway giving the
// private subnet outbound-only access, a route table that decides where subnet
// traffic goes, a security group at the instance level (stateful), and a network
// ACL at the subnet level (stateless). No JS is needed to read it: every label
// is in the static SVG.
//
// Every label traces to an official AWS source (see the per-node notes and the
// plan's aws_sources). The public-vs-private subnet distinction is carried by a
// TEXT label, never color alone. Colors come from currentColor on token-colored
// <g> wrappers (text-ink / text-brand / text-accent / text-ink-soft) so both
// themes resolve and no raw hex appears.

// The interactive nodes. Each note is drawn ONLY from verified AWS phrasing.
const nodes: DiagramNode[] = [
  {
    id: "vpc",
    label: "VPC",
    note: "A logically isolated virtual network you have defined, where you launch your AWS resources. It resembles a traditional network in your own data center but runs on the scalable infrastructure of AWS, and you control its address range and routing.",
  },
  {
    id: "public-subnet",
    label: "Public subnet",
    note: "A range of IP addresses in the VPC that must reside in a single Availability Zone. It is public because its route table sends internet-bound traffic to an internet gateway, so it can hold resources that need to be reached directly, such as a public-facing web server.",
  },
  {
    id: "private-subnet",
    label: "Private subnet",
    note: "A range of IP addresses in the VPC that must reside in a single Availability Zone. It has no route to an internet gateway, so the outside cannot reach it directly; it holds resources you want shielded, such as a database.",
  },
  {
    id: "route-table",
    label: "Route table",
    note: "A set of rules that determines where network traffic from your subnet or gateway is directed. A subnet is public only because its route table routes internet-bound traffic to an internet gateway; without that route the same subnet is private.",
  },
  {
    id: "internet-gateway",
    label: "Internet gateway",
    note: "A horizontally scaled, redundant, highly available VPC component that connects your VPC to the internet. Attached to the VPC, it gives a subnet its public internet route and allows two-way communication for resources with public addresses.",
  },
  {
    id: "nat-gateway",
    label: "NAT gateway",
    note: "Lets instances in a private subnet reach the internet for outbound traffic, such as downloading updates, while preventing the internet from starting a connection back to them. It is the outbound-only path for private resources.",
  },
  {
    id: "security-group",
    label: "Security group",
    note: "Controls the traffic that is allowed to reach and leave the resources it is associated with. It operates at the instance level and is stateful, so a reply to an allowed request is permitted automatically regardless of its own rules.",
  },
  {
    id: "network-acl",
    label: "Network ACL",
    note: "Allows or denies specific inbound or outbound traffic at the subnet level. Unlike a security group it is stateless, so return traffic must be allowed explicitly by its own rules.",
  },
];

// The static SVG geometry. One VPC frame (the outer rounded rect) holding a
// public subnet and a private subnet tile, each labelled single-AZ; an internet
// gateway and a NAT gateway drawn on the VPC boundary; a route table tile; and a
// security-group / network-ACL pair noting the instance-level-stateful vs
// subnet-level-stateless distinction in text. Every label lives in the SVG so
// the figure reads fully without interaction. currentColor inherits from the
// per-element token text color; stroke widths stay ~1.5 for the design weight.
function VpcGeometry() {
  return (
    <>
      {/* The internet, outside the VPC, that the gateways connect to. */}
      <g className="text-ink-soft">
        <text
          x="160"
          y="13"
          textAnchor="middle"
          className="fill-current font-sans text-[8px]"
          fill="currentColor"
        >
          Internet
        </text>
      </g>

      {/* The VPC frame: the labelled isolated-network boundary. */}
      <g className="text-brand">
        <rect
          x="10"
          y="20"
          width="300"
          height="148"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="20"
          y="34"
          className="fill-current font-sans text-[9px] font-semibold"
          fill="currentColor"
        >
          VPC — isolated virtual network
        </text>
      </g>

      {/* The internet gateway and NAT gateway, sitting on the VPC boundary. The
          IGW is the two-way internet door for public resources; the NAT gateway
          is the outbound-only door for private ones. */}
      <g className="text-accent">
        <rect
          x="64"
          y="20"
          width="44"
          height="16"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="86"
          y="31"
          textAnchor="middle"
          className="fill-current font-sans text-[6.5px] font-semibold"
          fill="currentColor"
        >
          Internet gw
        </text>
        <line
          x1="86"
          y1="20"
          x2="86"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        <rect
          x="212"
          y="20"
          width="44"
          height="16"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text
          x="234"
          y="31"
          textAnchor="middle"
          className="fill-current font-sans text-[6.5px] font-semibold"
          fill="currentColor"
        >
          NAT gw
        </text>
      </g>

      {/* The public subnet (single AZ), routed to the internet gateway. */}
      <g className="text-ink">
        <rect
          x="22"
          y="52"
          width="124"
          height="74"
          rx="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="84"
          y="68"
          textAnchor="middle"
          className="fill-current font-sans text-[8px] font-semibold"
          fill="currentColor"
        >
          Public subnet
        </text>
        <text
          x="84"
          y="82"
          textAnchor="middle"
          className="fill-current font-sans text-[6.5px]"
          fill="currentColor"
        >
          Single Availability Zone
        </text>
        <text
          x="84"
          y="96"
          textAnchor="middle"
          className="fill-current font-sans text-[6.5px]"
          fill="currentColor"
        >
          Route to internet gateway
        </text>
      </g>

      {/* The private subnet (single AZ), outbound-only via the NAT gateway. */}
      <g className="text-ink">
        <rect
          x="174"
          y="52"
          width="124"
          height="74"
          rx="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="236"
          y="68"
          textAnchor="middle"
          className="fill-current font-sans text-[8px] font-semibold"
          fill="currentColor"
        >
          Private subnet
        </text>
        <text
          x="236"
          y="82"
          textAnchor="middle"
          className="fill-current font-sans text-[6.5px]"
          fill="currentColor"
        >
          Single Availability Zone
        </text>
        <text
          x="236"
          y="96"
          textAnchor="middle"
          className="fill-current font-sans text-[6.5px]"
          fill="currentColor"
        >
          Outbound only via NAT
        </text>
      </g>

      {/* The security group (instance level, stateful) inside the public subnet
          and the network ACL (subnet level, stateless) on the subnet edge, so
          the two-layer model reads in text, not color. */}
      <g className="text-ink-soft">
        <rect
          x="34"
          y="104"
          width="100"
          height="16"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="84"
          y="115"
          textAnchor="middle"
          className="fill-current font-sans text-[6px]"
          fill="currentColor"
        >
          Security group: instance, stateful
        </text>

        <rect
          x="186"
          y="104"
          width="100"
          height="16"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text
          x="236"
          y="115"
          textAnchor="middle"
          className="fill-current font-sans text-[6px]"
          fill="currentColor"
        >
          Network ACL: subnet, stateless
        </text>
      </g>

      {/* The route table band: it decides where each subnet's traffic goes. */}
      <g className="text-accent">
        <rect
          x="60"
          y="140"
          width="200"
          height="20"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="160"
          y="153"
          textAnchor="middle"
          className="fill-current font-sans text-[7px] font-semibold"
          fill="currentColor"
        >
          Route table — directs each subnet&apos;s traffic
        </text>
      </g>
    </>
  );
}

export default function VpcDiagram() {
  return (
    <DiagramFigure
      idBase="vpc"
      title="Inside an Amazon VPC"
      description="One VPC boundary contains a public subnet and a private subnet, each in a single Availability Zone. An internet gateway attached to the VPC gives the public subnet its internet route; a NAT gateway gives the private subnet outbound-only access. A route table directs each subnet's traffic. A security group controls traffic at the instance level and is stateful; a network ACL filters at the subnet level and is stateless."
      nodes={nodes}
      viewBox="0 0 320 180"
      calloutLabel="Part"
    >
      <VpcGeometry />
    </DiagramFigure>
  );
}

// The inline knowledge-check datum the lesson embeds after the diagram. Single
// answer, stable content-named option ids, no option-letter or positional
// phrasing; the explanation names option CONTENT. Traces to the VPC user guide.
const vpcCheck: KnowledgeCheckDatum = {
  prompt: "What actually makes a subnet in a VPC public rather than private?",
  options: [
    {
      id: "route-to-igw",
      text: "Its route table sends internet-bound traffic to an internet gateway; remove that route and the same subnet is private.",
    },
    {
      id: "nat-makes-public",
      text: "A NAT gateway is attached to it, which lets the internet open connections to its instances.",
    },
    {
      id: "spans-all-azs",
      text: "It is stretched across every Availability Zone in the Region instead of sitting in one.",
    },
    {
      id: "stateful-security-group",
      text: "A stateful security group is applied to it, which is what opens it to the internet.",
    },
  ],
  correct: ["route-to-igw"],
  explanation:
    "A subnet is public only because its route table routes internet-bound traffic to an internet gateway; without that route the same subnet is private. A NAT gateway gives a private subnet outbound-only access and never lets the internet start a connection in, a subnet must reside in a single Availability Zone, and a security group filters at the instance level rather than making a subnet public.",
  reference: {
    label: "AWS: What is Amazon VPC?",
    url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html",
  },
};

export const meta = {
  lessonSlug: "vpc-networking",
  check: vpcCheck,
};
