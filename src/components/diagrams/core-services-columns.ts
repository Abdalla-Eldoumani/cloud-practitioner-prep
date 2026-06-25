import type { KnowledgeCheckDatum } from "@/components/diagrams/KnowledgeCheck";

// The authored core-services grouping + the inline knowledge check, kept in a PURE
// module (no catalog import) so the client island can read them for its `meta`
// without bundling the service catalog. Only service IDS are authored here; the
// service NAMES and the category LABEL are resolved from the verified catalog at
// build time (see core-services-map.ts), never hand-typed and never shipped to the
// browser.

// One category column: the flagship service ids that share ONE catalog category.
export type CategoryColumn = string[];

export const CATEGORY_COLUMNS: CategoryColumn[] = [
  ["amazon-ec2"], // Compute
  ["aws-lambda", "aws-fargate"], // Serverless
  ["amazon-s3", "amazon-ebs"], // Storage
  ["amazon-rds", "amazon-dynamodb"], // Database
  ["amazon-vpc", "amazon-route-53"], // Networking and Content Delivery
];

// Every service id the map names — flat, and what arms the check:diagrams
// service-labels-resolve rule via the module's exported `meta`.
export const CORE_SERVICE_IDS = CATEGORY_COLUMNS.flat();

// One service resolved from the catalog (id + verified name + a short note).
export interface ResolvedService {
  id: string;
  name: string;
  note: string;
}

// One column resolved to its catalog-derived category label + its services.
export interface ResolvedCategory {
  category: string;
  services: ResolvedService[];
}

// The inline knowledge check the lesson embeds after the diagram. No catalog
// dependency: the option text is real service names, the explanation names option
// CONTENT (never a letter or position), single answer by id.
export const coreServicesCheck: KnowledgeCheckDatum = {
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
