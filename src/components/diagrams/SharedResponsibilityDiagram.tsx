import DiagramFigure, { type DiagramNode } from "@/components/diagrams/DiagramFigure";
import type { KnowledgeCheckDatum } from "@/components/diagrams/KnowledgeCheck";

// The Shared Responsibility Model diagram for the shared-responsibility lesson.
// It supplies the static SVG geometry + node notes to the shared DiagramFigure
// (which owns the accessibility contract). The figure draws the split the
// lesson names as TWO labelled columns: an AWS column ("security OF the cloud")
// and a Customer column ("security IN the cloud"), with a cue that the line
// moves with the service. The columns are labelled in text (not color alone)
// so the split reads without interaction and without relying on a tint.
//
// Every label traces to the AWS Shared Responsibility Model page (see the node
// notes). AWS's canonical phrasing is lowercase "security of/in the cloud"; the
// lesson capitalizes OF/IN for emphasis, so the diagram matches the lesson's
// emphasis while each note keeps AWS's exact claim. Colors come from
// currentColor on token-colored <g> wrappers (text-blueprint for the AWS column,
// text-flag for the Customer column, text-ink-1 / text-ink-2 for shared
// chrome) so both themes resolve and no raw hex appears.

const nodes: DiagramNode[] = [
  {
    id: "aws-of",
    label: "AWS: security OF the cloud",
    note: "AWS is responsible for protecting the infrastructure that runs all of the AWS Cloud services. That infrastructure is the hardware, software, networking, and facilities that run AWS Cloud services, plus the global infrastructure of Regions, Availability Zones, and edge locations.",
  },
  {
    id: "customer-in",
    label: "Customer: security IN the cloud",
    note: "You are responsible for security in the cloud: everything you put on top of the infrastructure and configure. Your exact duties are determined by the AWS Cloud services you select, so the responsibility shifts with the service.",
  },
  {
    id: "customer-os",
    label: "Guest OS and patches",
    note: "Management of the guest operating system, including its updates and security patches, on the servers you run. On Amazon EC2 this is yours; on managed and serverless services AWS operates the OS, so it leaves your plate.",
  },
  {
    id: "customer-firewall",
    label: "Security-group config",
    note: "Configuration of the AWS-provided firewall, called a security group, and your other network and firewall rules. You decide what traffic is allowed to reach and leave your resources.",
  },
  {
    id: "customer-data-iam",
    label: "Data, encryption, and IAM",
    note: "Managing your data, including classification and your encryption options, and using IAM tools to apply the appropriate permissions so only the right identities can sign in and act.",
  },
];

// The static SVG geometry: two side-by-side column frames with stacked item
// rows, an OF / IN header per column, and a "the line moves with the service"
// note across the bottom. All labels are in the SVG so the figure reads fully
// without interaction. currentColor inherits from each <g>'s token text color.
function SharedResponsibilityGeometry() {
  const awsItems = ["Hardware", "Software", "Networking", "Facilities"];
  const awsGlobal = "Regions, AZs, edge locations";
  const customerItems = [
    "Guest OS + patches",
    "Security-group config",
    "Data + encryption",
    "IAM permissions",
  ];

  return (
    <>
      {/* The AWS column: security OF the cloud. */}
      <g className="text-blueprint">
        <rect
          x="10"
          y="14"
          width="142"
          height="134"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="81"
          y="30"
          textAnchor="middle"
          className="fill-current font-sans text-[9px] font-semibold"
          fill="currentColor"
        >
          AWS
        </text>
        <text
          x="81"
          y="41"
          textAnchor="middle"
          className="fill-current font-sans text-[7.5px]"
          fill="currentColor"
        >
          security OF the cloud
        </text>
        {awsItems.map((label, i) => (
          <text
            key={label}
            x="81"
            y={58 + i * 14}
            textAnchor="middle"
            className="fill-current font-sans text-[7.5px]"
            fill="currentColor"
          >
            {label}
          </text>
        ))}
        <text
          x="81"
          y={58 + awsItems.length * 14 + 6}
          textAnchor="middle"
          className="fill-current font-sans text-[6.5px]"
          fill="currentColor"
        >
          {awsGlobal}
        </text>
      </g>

      {/* The Customer column: security IN the cloud. */}
      <g className="text-flag">
        <rect
          x="168"
          y="14"
          width="142"
          height="134"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="239"
          y="30"
          textAnchor="middle"
          className="fill-current font-sans text-[9px] font-semibold"
          fill="currentColor"
        >
          Customer
        </text>
        <text
          x="239"
          y="41"
          textAnchor="middle"
          className="fill-current font-sans text-[7.5px]"
          fill="currentColor"
        >
          security IN the cloud
        </text>
        {customerItems.map((label, i) => (
          <text
            key={label}
            x="239"
            y={58 + i * 14}
            textAnchor="middle"
            className="fill-current font-sans text-[7.5px]"
            fill="currentColor"
          >
            {label}
          </text>
        ))}
      </g>

      {/* The dividing line + the "line moves with the service" cue. */}
      <g className="text-ink-2">
        <line
          x1="160"
          y1="20"
          x2="160"
          y2="142"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text
          x="160"
          y="164"
          textAnchor="middle"
          className="fill-current font-sans text-[7px]"
          fill="currentColor"
        >
          The line moves with the service you select
        </text>
      </g>
    </>
  );
}

export default function SharedResponsibilityDiagram() {
  return (
    <DiagramFigure
      idBase="shared-responsibility"
      title="The AWS Shared Responsibility Model"
      description="Two columns split security between AWS and the customer. AWS is responsible for security of the cloud: the hardware, software, networking, and facilities, plus the global infrastructure of Regions, Availability Zones, and edge locations. The customer is responsible for security in the cloud: the guest operating system and patches, security-group configuration, data and encryption, and IAM permissions. The dividing line moves with the service the customer selects."
      nodes={nodes}
      viewBox="0 0 320 180"
      calloutLabel="Responsibility"
    >
      <SharedResponsibilityGeometry />
    </DiagramFigure>
  );
}

// The inline knowledge-check: classify an item to the correct side. Single
// answer, stable option ids, no option-letter or positional phrasing; the
// explanation names option CONTENT. Traces to the Shared Responsibility page.
const sharedResponsibilityCheck: KnowledgeCheckDatum = {
  prompt:
    "On Amazon EC2, who is responsible for installing operating-system security patches on the instance?",
  options: [
    {
      id: "customer-ec2-os",
      text: "The customer, because patching the guest operating system on an EC2 instance is security in the cloud.",
    },
    {
      id: "aws-all-patching",
      text: "AWS, because AWS patches every operating system for every service it offers.",
    },
    {
      id: "no-one-managed",
      text: "No one, since EC2 instances do not run an operating system that needs patching.",
    },
    {
      id: "split-evenly",
      text: "AWS and the customer split every patch evenly, because the model is always a fixed fifty-fifty division.",
    },
  ],
  correct: ["customer-ec2-os"],
  explanation:
    "Patching the guest operating system on an EC2 instance is the customer's job: it is security in the cloud. AWS runs the host and hypervisor, but because EC2 is treated as infrastructure, the OS, its patches, the firewall configuration, and the software on it are the customer's responsibility. On a managed service such as Amazon RDS, AWS handles the underlying OS and engine patching instead, which shows the line moving with the service.",
  reference: {
    label: "AWS: Shared Responsibility Model",
    url: "https://aws.amazon.com/compliance/shared-responsibility-model/",
  },
};

export const meta = {
  lessonSlug: "shared-responsibility-model",
  check: sharedResponsibilityCheck,
};
