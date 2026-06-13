import type { Question } from "../../lib/types";
import { domain1 } from "./domain-1-cloud-concepts";
import { domain2 } from "./domain-2-security-compliance";
import { domain3 } from "./domain-3-technology-services";
import { domain4 } from "./domain-4-billing-pricing-support";

// The full pool. Add questions to the per-domain files; they flow through here.
export const ALL_QUESTIONS: Question[] = [
  ...domain1,
  ...domain2,
  ...domain3,
  ...domain4,
];

export function questionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}
