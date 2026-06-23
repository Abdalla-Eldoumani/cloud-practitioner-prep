import type { ServiceEntry } from "../../lib/types";

// AWS category: Serverless. In-scope set: AWS Fargate, AWS Lambda. Authored
// against the official in-scope appendix; each entry carries a sourced reference
// and a lastVerified date. Expected ids: see expected-manifest.ts.
export const serverless: ServiceEntry[] = [
  {
    id: "aws-fargate",
    name: "AWS Fargate",
    shortName: "Fargate",
    domain: 3,
    category: "Serverless",
    purpose:
      "A serverless compute engine for containers that runs them without you provisioning or managing the underlying servers.",
    whenToUse:
      "Reach for it when you want to run containers on ECS or EKS but would rather not manage the EC2 instances behind them.",
    reference: {
      label: "What is AWS Fargate?",
      url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Fargate",
      "serverless containers",
      "serverless compute for containers",
    ],
    relatedTerms: ["serverless", "container", "no server management"],
    relatedServices: ["amazon-ec2", "aws-lambda"],
  },
  {
    id: "aws-lambda",
    name: "AWS Lambda",
    shortName: "Lambda",
    domain: 3,
    category: "Serverless",
    purpose:
      "A serverless compute service that runs your code in response to events and scales automatically, with no servers to manage.",
    whenToUse:
      "Reach for it when you want to run short-lived code on demand or in response to an event and pay only for the time it runs.",
    reference: {
      label: "What is AWS Lambda?",
      url: "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: ["Lambda", "functions", "serverless functions", "function as a service"],
    relatedTerms: ["serverless", "event-driven", "function", "trigger"],
    relatedServices: ["amazon-ec2", "aws-fargate"],
  },
];
