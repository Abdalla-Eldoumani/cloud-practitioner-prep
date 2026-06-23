import type { ServiceEntry } from "../../lib/types";

// AWS category: Management and Governance. In-scope set: AWS Auto Scaling, AWS
// CloudFormation, AWS CloudTrail, Amazon CloudWatch, AWS Compute Optimizer, AWS
// Config, AWS Control Tower, AWS Health Dashboard, AWS License Manager, AWS
// Management Console, AWS Organizations, AWS Service Catalog, Service Quotas, AWS
// Systems Manager, AWS Trusted Advisor, AWS Well-Architected Tool (the Management
// Console is an access tool but is exam-named, so it is kept as an entry). This
// category spans domains; pick each entry's primary domain at authoring time.
// Authored against the official in-scope appendix; each entry carries a sourced
// reference and a lastVerified date. Expected ids: see expected-manifest.ts.
export const managementGovernance: ServiceEntry[] = [];
