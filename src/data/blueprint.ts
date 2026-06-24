// The CLF-C02 exam blueprint as typed data: the 19 official task statements with
// an explicit, hand-authored join to the lessons and question topics that cover
// each one. The coverage page renders this join; `scripts/lint-coverage.ts` gates
// it, hard-failing if any statement resolves to zero covering lessons OR zero
// covering questions, or if any authored slug/topic is a typo that resolves to
// nothing. So the map is honest by construction rather than a vacuous "all green".
//
// Source for the statement ids, titles, and domain weights: the official AWS
// Certified Cloud Practitioner (CLF-C02) Exam Guide content outline (4 domains,
// 19 task statements, weights 24/30/34/12). Titles are transcribed verbatim from
// that guide. Re-verify against the guide on any content pass; the web
// content-auditor re-checks both the titles and the join at phase end.
//
// Join model (the lint and the coverage page resolve identically):
//   lessons   = lessonSlugs mapped against the lesson content collection (by slug)
//   questions = ALL_QUESTIONS.filter(q => q.domain === ts.domain
//                 && normalizedTopicSet.has(normalizeTopic(q.topic)))
// so a statement's topics are matched to questions THROUGH normalizeTopic (the
// same key the store and the drill use) and constrained to the statement's own
// domain. Authoring note: this question bank's domain tagging diverges from the
// guide's domain placement for two statements. Migration / Cloud Adoption
// Framework questions are tagged Domain 4 though the guide places migration under
// Domain 1 (1.3); Region / Availability Zone / edge-location questions are tagged
// Domain 1 though the guide places global infrastructure under Domain 3 (3.2). For
// each, the question side below uses the in-domain topics that genuinely cover the
// statement (1.3: the Domain-1 deployment-model / on-premises-tradeoff / disaster-
// recovery cluster; 3.2: the Domain-3 edge and infrastructure-extending service
// topics) while the lesson side points at the dedicated lesson. Both are flagged
// for the content-auditor pass.

import type { Domain, DocReference } from "../lib/types";

// One exam task statement plus its coverage join. `id` is the guide's
// "<domain>.<index>" label (e.g. "3.3"); `domain` is the leading digit; `title`
// is the guide wording verbatim; `reference` is the exam guide. `lessonSlugs` are
// the covering lessons by stable slug (file name without extension); `topics` are
// the covering Question.topic strings, matched to questions via normalizeTopic.
// The lint enforces non-empty coverage on BOTH sides and referential integrity of
// every slug and topic.
export interface TaskStatement {
  id: string; // "1.1" ... "4.3"
  domain: Domain;
  title: string; // exact CLF-C02 exam-guide wording
  reference: DocReference; // the CLF-C02 exam guide
  lessonSlugs: string[]; // covering lessons, by stable slug
  topics: string[]; // covering Question.topic values (normalized-match)
}

// The CLF-C02 exam guide, the single source for every statement title below. On
// the link-checker's AWS-host allowlist (docs.aws.amazon.com).
const EXAM_GUIDE: DocReference = {
  label: "AWS Certified Cloud Practitioner (CLF-C02) Exam Guide",
  url: "https://docs.aws.amazon.com/aws-certification/latest/examguides/cloud-practitioner-02.html",
};

