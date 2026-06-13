import type { Question } from "../../lib/types";

// Domain 4: Billing, Pricing, and Support. Original practice questions.
export const domain4: Question[] = [
  {
    id: "d4-pricing-calculator-01",
    domain: 4,
    type: "single",
    topic: "Cost estimation",
    difficulty: "easy",
    stem: "Before deploying anything, an architect wants to estimate the monthly cost of a proposed mix of EC2, S3, and RDS, and compare a few configurations. Which AWS tool is built for this?",
    options: [
      { id: "a", text: "AWS Cost Explorer" },
      { id: "b", text: "AWS Pricing Calculator" },
      { id: "c", text: "AWS Budgets" },
      { id: "d", text: "AWS Cost and Usage Report" },
    ],
    correct: ["b"],
    explanation:
      "The AWS Pricing Calculator produces cost estimates for planned workloads before deployment. Cost Explorer and the Cost and Usage Report analyze spend that has already happened, and Budgets sends alerts against thresholds.",
    reference: {
      label: "AWS Pricing Calculator",
      url: "https://calculator.aws/",
    },
  },
  {
    id: "d4-spot-01",
    domain: 4,
    type: "single",
    topic: "EC2 pricing models",
    difficulty: "medium",
    stem: "A data pipeline runs fault-tolerant batch jobs that can be interrupted and restarted. The team wants the largest possible discount on EC2 capacity. Which purchasing option fits best?",
    options: [
      { id: "a", text: "On-Demand Instances" },
      { id: "b", text: "Dedicated Hosts" },
      { id: "c", text: "Spot Instances" },
      { id: "d", text: "Reserved Instances" },
    ],
    correct: ["c"],
    explanation:
      "Spot Instances use spare capacity at the deepest discount but can be reclaimed with a short notice, which suits interruptible, fault-tolerant work. On-Demand has no commitment or deep discount, Reserved Instances suit steady long-running workloads, and Dedicated Hosts address licensing or compliance.",
    reference: {
      label: "Amazon EC2 Spot Instances",
      url: "https://aws.amazon.com/ec2/spot/",
    },
    services: ["EC2"],
  },
  {
    id: "d4-support-business-01",
    domain: 4,
    type: "single",
    topic: "AWS Support plans",
    difficulty: "medium",
    stem: "A company running production workloads needs 24/7 phone and chat access to AWS support engineers and the full set of AWS Trusted Advisor checks. Which is the lowest-cost support plan that meets both requirements?",
    options: [
      { id: "a", text: "Basic Support" },
      { id: "b", text: "Developer Support" },
      { id: "c", text: "Business Support" },
      { id: "d", text: "Enterprise Support" },
    ],
    correct: ["c"],
    explanation:
      "Business Support is the lowest tier that includes 24/7 phone, chat, and email access to engineers and the full set of Trusted Advisor checks. Basic and Developer lack 24/7 engineer access and the full checks, and Enterprise adds more (such as a TAM) at higher cost than required here.",
    reference: {
      label: "AWS Support plans",
      url: "https://aws.amazon.com/premiumsupport/plans/",
    },
  },
];
