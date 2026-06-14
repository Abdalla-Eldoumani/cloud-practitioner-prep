import type { Question } from "../../lib/types";
import { domain1 } from "./domain-1-cloud-concepts";
import { domain1Concepts } from "./domain-1-concepts";
import { domain1Economics } from "./domain-1-economics";
import { domain1Elasticity } from "./domain-1-elasticity";
import { domain1Global } from "./domain-1-global";
import { domain1Resilience } from "./domain-1-resilience";
import { domain1WellArchitected } from "./domain-1-well-architected";
import { domain2 } from "./domain-2-security-compliance";
import { domain2SharedResponsibility } from "./domain-2-shared-responsibility";
import { domain2IamBasics } from "./domain-2-iam-basics";
import { domain2IamAdvanced } from "./domain-2-iam-advanced";
import { domain2Encryption } from "./domain-2-encryption";
import { domain2NetworkProtection } from "./domain-2-network-protection";
import { domain2ThreatDetection } from "./domain-2-threat-detection";
import { domain2GovernanceCompliance } from "./domain-2-governance-compliance";
import { domain3 } from "./domain-3-technology-services";
import { domain4 } from "./domain-4-billing-pricing-support";
import { domain4Pricing } from "./domain-4-pricing";
import { domain4CostTools } from "./domain-4-cost-tools";
import { domain4SupportMigration } from "./domain-4-support-migration";

// The full pool. Add questions to the per-domain topic files; they flow through here.
export const ALL_QUESTIONS: Question[] = [
  ...domain1,
  ...domain1Concepts,
  ...domain1Economics,
  ...domain1Elasticity,
  ...domain1Global,
  ...domain1Resilience,
  ...domain1WellArchitected,
  ...domain2,
  ...domain2SharedResponsibility,
  ...domain2IamBasics,
  ...domain2IamAdvanced,
  ...domain2Encryption,
  ...domain2NetworkProtection,
  ...domain2ThreatDetection,
  ...domain2GovernanceCompliance,
  ...domain3,
  ...domain4,
  ...domain4Pricing,
  ...domain4CostTools,
  ...domain4SupportMigration,
];

export function questionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}
