import type { Domain } from "./types";

// Source: AWS Certified Cloud Practitioner (CLF-C02) Exam Guide.
// Domain weightings and exam format verified against AWS official docs, 2026-06-12.
export interface DomainMeta {
  id: Domain;
  name: string;
  weight: number; // percent of scored content
  blurb: string;
}

export const DOMAINS: DomainMeta[] = [
  {
    id: 1,
    name: "Cloud Concepts",
    weight: 24,
    blurb:
      "The value of the AWS Cloud, the economics of moving to it, and core design principles.",
  },
  {
    id: 2,
    name: "Security and Compliance",
    weight: 30,
    blurb:
      "The shared responsibility model, access management, data protection, and compliance.",
  },
  {
    id: 3,
    name: "Cloud Technology and Services",
    weight: 34,
    blurb:
      "Core compute, storage, networking, database, and the broader AWS service catalog.",
  },
  {
    id: 4,
    name: "Billing, Pricing, and Support",
    weight: 12,
    blurb: "Pricing models, cost management tools, and AWS support and resources.",
  },
];

export function domainName(id: Domain): string {
  const meta = DOMAINS.find((d) => d.id === id);
  return meta ? meta.name : `Domain ${id}`;
}

// Minimum questions per domain. Derived proportionally from the domain weights
// (24 / 30 / 34 / 12) against a 720-question anchor, then floored. Set below the
// current bank counts so this guards against regression rather than forcing new
// authoring, and leaves headroom for the mock exam's low-overlap per-domain draw.
export const DOMAIN_QUESTION_FLOORS: Record<Domain, number> = {
  1: 173,
  2: 216,
  3: 245,
  4: 86,
};

// Real-exam format. The mock exam mirrors the question count and time limit.
export const EXAM = {
  code: "CLF-C02",
  questionCount: 65, // 50 scored + 15 unscored on the real exam
  scoredCount: 50,
  timeLimitSeconds: 90 * 60,
  // The real exam reports a scaled score (100-1000), passing at 700. That scale
  // is proprietary and is not a raw percentage, so the site reports raw percent
  // and a readiness band instead, and says so plainly.
  passingScaledScore: 700,
  retakeWaitDays: 30,
  validityYears: 3,
} as const;
