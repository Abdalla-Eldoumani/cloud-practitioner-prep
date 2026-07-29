import type { ServiceEntry } from "../../lib/types";

// AWS category: Frontend Web and Mobile. In-scope set: AWS Amplify, AWS AppSync.
// Authored against the official in-scope appendix; each entry carries a sourced
// reference and a lastVerified date. Expected ids: see expected-manifest.ts.
export const frontendWebMobile: ServiceEntry[] = [
  {
    id: "aws-amplify",
    name: "AWS Amplify",
    shortName: "Amplify",
    domain: 3,
    category: "Frontend Web and Mobile",
    purpose:
      "A set of tools and services for building, deploying, and hosting full-stack web and mobile applications.",
    whenToUse:
      "Reach for it when you want to build and ship a web or mobile front end with backend features like auth and data, and host it, without assembling each piece separately.",
    reference: {
      label: "Welcome to AWS Amplify Hosting",
      url: "https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "Amplify",
      "full-stack",
      "web hosting",
      "mobile backend",
    ],
    relatedTerms: ["full-stack", "front end", "hosting", "mobile"],
  },
  {
    id: "aws-appsync",
    name: "AWS AppSync",
    shortName: "AppSync",
    domain: 3,
    category: "Frontend Web and Mobile",
    purpose:
      "A managed service that creates serverless GraphQL and real-time APIs to connect applications to data and events.",
    whenToUse:
      "Reach for it when your app needs a single GraphQL API over several data sources and real-time updates pushed to clients over a WebSocket connection the service manages for you.",
    reference: {
      label: "What is AWS AppSync?",
      url: "https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "AppSync",
      "GraphQL",
      "GraphQL API",
      "real-time API",
    ],
    relatedTerms: ["GraphQL", "API", "real-time", "data sources"],
  },
];
