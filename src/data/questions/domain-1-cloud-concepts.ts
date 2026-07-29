import type { Question } from "../../lib/types";

// Domain 1: Cloud Concepts. Original practice questions written to test the
// concepts in the exam guide. These are not real exam items.
export const domain1: Question[] = [
  {
    id: "d1-elasticity-01",
    domain: 1,
    type: "single",
    topic: "Elasticity and scaling",
    difficulty: "easy",
    stem: "An online store sees heavy traffic for a few weeks around the holidays and very light traffic the rest of the year. Which AWS Cloud benefit lets it add capacity for the rush and remove it afterward so it pays only for what it uses?",
    options: [
      { id: "a", text: "Elasticity" },
      { id: "b", text: "High durability" },
      { id: "c", text: "Fault tolerance" },
      { id: "d", text: "Data residency" },
    ],
    correct: ["a"],
    explanation:
      "Elasticity is the ability to add and remove resources to match demand, so the store scales out for the holidays and scales back in afterward. Durability and fault tolerance describe resilience, not matching spend to demand; data residency is about where data is stored.",
    reference: {
      label: "Cloud computing benefits - elasticity",
      url: "https://aws.amazon.com/what-is-cloud-computing/",
    },
    lastVerified: "2026-07-29",
    services: ["EC2 Auto Scaling"],
  },
  {
    id: "d1-capex-opex-01",
    domain: 1,
    type: "single",
    topic: "Cloud economics",
    difficulty: "easy",
    stem: "Which statement best describes a financial benefit of moving from an on-premises data center to the AWS Cloud?",
    options: [
      { id: "a", text: "It replaces variable operating expense with a large fixed capital expense." },
      { id: "b", text: "It trades large upfront capital expense for variable operating expense based on usage." },
      { id: "c", text: "It removes all costs because the AWS Free Tier never expires." },
      { id: "d", text: "It guarantees a flat monthly bill regardless of usage." },
    ],
    correct: ["b"],
    explanation:
      "The cloud lets you stop buying hardware upfront (capital expense) and instead pay for what you consume (operating expense). The inverse claim, that the cloud replaces variable spend with a large fixed capital expense, reverses the actual shift. The Free Tier is limited, and pay-as-you-go bills vary with usage rather than staying flat.",
    reference: {
      label: "Six advantages of cloud computing",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/six-advantages-of-cloud-computing.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-benefits-multi-01",
    domain: 1,
    type: "multi",
    topic: "Benefits of the AWS Cloud",
    difficulty: "medium",
    stem: "Which TWO outcomes are direct benefits of adopting the AWS Cloud as described by AWS? (Choose two.)",
    options: [
      { id: "a", text: "You can deploy to Regions near your users within minutes to reduce latency." },
      { id: "b", text: "You eliminate the need to secure your own applications and data." },
      { id: "c", text: "You stop spending money to run and maintain your own data centers." },
      { id: "d", text: "You are guaranteed that every service is available in every Region." },
      { id: "e", text: "You remove the need to monitor or right-size any resources." },
    ],
    correct: ["a", "c"],
    explanation:
      "Going global in minutes and getting out of the data center business are stated AWS benefits. The cloud does not eliminate the need to secure your own applications and data, since customers still own that security under the shared responsibility model; services roll out to Regions over time rather than all being everywhere, and right-sizing and monitoring remain the customer's job.",
    reference: {
      label: "Six advantages of cloud computing",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/six-advantages-of-cloud-computing.html",
    },
    lastVerified: "2026-07-29",
  },
];
