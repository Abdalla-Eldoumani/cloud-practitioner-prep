import type { Question } from "../../lib/types";
import { domain1 } from "./domain-1-cloud-concepts";
import { domain2 } from "./domain-2-security-compliance";
import { domain3 } from "./domain-3-technology-services";
import { domain4 } from "./domain-4-billing-pricing-support";
import { domain4Pricing } from "./domain-4-pricing";
import { domain4CostTools } from "./domain-4-cost-tools";
import { domain4SupportMigration } from "./domain-4-support-migration";

// The full pool. Add questions to the per-domain topic files; they flow through here.
export const ALL_QUESTIONS: Question[] = [
  ...domain1,
  ...domain2,
  ...domain3,
  ...domain4,
  ...domain4Pricing,
  ...domain4CostTools,
  ...domain4SupportMigration,
];

export function questionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}
