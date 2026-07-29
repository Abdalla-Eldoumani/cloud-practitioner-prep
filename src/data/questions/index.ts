import type { Question } from "../../lib/types";
import { domain1 } from "./domain-1-cloud-concepts";
import { domain1Concepts } from "./domain-1-concepts";
import { domain1Economics } from "./domain-1-economics";
import { domain1Elasticity } from "./domain-1-elasticity";
import { domain1MigrationCaf } from "./domain-1-migration-caf";
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
import { domain2MonitoringAudit } from "./domain-2-monitoring-audit";
import { domain3 } from "./domain-3-technology-services";
import { domain3Ec2 } from "./domain-3-ec2";
import { domain3Global } from "./domain-3-global";
import { domain3ScalingElb } from "./domain-3-scaling-elb";
import { domain3ServerlessContainers } from "./domain-3-serverless-containers";
import { domain3Networking } from "./domain-3-networking";
import { domain3Storage } from "./domain-3-storage";
import { domain3FileDatabases } from "./domain-3-file-databases";
import { domain3IntegrationMonitoring } from "./domain-3-integration-monitoring";
import { domain3AimlAnalytics } from "./domain-3-aiml-analytics";
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
  ...domain1MigrationCaf,
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
  ...domain2MonitoringAudit,
  ...domain3,
  ...domain3Ec2,
  ...domain3Global,
  ...domain3ScalingElb,
  ...domain3ServerlessContainers,
  ...domain3Networking,
  ...domain3Storage,
  ...domain3FileDatabases,
  ...domain3IntegrationMonitoring,
  ...domain3AimlAnalytics,
  ...domain4,
  ...domain4Pricing,
  ...domain4CostTools,
  ...domain4SupportMigration,
];
