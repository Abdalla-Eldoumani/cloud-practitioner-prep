import type { Domain } from "../lib/types";

export interface StudyDay {
  day: number;
  title: string;
  focus: Domain[];
  summary: string;
  // Lesson slugs assigned to the day. Pages render only slugs that exist yet,
  // so the plan can list the full path while the library is still being authored.
  lessonSlugs: string[];
  targetMinutes: number;
  milestone?: string;
}

// The path front-loads Security (30%) and Technology (34%) because together they
// are 64% of the scored exam. Days 5 and 7 add timed full mocks to build stamina.
export const STUDY_PLAN: StudyDay[] = [
  {
    day: 1,
    title: "Cloud foundations",
    focus: [1, 3],
    summary:
      "What the cloud is, the six benefits, the global infrastructure, and the Well-Architected Framework.",
    lessonSlugs: [
      "what-is-cloud-computing",
      "six-benefits-of-the-cloud",
      "global-infrastructure-and-resilience",
      "well-architected-framework",
    ],
    targetMinutes: 75,
  },
  {
    day: 2,
    title: "Security and identity",
    focus: [2],
    summary:
      "The shared responsibility model in depth, the root user, IAM users, groups, roles, and federation.",
    lessonSlugs: ["shared-responsibility-model", "iam-fundamentals"],
    targetMinutes: 80,
  },
  {
    day: 3,
    title: "Data protection and detection",
    focus: [2],
    summary:
      "Encryption at rest and in transit, KMS and ACM, network protection, and the detection services.",
    lessonSlugs: [
      "data-protection-kms-acm",
      "network-and-app-protection",
      "detect-investigate-respond",
      "governance-and-compliance",
    ],
    targetMinutes: 95,
  },
  {
    day: 4,
    title: "Compute, networking, storage",
    focus: [3],
    summary:
      "EC2 and scaling, load balancing, Lambda and containers, the VPC, and the storage families.",
    lessonSlugs: [
      "ec2-fundamentals",
      "scaling-and-load-balancing",
      "serverless-and-containers",
      "vpc-networking",
      "storage-on-aws",
    ],
    targetMinutes: 95,
  },
  {
    day: 5,
    title: "Databases, integration, and the catalog",
    focus: [2, 3],
    summary:
      "Relational and NoSQL databases, caching, messaging, the AI and analytics services, and monitoring. Finish with your first full mock.",
    lessonSlugs: [
      "databases-on-aws",
      "messaging-and-integration",
      "ai-ml-and-analytics",
      "monitoring-cloudwatch-cloudtrail",
    ],
    targetMinutes: 145,
    milestone: "Take your first full 65-question timed mock exam.",
  },
  {
    day: 6,
    title: "Billing, pricing, support, and migration",
    focus: [1, 4],
    summary:
      "Pricing models, cost management tools, support plans, the Cloud Adoption Framework, and migration tooling.",
    lessonSlugs: [
      "pricing-models",
      "cost-management-tools",
      "support-plans",
      "migration-and-the-caf",
    ],
    targetMinutes: 80,
  },
  {
    day: 7,
    title: "Review and exam simulation",
    focus: [1, 2, 3, 4],
    summary:
      "Clear your flagged and missed questions, then run two timed mocks. Aim for a steady exam-ready band before you book.",
    lessonSlugs: [],
    targetMinutes: 180,
    milestone: "Score in the exam-ready band on two consecutive full mocks.",
  },
];