export const TASK_STATEMENTS: TaskStatement[] = [
  // ---- Domain 1: Cloud Concepts (24%) ----
  {
    id: "1.1",
    domain: 1,
    title: "Define the benefits of the AWS Cloud.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["what-is-cloud-computing", "six-benefits-of-the-cloud"],
    topics: [
      "Six advantages of cloud",
      "Benefits of the AWS Cloud",
      "Agility",
      "Agility and experimentation",
      "Economies of scale",
      "Stop guessing capacity",
      "Global reach",
      "Undifferentiated heavy lifting",
      "Cloud vs on-premises tradeoffs",
      "Definition of cloud computing",
      "Client-server model",
      "Managed elastic services",
    ],
  },
  {
    id: "1.2",
    domain: 1,
    title: "Identify design principles of the AWS Cloud.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["well-architected-framework"],
    topics: [
      "Cloud design principles",
      "General design principles",
      "Designing for failure",
      "Decoupling for resilience",
      "Six pillars",
      "Pillar discrimination",
      "Well-Architected Framework",
      "AWS Well-Architected Tool",
      "Reliability design principles",
      "Operational Excellence pillar",
      "Security pillar",
      "Reliability pillar",
      "Performance Efficiency pillar",
      "Cost Optimization pillar",
      "Sustainability pillar",
    ],
  },
  {
    id: "1.3",
    domain: 1,
    title:
      "Understand the benefits of and strategies for migration to the AWS Cloud.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["migration-and-the-caf"],
    // The bank tags migration / CAF questions under Domain 4 (see file header), so
    // 1.3's Domain-1 question coverage is the deployment-model + on-premises-
    // tradeoff + disaster-recovery cluster that covers WHY and HOW to move to the
    // cloud and the resilience strategies a migration adopts.
    topics: [
      "Cloud deployment models",
      "Cloud vs on-premises tradeoffs",
      "Backup and restore",
      "Disaster recovery strategies",
      "Recovery objectives",
      "Pilot light vs warm standby",
      "Undifferentiated heavy lifting",
    ],
  },
  {
    id: "1.4",
    domain: 1,
    title: "Understand concepts of cloud economics.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["six-benefits-of-the-cloud"],
    topics: [
      "Cloud economics",
      "Cloud economics principles",
      "Capital vs operational expenditure",
      "Total cost of ownership",
      "Consumption-based pricing",
      "Cost drivers",
      "Cost benefit of elasticity",
      "Economies of scale",
    ],
  },

  // ---- Domain 2: Security and Compliance (30%) ----
  {
    id: "2.1",
    domain: 2,
    title: "Understand the AWS shared responsibility model.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["shared-responsibility-model"],
    topics: [
      "Shared Responsibility Model",
      "AWS responsibility",
      "Customer responsibility",
      "How responsibility shifts",
      "Shared controls",
      "Inherited controls",
      "Customer specific controls",
      "EC2 responsibility",
      "Managed service responsibility",
      "Serverless responsibility",
      "Storage responsibility",
      "Encryption responsibility",
      "Data responsibility",
      "Compliance shared responsibility",
    ],
  },
  {
    id: "2.2",
    domain: 2,
    title:
      "Understand AWS Cloud security, governance, and compliance concepts.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["detect-investigate-respond", "data-protection-kms-acm"],
    topics: [
      "AWS compliance programs",
      "AWS Artifact",
      "AWS Config",
      "AWS CloudTrail",
      "AWS Control Tower",
      "AWS Organizations",
      "Organizational units",
      "Service control policies",
      "AWS Security Hub",
      "Amazon GuardDuty",
      "Amazon Inspector",
      "Amazon Macie",
      "Amazon Detective",
      "Defense in depth",
      "Encryption at rest",
      "Encryption in transit",
      "AWS KMS",
    ],
  },
  {
    id: "2.3",
    domain: 2,
    title: "Identify AWS access management capabilities.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["iam-fundamentals"],
    topics: [
      "IAM users",
      "IAM user groups",
      "IAM roles",
      "IAM best practices",
      "IAM policy structure",
      "IAM policy types",
      "IAM policy evaluation",
      "IAM Identity Center",
      "AWS account root user",
      "Multi-factor authentication",
      "Least privilege",
      "Federation",
      "Temporary credentials",
      "Access keys",
      "Password policy",
      "Role versus user",
    ],
  },
  {
    id: "2.4",
    domain: 2,
    title: "Identify components and resources for security.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["network-and-app-protection", "data-protection-kms-acm"],
    topics: [
      "Security groups",
      "Network ACLs",
      "Security groups vs network ACLs",
      "AWS WAF",
      "AWS Shield",
      "AWS Shield Advanced",
      "AWS Network Firewall",
      "AWS Firewall Manager",
      "AWS Certificate Manager",
      "AWS Secrets Manager",
      "AWS CloudHSM",
      "AWS KMS key types",
      "Encryption at rest vs in transit",
      "Network traffic protection",
    ],
  },

  // ---- Domain 3: Cloud Technology and Services (34%) ----
  {
    id: "3.1",
    domain: 3,
    title: "Define methods of deploying and operating in the AWS Cloud.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["serverless-and-containers", "ec2-fundamentals"],
    topics: [
      "Ways to access AWS",
      "Infrastructure as code",
      "AWS Elastic Beanstalk",
      "Hybrid connectivity",
      "AWS Outposts",
      "Match service to use case",
    ],
  },
  {
    id: "3.2",
    domain: 3,
    title: "Define the AWS global infrastructure.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["global-infrastructure-and-resilience"],
    // Like 1.3, the bank tags the Region / Availability Zone / edge-location
    // questions under Domain 1, while the guide places global infrastructure under
    // Domain 3. 3.2's Domain-3 question coverage is therefore the global-
    // infrastructure SERVICE topics the bank does tag in Domain 3: the edge
    // network (CloudFront, Global Accelerator) and the infrastructure-extending
    // services (Outposts, Snow Family). The lesson side points at the dedicated
    // global-infrastructure lesson.
    topics: [
      "Amazon CloudFront",
      "AWS Global Accelerator",
      "Content delivery and acceleration",
      "AWS Outposts",
      "AWS Snow Family",
    ],
  },
  {
    id: "3.3",
    domain: 3,
    title: "Identify AWS compute services.",
    reference: EXAM_GUIDE,
    lessonSlugs: [
      "ec2-fundamentals",
      "serverless-and-containers",
      "scaling-and-load-balancing",
    ],
    topics: [
      "EC2 fundamentals",
      "Instance families",
      "Instance lifecycle",
      "AWS Lambda",
      "AWS Fargate",
      "Amazon ECS",
      "Amazon EKS",
      "AWS Batch",
      "Amazon Lightsail",
      "Serverless compute",
      "Compute service selection",
      "Tenancy",
    ],
  },
  {
    id: "3.4",
    domain: 3,
    title: "Identify AWS database services.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["databases-on-aws"],
    topics: [
      "Amazon RDS engines",
      "Amazon Aurora",
      "Amazon DynamoDB",
      "Amazon ElastiCache",
      "Amazon Neptune",
      "Amazon DocumentDB",
      "Relational vs NoSQL",
      "Database selection",
      "Purpose-built databases",
      "Managed databases",
    ],
  },
  {
    id: "3.5",
    domain: 3,
    title: "Identify AWS network services.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["vpc-networking"],
    topics: [
      "Amazon VPC fundamentals",
      "Subnets",
      "Public and private subnets",
      "Internet gateway",
      "NAT gateway",
      "Route tables",
      "Amazon Route 53",
      "Route 53 routing policies",
      "AWS Direct Connect",
      "AWS Global Accelerator",
      "AWS PrivateLink and VPC endpoints",
      "Networking service selection",
    ],
  },
  {
    id: "3.6",
    domain: 3,
    title: "Identify AWS storage services.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["storage-on-aws"],
    topics: [
      "Amazon S3 fundamentals",
      "S3 storage classes",
      "S3 Lifecycle",
      "Amazon EBS",
      "Amazon EFS",
      "Amazon FSx file systems",
      "AWS Storage Gateway",
      "AWS Snow Family",
      "Storage types",
      "Database vs file vs object",
    ],
  },
  {
    id: "3.7",
    domain: 3,
    title:
      "Identify AWS artificial intelligence and machine learning (AI/ML) services and analytics services.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["ai-ml-and-analytics"],
    topics: [
      "Machine learning platform",
      "Image and video analysis",
      "Natural language processing",
      "Conversational interfaces",
      "Speech to text",
      "Text to speech",
      "Machine translation",
      "Generative AI assistant",
      "Generative AI foundation models",
      "Data warehouse",
      "Real-time streaming",
      "Business intelligence",
      "Analytics services to use cases",
    ],
  },
  {
    id: "3.8",
    domain: 3,
    title: "Identify services from other in-scope AWS service categories.",
    reference: EXAM_GUIDE,
    lessonSlugs: [
      "messaging-and-integration",
      "monitoring-cloudwatch-cloudtrail",
    ],
    topics: [
      "Amazon SQS",
      "Amazon SNS",
      "Amazon EventBridge",
      "AWS Step Functions",
      "Application integration",
      "Amazon CloudWatch",
      "AWS X-Ray",
      "AWS Health Dashboard",
      "CloudWatch vs CloudTrail",
    ],
  },

  // ---- Domain 4: Billing, Pricing, and Support (12%) ----
  {
    id: "4.1",
    domain: 4,
    title: "Compare AWS pricing models.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["pricing-models"],
    topics: [
      "EC2 purchase options",
      "EC2 pricing models",
      "Reserved Instance payment options",
      "Savings Plans",
      "Pricing fundamentals",
      "Service pricing models",
      "Data transfer pricing",
      "Volume discounts",
      "Choosing a purchase option",
    ],
  },
  {
    id: "4.2",
    domain: 4,
    title: "Understand resources for billing, budget, and cost management.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["cost-management-tools"],
    topics: [
      "AWS Budgets",
      "AWS Cost Explorer",
      "Cost and Usage Report",
      "AWS Free Tier",
      "Consolidated Billing",
      "Cost allocation tags",
      "Billing and Cost Management console",
      "AWS Trusted Advisor",
      "Cost estimation",
      "Cost tools comparison",
    ],
  },
  {
    id: "4.3",
    domain: 4,
    title: "Identify AWS technical resources and AWS Support options.",
    reference: EXAM_GUIDE,
    lessonSlugs: ["support-plans"],
    topics: [
      "AWS Support plans",
      "Support case severity",
      "AWS re:Post",
      "AWS Marketplace",
      "AWS Partner Network",
      "AWS resources and help",
      "AWS Well-Architected Tool",
    ],
  },
];
