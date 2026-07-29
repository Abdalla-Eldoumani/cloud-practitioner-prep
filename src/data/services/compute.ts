import type { ServiceEntry } from "../../lib/types";

// AWS category: Compute. In-scope set: AWS Batch, Amazon EC2, AWS Elastic
// Beanstalk, Amazon Lightsail, AWS Outposts. Entries are authored against the
// official in-scope appendix; each carries a sourced reference and a
// lastVerified date. The expected id list for this category lives in
// expected-manifest.ts (the completeness guard the catalog lint asserts).
export const compute: ServiceEntry[] = [
  {
    id: "aws-batch",
    name: "AWS Batch",
    shortName: "Batch",
    domain: 3,
    category: "Compute",
    purpose:
      "A fully managed service that runs batch computing jobs by provisioning and scaling the compute behind them for you.",
    whenToUse:
      "Reach for it when you have many queued or scheduled jobs to run and want AWS to size and manage the compute instead of running a cluster yourself.",
    reference: {
      label: "What is AWS Batch?",
      url: "https://docs.aws.amazon.com/batch/latest/userguide/what-is-batch.html",
    },
    lastVerified: "2026-07-29",
    aliases: ["Batch", "batch processing", "batch jobs", "job scheduling"],
    relatedTerms: ["batch computing", "job queue", "compute environment"],
  },
  {
    id: "amazon-ec2",
    name: "Amazon EC2",
    shortName: "EC2",
    domain: 3,
    category: "Compute",
    purpose:
      "Resizable virtual servers in the cloud that you launch, size, and scale, paying for the capacity you run.",
    whenToUse:
      "Reach for it when you need full control of the operating system and a server you can configure, scale up for peak load, and scale back down.",
    reference: {
      label: "What is Amazon EC2?",
      url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "EC2",
      "Elastic Compute Cloud",
      "virtual machines",
      "virtual servers",
      "instances",
    ],
    relatedTerms: ["compute", "instance type", "Amazon Machine Image"],
    relatedServices: ["aws-lambda", "aws-fargate"],
  },
  {
    id: "aws-elastic-beanstalk",
    name: "AWS Elastic Beanstalk",
    shortName: "Elastic Beanstalk",
    domain: 3,
    category: "Compute",
    purpose:
      "A service that deploys and manages your web application by handling the provisioning, load balancing, scaling, and health monitoring for you.",
    whenToUse:
      "Reach for it when you want to upload application code and have AWS run the underlying environment without managing each piece yourself.",
    reference: {
      label: "What is AWS Elastic Beanstalk?",
      url: "https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html",
    },
    lastVerified: "2026-07-29",
    aliases: ["Elastic Beanstalk", "Beanstalk", "platform as a service", "PaaS"],
    relatedTerms: ["application deployment", "web application", "environment"],
  },
  {
    id: "amazon-lightsail",
    name: "Amazon Lightsail",
    shortName: "Lightsail",
    domain: 3,
    category: "Compute",
    purpose:
      "An easy-to-use service that bundles a virtual server, storage, and networking into preconfigured plans at a predictable price.",
    whenToUse:
      "Reach for it when you want a simple way to launch a small website or application without configuring the individual building blocks.",
    reference: {
      label: "What is Amazon Lightsail?",
      url: "https://docs.aws.amazon.com/lightsail/latest/userguide/what-is-amazon-lightsail.html",
    },
    lastVerified: "2026-07-29",
    aliases: ["Lightsail", "virtual private server", "VPS", "simple hosting"],
    relatedTerms: ["bundled plan", "predictable pricing", "small workloads"],
  },
  {
    id: "aws-outposts",
    name: "AWS Outposts",
    shortName: "Outposts",
    domain: 3,
    category: "Compute",
    purpose:
      "Fully managed AWS infrastructure and services delivered to your own data center or on-premises location as physical racks or servers that AWS owns and operates.",
    whenToUse:
      "Reach for it when a workload must stay on-premises for low latency or data residency but you still want a consistent AWS experience.",
    reference: {
      label: "What is AWS Outposts?",
      url: "https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html",
    },
    lastVerified: "2026-07-29",
    aliases: ["Outposts", "hybrid cloud", "on-premises AWS"],
    relatedTerms: [
      "hybrid",
      "data residency",
      "low latency",
      "on-premises",
      "form factor",
    ],
  },
];
