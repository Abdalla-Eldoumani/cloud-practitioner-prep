import type { ServiceEntry } from "../../lib/types";

// AWS category: Cloud Financial Management. In-scope set: AWS Budgets, AWS Cost
// and Usage Reports, AWS Cost Explorer, AWS Marketplace. All tagged D4 (Billing,
// Pricing, and Support). Authored against the official in-scope appendix; each
// entry carries a sourced reference and a lastVerified date. Expected ids: see
// expected-manifest.ts.
export const cloudFinancialManagement: ServiceEntry[] = [
  {
    id: "aws-budgets",
    name: "AWS Budgets",
    shortName: "Budgets",
    domain: 4,
    category: "Cloud Financial Management",
    purpose:
      "A service that lets you set custom budgets for cost and usage and alerts you when your spending or usage exceeds, or is forecast to exceed, the amounts you set.",
    whenToUse:
      "Reach for it when you want to be notified before a bill grows beyond a threshold, so a runaway cost is caught early instead of at the end of the month.",
    reference: {
      label: "What is AWS Budgets?",
      url: "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Budgets",
      "cost alerts",
      "budget alerts",
      "spending limits",
    ],
    relatedTerms: ["budget", "cost alerts", "thresholds", "notifications"],
  },
  {
    id: "aws-cost-and-usage-report",
    name: "AWS Cost and Usage Reports",
    shortName: "CUR",
    domain: 4,
    category: "Cloud Financial Management",
    purpose:
      "A service that publishes the most detailed cost and usage data available, breaking your AWS charges down line by line for analysis.",
    whenToUse:
      "Reach for it when summary tools are not granular enough and you need the full, itemized billing data to analyze in depth or load into your own tools.",
    reference: {
      label: "What are AWS Cost and Usage Reports?",
      url: "https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "CUR",
      "Cost and Usage Report",
      "detailed billing data",
      "itemized billing",
    ],
    relatedTerms: ["billing data", "usage", "detailed", "line items"],
  },
  {
    id: "aws-cost-explorer",
    name: "AWS Cost Explorer",
    shortName: "Cost Explorer",
    domain: 4,
    category: "Cloud Financial Management",
    purpose:
      "A service with an interface for visualizing, understanding, and analyzing your AWS costs and usage over time.",
    whenToUse:
      "Reach for it when you want to explore where your spending is going, spot trends, and view forecasts through charts rather than raw billing files.",
    reference: {
      label: "Analyzing your costs and usage with AWS Cost Explorer",
      url: "https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Cost Explorer",
      "cost analysis",
      "cost visualization",
      "spending trends",
    ],
    relatedTerms: ["cost analysis", "trends", "forecasting", "visualization"],
  },
  {
    id: "aws-marketplace",
    name: "AWS Marketplace",
    shortName: "Marketplace",
    domain: 4,
    category: "Cloud Financial Management",
    purpose:
      "A curated digital catalog where you can find, buy, deploy, and manage third-party software and services that run on AWS.",
    whenToUse:
      "Reach for it when you want to procure ready-made software from independent vendors with billing handled through your AWS account instead of a separate purchase.",
    reference: {
      label: "What is AWS Marketplace?",
      url: "https://docs.aws.amazon.com/marketplace/latest/buyerguide/what-is-marketplace.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Marketplace",
      "third-party software",
      "software catalog",
      "procurement",
    ],
    relatedTerms: ["software", "third-party", "catalog", "procurement"],
  },
];
