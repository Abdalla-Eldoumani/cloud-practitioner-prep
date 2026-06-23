import type { Question } from "../../lib/types";

// Domain 3: Cloud Technology and Services. Original practice questions.
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
      "Lambda runs event-driven code with no servers to manage and bills per request and compute time. EC2 and ECS on EC2 require managing instances, and Elastic Beanstalk provisions and exposes underlying EC2 resources.",
    reference: {
      label: "AWS Lambda",
      url: "https://aws.amazon.com/lambda/",
    },
    lastVerified: "2026-06-23",
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
    lastVerified: "2026-06-23",
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
      "Amazon SQS is a durable message queue: producers send messages and consumers pull them when ready, which absorbs spikes and decouples tiers. SNS is publish/subscribe push, CloudFront is a CDN, and a load balancer distributes requests but does not store them.",
    reference: {
      label: "Amazon SQS",
      url: "https://aws.amazon.com/sqs/",
    },
    lastVerified: "2026-06-23",
    services: ["SQS"],
  },
];
