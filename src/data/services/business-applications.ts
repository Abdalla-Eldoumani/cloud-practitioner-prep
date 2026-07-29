import type { ServiceEntry } from "../../lib/types";

// AWS category: Business Applications. In-scope set: Amazon Connect, Amazon SES.
// Authored against the official in-scope appendix; each entry carries a sourced
// reference and a lastVerified date. Expected ids: see expected-manifest.ts.
export const businessApplications: ServiceEntry[] = [
  {
    id: "amazon-connect",
    name: "Amazon Connect",
    shortName: "Connect",
    domain: 3,
    category: "Business Applications",
    purpose:
      "A cloud-based contact center service for setting up and running customer support by voice and chat.",
    whenToUse:
      "Reach for it when you need to run a customer contact center in the cloud and want to add agents and phone or chat support without on-premises hardware.",
    reference: {
      label: "What is Connect Customer?",
      url: "https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "Connect",
      "Amazon Connect Customer",
      "Connect Customer",
      "contact center",
      "call center",
      "customer support",
    ],
    relatedTerms: ["contact center", "call center", "voice", "chat"],
  },
  {
    id: "amazon-ses",
    name: "Amazon SES",
    shortName: "SES",
    domain: 3,
    category: "Business Applications",
    purpose:
      "A cloud email service for sending and receiving email, used for marketing, notifications, and transactional messages.",
    whenToUse:
      "Reach for it when an application needs to send bulk or transactional email, such as receipts or alerts, at scale without running a mail server.",
    reference: {
      label: "What is Amazon SES?",
      url: "https://docs.aws.amazon.com/ses/latest/dg/Welcome.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "SES",
      "Simple Email Service",
      "email",
      "email sending",
    ],
    relatedTerms: ["email", "transactional email", "bulk email", "notifications"],
  },
];
