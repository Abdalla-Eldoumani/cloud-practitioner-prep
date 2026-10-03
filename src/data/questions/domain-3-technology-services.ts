import type { Question } from "../../lib/types";

// Domain 3: Cloud Technology and Services. Original practice questions,
// including the cloud deployment models (cloud, hybrid, and on-premises),
// which the exam guide files under Domain 3 rather than Domain 1. These are
// not real exam items. Every fact is verified against current AWS
// documentation; each question cites the page that backs its answer.
//
// Ids keep their historical d1-concepts- prefixes deliberately: an id is a
// stable key in a learner's saved progress, so it survives a move between files
// and stays put when a question is retagged to another domain.
export const domain3: Question[] = [
  {
    id: "d3-lambda-01",
    domain: 3,
    type: "single",
    topic: "Serverless compute",
    difficulty: "medium",
    stem: "A team needs to run small pieces of code in response to events, such as a file landing in Amazon S3, without provisioning or managing any servers, and pay only while the code runs. Which service fits best?",
    options: [
      { id: "a", text: "AWS Lambda" },
      { id: "b", text: "Amazon EC2" },
      { id: "c", text: "AWS Elastic Beanstalk" },
      { id: "d", text: "Amazon ECS on EC2" },
    ],
    correct: ["a"],
    explanation:
      "Lambda runs event-driven code with no servers to manage and bills per request and compute time. Amazon EC2 is a virtual server you provision and manage, Amazon ECS on EC2 still leaves the instances for you to run, and Elastic Beanstalk provisions and exposes underlying EC2 resources rather than hiding the servers.",
    reference: {
      label: "AWS Lambda",
      url: "https://aws.amazon.com/lambda/",
    },
    lastVerified: "2026-07-29",
    services: ["Lambda", "S3"],
  },
  {
    id: "d3-rds-01",
    domain: 3,
    type: "single",
    topic: "Managed databases",
    difficulty: "medium",
    stem: "A company wants a managed relational database that handles automated backups, patching, and Multi-AZ failover while it keeps using standard SQL. Which service should it choose?",
    options: [
      { id: "a", text: "Amazon DynamoDB" },
      { id: "b", text: "Amazon RDS" },
      { id: "c", text: "Amazon Athena" },
      { id: "d", text: "Amazon Redshift" },
    ],
    correct: ["b"],
    explanation:
      "Amazon RDS is a managed relational database that automates backups, patching, and Multi-AZ failover. DynamoDB is NoSQL, Athena queries data in S3 with SQL but is not a database engine, and Redshift is a data warehouse for analytics.",
    reference: {
      label: "Amazon RDS",
      url: "https://aws.amazon.com/rds/",
    },
    lastVerified: "2026-07-29",
    services: ["RDS"],
  },
  {
    id: "d3-sqs-01",
    domain: 3,
    type: "single",
    topic: "Application integration",
    difficulty: "medium",
    stem: "An application's front end produces work faster than the back end can process it during spikes. The team wants to decouple the tiers with a durable buffer that stores messages until the back end pulls them. Which service is designed for this?",
    options: [
      { id: "a", text: "Amazon SNS" },
      { id: "b", text: "Amazon SQS" },
      { id: "c", text: "Amazon CloudFront" },
      { id: "d", text: "Elastic Load Balancing" },
    ],
    correct: ["b"],
    explanation:
      "Amazon SQS is a durable message queue: producers send messages and consumers pull them when ready, which absorbs spikes and decouples tiers. Amazon SNS is publish/subscribe push that fans messages out to subscribers rather than holding them for a consumer to poll, CloudFront is a CDN, and a load balancer distributes requests but does not store them.",
    reference: {
      label: "Amazon SQS",
      url: "https://aws.amazon.com/sqs/",
    },
    lastVerified: "2026-07-29",
    services: ["SQS"],
  },
  {
    id: "d1-concepts-06",
    domain: 3,
    type: "single",
    topic: "Cloud deployment models",
    difficulty: "easy",
    stem: "A startup builds its entire application on AWS, with every component running on cloud services and nothing in a company data center. Which deployment model does this describe?",
    options: [
      { id: "a", text: "Cloud-based" },
      { id: "b", text: "Hybrid" },
      { id: "c", text: "On-premises (private cloud)" },
      { id: "d", text: "Colocation only" },
    ],
    correct: ["a"],
    explanation:
      "AWS describes a cloud-based application as one that is fully deployed in the cloud, with all parts of the application running in the cloud. Hybrid connects cloud and non-cloud resources, on-premises runs in your own data center, and colocation is not one of the AWS deployment models.",
    reference: {
      label: "Types of cloud computing: deployment models",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-concepts-07",
    domain: 3,
    type: "single",
    topic: "Cloud deployment models",
    difficulty: "medium",
    stem: "A bank keeps a legacy mainframe application in its own data center for regulatory reasons but connects it to new analytics services running on AWS. Which deployment model describes this arrangement?",
    options: [
      { id: "a", text: "Hybrid" },
      { id: "b", text: "Cloud (fully deployed in the cloud)" },
      { id: "c", text: "On-premises (private cloud)" },
      { id: "d", text: "Public-only" },
    ],
    correct: ["a"],
    explanation:
      "AWS describes a hybrid deployment as connecting infrastructure and applications between cloud-based resources and existing resources that are not in the cloud, most commonly between the cloud and on-premises infrastructure. A fully-cloud or fully-on-premises model would not span both, and public-only is not an AWS deployment model.",
    reference: {
      label: "Types of cloud computing: deployment models",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-concepts-08",
    domain: 3,
    type: "single",
    topic: "Cloud deployment models",
    difficulty: "medium",
    stem: "An organization runs all of its workloads in its own data center, using virtualization and resource management tools to raise utilization, with no public cloud involved. AWS sometimes calls this model by which name?",
    options: [
      { id: "a", text: "Private cloud (on-premises)" },
      { id: "b", text: "Hybrid cloud" },
      { id: "c", text: "Fully cloud-based deployment" },
      { id: "d", text: "Serverless deployment" },
    ],
    correct: ["a"],
    explanation:
      "AWS calls the deployment of resources on-premises using virtualization and resource management tools the private cloud, and notes it is in most cases the same as legacy IT infrastructure. Hybrid spans cloud and non-cloud, a cloud-based deployment runs in the cloud, and serverless is an operating model rather than a deployment location.",
    reference: {
      label: "Types of cloud computing: deployment models",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-concepts-09",
    domain: 3,
    type: "single",
    topic: "Cloud deployment models",
    difficulty: "hard",
    stem: "A company is migrating to AWS over two years. During the transition it must keep some applications running in its existing data center while moving others to the cloud, with the two environments connected. Which deployment model best supports this migration period?",
    options: [
      { id: "a", text: "Hybrid, which extends existing infrastructure into the cloud." },
      { id: "b", text: "On-premises only, keeping everything in the data center until the very end." },
      { id: "c", text: "Cloud only, requiring every workload to move on day one." },
      { id: "d", text: "Spot, which schedules workloads on spare capacity." },
    ],
    correct: ["a"],
    explanation:
      "AWS describes hybrid as the way to extend and grow an organization's infrastructure into the cloud while connecting cloud resources to internal systems, which fits a phased migration. Staying fully on-premises until the end, or a cloud-only model requiring every workload to move on day one, does not match a gradual transition, and Spot is an EC2 pricing model, not a deployment model.",
    reference: {
      label: "Types of cloud computing: deployment models",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-concepts-10",
    domain: 3,
    type: "single",
    topic: "Cloud deployment models",
    difficulty: "medium",
    stem: "According to AWS, which statement about the on-premises (private cloud) deployment model is accurate?",
    options: [
      { id: "a", text: "It lacks many cloud benefits but is sometimes chosen for dedicated resources." },
      { id: "b", text: "It delivers every benefit of cloud computing automatically with no tradeoffs." },
      { id: "c", text: "It runs entirely on AWS-managed hardware with no equipment in your data center." },
      { id: "d", text: "It is the only model AWS supports for new applications." },
    ],
    correct: ["a"],
    explanation:
      "AWS states that on-premises deployment does not provide many of the benefits of cloud computing but is sometimes sought for its ability to provide dedicated resources. It does not automatically deliver all cloud benefits, it runs on your own infrastructure rather than AWS-managed hardware, and it is not the only model AWS supports.",
    reference: {
      label: "Types of cloud computing: deployment models",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-concepts-11",
    domain: 3,
    type: "multi",
    topic: "Cloud deployment models",
    difficulty: "medium",
    stem: "AWS describes several cloud computing deployment models. Which TWO of the following are AWS deployment models? (Choose two.)",
    options: [
      { id: "a", text: "Cloud" },
      { id: "b", text: "Hybrid" },
      { id: "c", text: "Pay-as-you-go" },
      { id: "d", text: "Reserved" },
      { id: "e", text: "Elastic" },
    ],
    correct: ["a", "b"],
    distractorRationales: {
      c: "Pay-as-you-go is how AWS bills for consumption, not one of the cloud, hybrid, or on-premises deployment models.",
      d: "Reserved is an EC2 purchase option for committed capacity, not a deployment model.",
      e: "Elastic describes scaling capacity with demand, not where an application is deployed.",
    },
    explanation:
      "AWS names cloud, hybrid, and on-premises (private cloud) as deployment models, so cloud and hybrid are both correct. Pay-as-you-go is a pricing approach, reserved is a purchase option, and elastic describes scaling, none of which is a deployment model.",
    reference: {
      label: "Types of cloud computing: deployment models",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-concepts-12",
    domain: 3,
    type: "multi",
    topic: "Cloud deployment models",
    difficulty: "hard",
    stem: "A retailer is deciding how to deploy. Which TWO scenarios are the strongest fit for a hybrid deployment? (Choose two.)",
    options: [
      { id: "a", text: "A workload that keeps sensitive data on existing on-premises servers while processing in the cloud." },
      { id: "b", text: "An organization mid-migration that needs its data center and the cloud connected while it gradually moves workloads." },
      { id: "c", text: "A brand-new application with no existing infrastructure that the team wants to build entirely on cloud services." },
      { id: "d", text: "A workload that must run completely offline with no connection to any external network." },
      { id: "e", text: "A static marketing site with no servers of any kind." },
    ],
    correct: ["a", "b"],
    explanation:
      "Hybrid connects cloud resources with existing non-cloud resources, so keeping sensitive data on-premises while processing in the cloud, and bridging a data center and the cloud during a migration, both fit. A greenfield app with no existing infrastructure suits a fully cloud deployment, a fully offline workload connects to nothing, and a serverless static site needs no hybrid link.",
    reference: {
      label: "Types of cloud computing: deployment models",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-concepts-13",
    domain: 3,
    type: "single",
    topic: "Cloud deployment models",
    difficulty: "easy",
    stem: "A team with no existing servers wants the fastest path to launch a new product and plans to use only managed cloud services. Which deployment model fits this greenfield project best?",
    options: [
      { id: "a", text: "Cloud (fully deployed in the cloud)" },
      { id: "b", text: "On-premises (private cloud)" },
      { id: "c", text: "Hybrid" },
      { id: "d", text: "A mix of on-premises tape backup and mainframe" },
    ],
    correct: ["a"],
    explanation:
      "A cloud-based deployment runs all parts of the application in the cloud and suits a new project with no existing infrastructure that wants to use managed services. On-premises and the mainframe option require owning hardware, and hybrid is for connecting the cloud to existing non-cloud resources, which this team does not have.",
    reference: {
      label: "Types of cloud computing: deployment models",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-concepts-30",
    domain: 3,
    type: "multi",
    topic: "Cloud deployment models",
    difficulty: "hard",
    stem: "A hospital is choosing between deployment models. Which TWO statements about the on-premises (private cloud) model, in AWS terms, are correct? (Choose two.)",
    options: [
      { id: "a", text: "It deploys resources on-premises with virtualization and resource management tools." },
      { id: "b", text: "It can provide dedicated resources but does not deliver many of the benefits of cloud computing." },
      { id: "c", text: "It runs every part of the application on AWS-managed services in the cloud." },
      { id: "d", text: "It is the same as a hybrid deployment connecting the cloud with non-cloud resources." },
      { id: "e", text: "It is a per-second compute billing model rather than a deployment location." },
    ],
    correct: ["a", "b"],
    explanation:
      "AWS describes the on-premises (private cloud) model as deploying resources on-premises with virtualization and resource management tools, providing dedicated resources but not many of the benefits of cloud computing, so both of those are correct. A cloud deployment runs in the cloud, hybrid spans both environments, and per-second billing is a pricing model rather than a deployment model.",
    reference: {
      label: "Types of cloud computing: deployment models",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html",
    },
    lastVerified: "2026-10-03",
  },
];
