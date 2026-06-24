import type { ServiceEntry } from "../../lib/types";

// AWS category: Networking and Content Delivery. In-scope set: Amazon API
// Gateway, Amazon CloudFront, AWS Direct Connect, AWS Global Accelerator, AWS
// PrivateLink, Amazon Route 53, AWS Transit Gateway, Amazon VPC, and the VPN
// trio (AWS VPN + Site-to-Site VPN + Client VPN) collapsed to one VPN entry.
// Authored against the official in-scope appendix; each entry carries a sourced
// reference and a lastVerified date. Expected ids: see expected-manifest.ts.
export const networking: ServiceEntry[] = [
  {
    id: "amazon-api-gateway",
    name: "Amazon API Gateway",
    shortName: "API Gateway",
    domain: 3,
    category: "Networking and Content Delivery",
    purpose:
      "A fully managed service for creating, publishing, securing, and monitoring APIs at any scale.",
    whenToUse:
      "Reach for it when you want a managed front door for an API, so your application can expose REST or WebSocket endpoints without running the API servers yourself.",
    reference: {
      label: "What is Amazon API Gateway?",
      url: "https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "API Gateway",
      "API management",
      "REST API",
      "API front door",
    ],
    relatedTerms: ["API", "REST", "WebSocket", "managed API"],
  },
  {
    id: "amazon-cloudfront",
    name: "Amazon CloudFront",
    shortName: "CloudFront",
    domain: 3,
    category: "Networking and Content Delivery",
    purpose:
      "A content delivery network that caches content at edge locations close to users to deliver it with low latency.",
    whenToUse:
      "Reach for it when you want to serve websites, files, or media to a global audience faster by caching them near the people requesting them.",
    reference: {
      label: "What is Amazon CloudFront?",
      url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "CloudFront",
      "CDN",
      "content delivery network",
      "edge cache",
    ],
    relatedTerms: ["CDN", "edge location", "caching", "low latency"],
  },
  {
    id: "aws-direct-connect",
    name: "AWS Direct Connect",
    shortName: "Direct Connect",
    domain: 3,
    category: "Networking and Content Delivery",
    purpose:
      "A service that establishes a dedicated private network connection between your premises and AWS.",
    whenToUse:
      "Reach for it when you need consistent, private network performance between a data center and AWS instead of going over the public internet.",
    reference: {
      label: "What is AWS Direct Connect?",
      url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Direct Connect",
      "dedicated connection",
      "private connection",
      "DX",
    ],
    relatedTerms: ["dedicated network", "private link to AWS", "hybrid"],
  },
  {
    id: "aws-global-accelerator",
    name: "AWS Global Accelerator",
    shortName: "Global Accelerator",
    domain: 3,
    category: "Networking and Content Delivery",
    purpose:
      "A networking service that routes user traffic over the AWS global network to improve availability and performance for your applications.",
    whenToUse:
      "Reach for it when you want to send users to the nearest healthy application endpoint over the AWS backbone, with static entry-point IP addresses.",
    reference: {
      label: "What is AWS Global Accelerator?",
      url: "https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Global Accelerator",
      "traffic acceleration",
      "anycast IP",
      "global routing",
    ],
    relatedTerms: ["global network", "performance routing", "static IP"],
  },
  {
    id: "aws-privatelink",
    name: "AWS PrivateLink",
    shortName: "PrivateLink",
    domain: 3,
    category: "Networking and Content Delivery",
    purpose:
      "A service that provides private connectivity between VPCs, AWS services, and your on-premises networks without exposing traffic to the public internet.",
    whenToUse:
      "Reach for it when you want to reach an AWS service or a partner service privately from your VPC, keeping the traffic off the public internet.",
    reference: {
      label: "What is AWS PrivateLink?",
      url: "https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "PrivateLink",
      "private connectivity",
      "VPC endpoint",
      "private endpoint",
    ],
    relatedTerms: ["private connectivity", "VPC endpoint", "no internet exposure"],
    relatedServices: ["amazon-vpc"],
  },
  {
    id: "amazon-route-53",
    name: "Amazon Route 53",
    shortName: "Route 53",
    domain: 3,
    category: "Networking and Content Delivery",
    purpose:
      "A highly available and scalable Domain Name System (DNS) web service that also handles domain registration and health checking.",
    whenToUse:
      "Reach for it when you need to register a domain, translate names to addresses, or route users to your application with policies like latency or failover.",
    reference: {
      label: "What is Amazon Route 53?",
      url: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Route 53",
      "DNS",
      "domain name system",
      "domain registration",
    ],
    relatedTerms: ["DNS", "domain", "routing", "health check"],
  },
  {
    id: "aws-transit-gateway",
    name: "AWS Transit Gateway",
    shortName: "Transit Gateway",
    domain: 3,
    category: "Networking and Content Delivery",
    purpose:
      "A network transit hub that connects your VPCs and on-premises networks through a central gateway.",
    whenToUse:
      "Reach for it when you have many VPCs and network connections to interconnect and want to manage them through one hub instead of many point-to-point links.",
    reference: {
      label: "What is AWS Transit Gateway?",
      url: "https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Transit Gateway",
      "network hub",
      "VPC interconnect",
      "transit hub",
    ],
    relatedTerms: ["network hub", "VPC peering at scale", "central gateway"],
    relatedServices: ["amazon-vpc"],
  },
  {
    id: "amazon-vpc",
    name: "Amazon VPC",
    shortName: "VPC",
    domain: 3,
    category: "Networking and Content Delivery",
    purpose:
      "A service that lets you provision a logically isolated section of the AWS cloud where you launch resources in a virtual network you define.",
    whenToUse:
      "Reach for it whenever you need a private network in AWS with control over IP ranges, subnets, route tables, and gateways for your resources.",
    reference: {
      label: "What is Amazon VPC?",
      url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "VPC",
      "Virtual Private Cloud",
      "private network",
      "virtual network",
    ],
    relatedTerms: ["private network", "subnet", "isolation", "virtual network"],
  },
  {
    id: "aws-vpn",
    name: "AWS VPN",
    shortName: "VPN",
    domain: 3,
    category: "Networking and Content Delivery",
    purpose:
      "A service that provides secure connections to AWS through two managed offerings: Site-to-Site VPN for network-to-network links and Client VPN for individual remote users.",
    whenToUse:
      "Reach for Site-to-Site VPN to connect a data center or office network to a VPC over an encrypted tunnel, and Client VPN to give remote users secure access to AWS and on-premises resources.",
    reference: {
      label: "AWS VPN overview",
      url: "https://docs.aws.amazon.com/vpn/",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "VPN",
      "Site-to-Site VPN",
      "Client VPN",
      "virtual private network",
      "encrypted tunnel",
    ],
    relatedTerms: ["VPN", "encrypted tunnel", "remote access", "hybrid network"],
    relatedServices: ["amazon-vpc"],
  },
];
