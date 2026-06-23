import type { ServiceEntry } from "../../lib/types";

// AWS category: Security, Identity, and Compliance. In-scope set: AWS Artifact,
// AWS Audit Manager, AWS Certificate Manager (ACM), AWS CloudHSM, Amazon Cognito,
// Amazon Detective, AWS Directory Service, AWS Firewall Manager, Amazon GuardDuty,
// AWS IAM, AWS IAM Identity Center, Amazon Inspector, AWS KMS, Amazon Macie, AWS
// RAM, AWS Secrets Manager, AWS Security Hub, AWS Shield, AWS WAF. Authored
// against the official in-scope appendix; each entry carries a sourced reference
// and a lastVerified date. Expected ids: see expected-manifest.ts.
export const securityIdentityCompliance: ServiceEntry[] = [
  {
    id: "aws-iam",
    name: "AWS Identity and Access Management (IAM)",
    shortName: "IAM",
    domain: 2,
    category: "Security, Identity, and Compliance",
    purpose:
      "A service that controls who is authenticated and authorized to use AWS resources by managing users, groups, roles, and the permission policies attached to them.",
    whenToUse:
      "Reach for it whenever you need to grant or restrict access to AWS, applying least-privilege permissions to people and to applications through roles rather than sharing long-lived credentials.",
    reference: {
      label: "What is IAM?",
      url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "IAM",
      "Identity and Access Management",
      "permissions",
      "policies",
      "roles",
    ],
    relatedTerms: [
      "identity and access management",
      "permissions",
      "least privilege",
      "policy",
      "role",
    ],
    relatedServices: ["aws-iam-identity-center"],
  },
  {
    id: "aws-iam-identity-center",
    name: "AWS IAM Identity Center",
    shortName: "IAM Identity Center",
    domain: 2,
    category: "Security, Identity, and Compliance",
    purpose:
      "A service that centrally manages workforce single sign-on access to multiple AWS accounts and business applications from one place.",
    whenToUse:
      "Reach for it when your organization has many AWS accounts and you want employees to sign in once, with access assigned from a central directory instead of separate users in each account.",
    reference: {
      label: "What is IAM Identity Center?",
      url: "https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "IAM Identity Center",
      "single sign-on",
      "SSO",
      "AWS SSO",
      "workforce identity",
    ],
    relatedTerms: [
      "single sign-on",
      "centralized access",
      "workforce identity",
      "multi-account",
    ],
    relatedServices: ["aws-iam"],
  },
  {
    id: "amazon-cognito",
    name: "Amazon Cognito",
    shortName: "Cognito",
    domain: 2,
    category: "Security, Identity, and Compliance",
    purpose:
      "A service that adds sign-up, sign-in, and access control to your web and mobile applications for your customers.",
    whenToUse:
      "Reach for it when you are building an app and need to authenticate end users, supporting their own credentials or social and enterprise identity providers, without building an identity system yourself.",
    reference: {
      label: "What is Amazon Cognito?",
      url: "https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Cognito",
      "user sign-in",
      "authentication",
      "user pools",
      "customer identity",
    ],
    relatedTerms: [
      "user sign-in",
      "authentication",
      "app users",
      "identity provider",
    ],
  },
  {
    id: "aws-kms",
    name: "AWS Key Management Service (AWS KMS)",
    shortName: "KMS",
    domain: 2,
    category: "Security, Identity, and Compliance",
    purpose:
      "A managed service that lets you create and control the cryptographic keys used to encrypt your data across AWS services and your applications.",
    whenToUse:
      "Reach for it when you need to encrypt data with managed keys, controlling who can use each key and keeping an audit trail of its use, integrated with services like S3, EBS, and RDS.",
    reference: {
      label: "What is AWS KMS?",
      url: "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "KMS",
      "Key Management Service",
      "encryption keys",
      "managed keys",
    ],
    relatedTerms: [
      "encryption keys",
      "encryption",
      "key management",
      "data protection",
    ],
    relatedServices: ["aws-cloudhsm"],
  },
  {
    id: "aws-cloudhsm",
    name: "AWS CloudHSM",
    shortName: "CloudHSM",
    domain: 2,
    category: "Security, Identity, and Compliance",
    purpose:
      "A service that provides dedicated, single-tenant hardware security modules in the cloud so you can generate and use your own encryption keys with sole control.",
    whenToUse:
      "Reach for it when compliance or contractual requirements demand a dedicated FIPS-validated hardware security module that only you can access, rather than the shared managed keys of KMS.",
    reference: {
      label: "What is AWS CloudHSM?",
      url: "https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "CloudHSM",
      "hardware security module",
      "HSM",
      "dedicated key store",
    ],
    relatedTerms: [
      "hardware security module",
      "dedicated keys",
      "FIPS",
      "single tenant",
    ],
    relatedServices: ["aws-kms"],
  },
  {
    id: "aws-secrets-manager",
    name: "AWS Secrets Manager",
    shortName: "Secrets Manager",
    domain: 2,
    category: "Security, Identity, and Compliance",
    purpose:
      "A service that stores, manages, and automatically rotates secrets such as database credentials, API keys, and other tokens.",
    whenToUse:
      "Reach for it when you want to keep credentials out of your code and configuration, retrieving them at runtime through the API and rotating them on a schedule without an outage.",
    reference: {
      label: "What is AWS Secrets Manager?",
      url: "https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Secrets Manager",
      "secrets",
      "credentials",
      "secret rotation",
    ],
    relatedTerms: [
      "secrets",
      "credentials",
      "rotation",
      "database password",
    ],
  },
  {
    id: "aws-certificate-manager",
    name: "AWS Certificate Manager (ACM)",
    shortName: "ACM",
    domain: 2,
    category: "Security, Identity, and Compliance",
    purpose:
      "A service that provisions, manages, and deploys public and private SSL/TLS certificates for use with AWS services.",
    whenToUse:
      "Reach for it when you need TLS certificates to secure a website or application and want AWS to issue and renew them automatically so they do not expire unnoticed.",
    reference: {
      label: "What is AWS Certificate Manager?",
      url: "https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "ACM",
      "Certificate Manager",
      "TLS/SSL certificates",
      "SSL certificates",
      "HTTPS certificates",
    ],
    relatedTerms: [
      "TLS certificate",
      "SSL certificate",
      "HTTPS",
      "certificate renewal",
    ],
  },
  {
    id: "aws-directory-service",
    name: "AWS Directory Service",
    shortName: "Directory Service",
    domain: 2,
    category: "Security, Identity, and Compliance",
    purpose:
      "A service that provides managed Microsoft Active Directory in the cloud and ways to connect AWS resources to an existing on-premises directory.",
    whenToUse:
      "Reach for it when your workloads depend on Active Directory for sign-in and group policy, and you want a managed directory in AWS or a connection to the one you already run.",
    reference: {
      label: "What is AWS Directory Service?",
      url: "https://docs.aws.amazon.com/directoryservice/latest/admin-guide/what_is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Directory Service",
      "Managed Microsoft AD",
      "Active Directory",
      "managed directory",
    ],
    relatedTerms: [
      "active directory",
      "managed directory",
      "domain join",
      "LDAP",
    ],
  },
  {
    id: "aws-ram",
    name: "AWS Resource Access Manager (AWS RAM)",
    shortName: "RAM",
    domain: 2,
    category: "Security, Identity, and Compliance",
    purpose:
      "A service that lets you securely share your AWS resources with other AWS accounts or within your organization.",
    whenToUse:
      "Reach for it when you want to share resources such as subnets, Transit Gateways, or License Manager configurations across accounts instead of duplicating them in each one.",
    reference: {
      label: "What is AWS RAM?",
      url: "https://docs.aws.amazon.com/ram/latest/userguide/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "RAM",
      "Resource Access Manager",
      "resource sharing",
      "share resources",
    ],
    relatedTerms: [
      "resource sharing",
      "cross-account",
      "shared resources",
      "organization sharing",
    ],
  },
];
