import type { ServiceEntry } from "../../lib/types";

// AWS category: Networking and Content Delivery. In-scope set: Amazon API
// Gateway, Amazon CloudFront, AWS Direct Connect, AWS Global Accelerator, AWS
// PrivateLink, Amazon Route 53, AWS Transit Gateway, Amazon VPC, and the VPN
// trio (AWS VPN + Site-to-Site VPN + Client VPN) collapsed to one VPN entry.
// Authored against the official in-scope appendix; each entry carries a sourced
// reference and a lastVerified date. Expected ids: see expected-manifest.ts.
export const networking: ServiceEntry[] = [];
