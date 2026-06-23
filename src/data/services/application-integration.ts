import type { ServiceEntry } from "../../lib/types";

// AWS category: Application Integration. In-scope set: Amazon EventBridge, Amazon
// SNS, Amazon SQS, AWS Step Functions. Authored against the official in-scope
// appendix; each entry carries a sourced reference and a lastVerified date.
// SQS, SNS, and EventBridge cross-reference each other as the messaging and
// integration trio. Expected ids: see expected-manifest.ts.
export const applicationIntegration: ServiceEntry[] = [
  {
    id: "amazon-eventbridge",
    name: "Amazon EventBridge",
    shortName: "EventBridge",
    domain: 3,
    category: "Application Integration",
    purpose:
      "A serverless event bus that routes events from your applications, AWS services, and third-party sources to targets using rules.",
    whenToUse:
      "Reach for it when you want to connect applications with events and route each event to the right target based on rules, without writing the plumbing.",
    reference: {
      label: "What is Amazon EventBridge?",
      url: "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "EventBridge",
      "event bus",
      "event router",
      "event-driven",
    ],
    relatedTerms: ["event bus", "events", "event-driven", "routing rules"],
    relatedServices: ["amazon-sns", "amazon-sqs"],
  },
  {
    id: "amazon-sns",
    name: "Amazon SNS",
    shortName: "SNS",
    domain: 3,
    category: "Application Integration",
    purpose:
      "A fully managed publish/subscribe messaging service for sending messages to many subscribers, applications, and endpoints at once.",
    whenToUse:
      "Reach for it when one event should fan out to many receivers at the same time, such as notifying several systems, email addresses, or queues.",
    reference: {
      label: "What is Amazon SNS?",
      url: "https://docs.aws.amazon.com/sns/latest/dg/welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "SNS",
      "Simple Notification Service",
      "pub/sub",
      "publish subscribe",
      "notifications",
    ],
    relatedTerms: ["pub/sub", "notifications", "fan-out", "topics"],
    relatedServices: ["amazon-sqs", "amazon-eventbridge"],
  },
  {
    id: "amazon-sqs",
    name: "Amazon SQS",
    shortName: "SQS",
    domain: 3,
    category: "Application Integration",
    purpose:
      "A fully managed message queuing service that lets application components send, store, and receive messages so they can work independently.",
    whenToUse:
      "Reach for it when you want to decouple parts of an application, buffering work in a queue so a sender and a receiver do not have to run at the same pace.",
    reference: {
      label: "What is Amazon SQS?",
      url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "SQS",
      "Simple Queue Service",
      "message queue",
      "queue",
    ],
    relatedTerms: ["message queue", "decoupling", "buffer", "asynchronous"],
    relatedServices: ["amazon-sns", "amazon-eventbridge"],
  },
  {
    id: "aws-step-functions",
    name: "AWS Step Functions",
    shortName: "Step Functions",
    domain: 3,
    category: "Application Integration",
    purpose:
      "A serverless orchestration service that coordinates multiple AWS services into workflows defined as a series of steps.",
    whenToUse:
      "Reach for it when you need to coordinate several steps or services in order, with branching, retries, and error handling managed for you.",
    reference: {
      label: "What is AWS Step Functions?",
      url: "https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Step Functions",
      "workflow",
      "orchestration",
      "state machine",
    ],
    relatedTerms: ["workflow", "orchestration", "state machine", "steps"],
  },
];
