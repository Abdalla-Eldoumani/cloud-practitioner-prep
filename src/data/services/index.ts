import type { ServiceEntry } from "../../lib/types";
import { analytics } from "./analytics";
import { applicationIntegration } from "./application-integration";
import { businessApplications } from "./business-applications";
import { cloudFinancialManagement } from "./cloud-financial-management";
import { compute } from "./compute";
import { containers } from "./containers";
import { customerEnablement } from "./customer-enablement";
import { database } from "./database";
import { developerTools } from "./developer-tools";
import { endUserComputing } from "./end-user-computing";
import { frontendWebMobile } from "./frontend-web-mobile";
import { iot } from "./iot";
import { machineLearning } from "./machine-learning";
import { managementGovernance } from "./management-governance";
import { migrationTransfer } from "./migration-transfer";
import { networking } from "./networking";
import { securityIdentityCompliance } from "./security-identity-compliance";
import { serverless } from "./serverless";
import { storage } from "./storage";

// The full catalog. Add entries to the per-category files; they flow through
// here. Mirrors src/data/questions/index.ts: one import per category file,
// concatenated, with an id lookup. Order is by AWS category name.
export const ALL_SERVICES: ServiceEntry[] = [
  ...analytics,
  ...applicationIntegration,
  ...businessApplications,
  ...cloudFinancialManagement,
  ...compute,
  ...containers,
  ...customerEnablement,
  ...database,
  ...developerTools,
  ...endUserComputing,
  ...frontendWebMobile,
  ...iot,
  ...machineLearning,
  ...managementGovernance,
  ...migrationTransfer,
  ...networking,
  ...securityIdentityCompliance,
  ...serverless,
  ...storage,
];

const byId = new Map(ALL_SERVICES.map((s) => [s.id, s]));

// The catalog entry with this id, or undefined. The id is the stable slug used
// as the anchor target and the join key for `services[]` references elsewhere.
export function serviceById(id: string): ServiceEntry | undefined {
  return byId.get(id);
}
