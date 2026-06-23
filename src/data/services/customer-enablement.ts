import type { ServiceEntry } from "../../lib/types";

// AWS category: Customer Enablement. In-scope set: AWS Support (tagged D4,
// Billing, Pricing, and Support). The entry describes what AWS Support is; the
// specific support plan tiers and their features are taught in the question bank,
// so this entry stays at the level of the offering itself. Authored against the
// official in-scope appendix; the entry carries a sourced reference and a
// lastVerified date. Expected ids: see expected-manifest.ts.
export const customerEnablement: ServiceEntry[] = [
  {
    id: "aws-support",
    name: "AWS Support",
    shortName: "Support",
    domain: 4,
    category: "Customer Enablement",
    purpose:
      "A range of support plans that give you access to tools, guidance, and technical help from AWS, with the level of help scaling up across the plan tiers.",
    whenToUse:
      "Reach for it when you need official help with your AWS account, from billing questions on the basic plan to faster response times and technical guidance on the higher plans.",
    reference: {
      label: "AWS Support",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/getting-started.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Support",
      "support plans",
      "technical support",
      "support tiers",
    ],
    relatedTerms: ["support", "plans", "technical help", "guidance"],
  },
];
