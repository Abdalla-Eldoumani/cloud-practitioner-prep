import type { ServiceEntry } from "../../lib/types";

// AWS category: Storage. In-scope set: AWS Backup, Amazon EBS, Amazon EFS, AWS
// Elastic Disaster Recovery, Amazon FSx, Amazon S3, Amazon S3 Glacier, AWS
// Storage Gateway (S3 and S3 Glacier both kept as distinct entries). Authored
// against the official in-scope appendix; each entry carries a sourced reference
// and a lastVerified date. Expected ids: see expected-manifest.ts.
export const storage: ServiceEntry[] = [];
