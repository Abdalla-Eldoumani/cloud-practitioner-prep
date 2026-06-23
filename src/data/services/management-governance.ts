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
//
// The recommended primary domain split is applied here: the audit/governance
// services CloudTrail, Config, Control Tower, and Organizations are tagged D2
// (Security and Compliance); the cost and best-practice tools Compute Optimizer,
// Health Dashboard, License Manager, Trusted Advisor, and Well-Architected Tool
// are tagged D4 (Billing, Pricing, and Support); the remaining technology
// services are D3. Three compare groups are wired via relatedServices so the
// disambiguation cards can key on them: the observability trio
// (CloudTrail/CloudWatch/Config), the account-governance pair
// (Organizations/Control Tower), and the guidance-tools pair (Trusted
// Advisor/Well-Architected Tool). CloudTrail, CloudWatch, and Config are
// deliberately given distinct purposes: API-call history, metrics and logs, and
// resource configuration and compliance respectively.
export const managementGovernance: ServiceEntry[] = [
  {
    id: "aws-auto-scaling",
    name: "AWS Auto Scaling",
    shortName: "Auto Scaling",
    domain: 3,
    category: "Management and Governance",
    purpose:
      "A service that monitors your applications and automatically adjusts capacity across multiple AWS resources to maintain steady performance at the lowest possible cost.",
    whenToUse:
      "Reach for it when demand on your application rises and falls and you want capacity to scale out and back in automatically instead of guessing a fixed size.",
    reference: {
      label: "What is AWS Auto Scaling?",
      url: "https://docs.aws.amazon.com/autoscaling/plans/userguide/what-is-aws-auto-scaling.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Auto Scaling",
      "automatic scaling",
      "scale capacity",
      "elasticity",
    ],
    relatedTerms: ["scaling", "elasticity", "capacity", "demand"],
  },
  {
    id: "aws-cloudformation",
    name: "AWS CloudFormation",
    shortName: "CloudFormation",
    domain: 3,
    category: "Management and Governance",
    purpose:
      "A service that lets you model and provision a collection of AWS resources from a template, so your infrastructure is defined as code and created repeatably.",
    whenToUse:
      "Reach for it when you want to define your infrastructure in a file and stand up or tear down the whole set of resources consistently instead of clicking through the console each time.",
    reference: {
      label: "What is AWS CloudFormation?",
      url: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "CloudFormation",
      "infrastructure as code",
      "IaC",
      "templates",
      "provisioning",
    ],
    relatedTerms: [
      "infrastructure as code",
      "template",
      "stack",
      "provisioning",
    ],
  },
  {
    id: "aws-cloudtrail",
    name: "AWS CloudTrail",
    shortName: "CloudTrail",
    domain: 2,
    category: "Management and Governance",
    purpose:
      "A service that records the actions taken in your account as events, giving you a history of API calls and activity for auditing, security analysis, and troubleshooting.",
    whenToUse:
      "Reach for it when you need to know who did what in your account and when, such as for a security investigation or a compliance audit trail.",
    reference: {
      label: "What is AWS CloudTrail?",
      url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "CloudTrail",
      "API audit log",
      "API call history",
      "activity history",
      "audit trail",
    ],
    relatedTerms: ["audit", "API calls", "governance", "activity history"],
    relatedServices: ["amazon-cloudwatch", "aws-config"],
  },
  {
    id: "amazon-cloudwatch",
    name: "Amazon CloudWatch",
    shortName: "CloudWatch",
    domain: 3,
    category: "Management and Governance",
    purpose:
      "A monitoring and observability service that collects metrics, logs, and events from your AWS resources and applications, and can alarm on them.",
    whenToUse:
      "Reach for it when you want to watch performance metrics, gather logs, set alarms, and build dashboards to keep an eye on the health of your systems.",
    reference: {
      label: "What is Amazon CloudWatch?",
      url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "CloudWatch",
      "monitoring",
      "metrics and logs",
      "alarms",
      "observability",
    ],
    relatedTerms: ["monitoring", "metrics", "logs", "alarms", "dashboards"],
    relatedServices: ["aws-cloudtrail", "aws-config"],
  },
  {
    id: "aws-compute-optimizer",
    name: "AWS Compute Optimizer",
    shortName: "Compute Optimizer",
    domain: 4,
    category: "Management and Governance",
    purpose:
      "A service that analyzes the usage of your resources and recommends optimal AWS resource configurations to improve performance and reduce cost.",
    whenToUse:
      "Reach for it when you want data-driven right-sizing advice, such as which instance type fits a workload, instead of over-provisioning and overpaying.",
    reference: {
      label: "What is AWS Compute Optimizer?",
      url: "https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Compute Optimizer",
      "right-sizing",
      "rightsizing",
      "resource recommendations",
      "cost optimization",
    ],
    relatedTerms: ["right-sizing", "recommendations", "cost", "performance"],
  },
  {
    id: "aws-config",
    name: "AWS Config",
    shortName: "Config",
    domain: 2,
    category: "Management and Governance",
    purpose:
      "A service that records the configuration of your AWS resources over time and lets you assess them against desired settings, so you can track changes and evaluate compliance.",
    whenToUse:
      "Reach for it when you need a history of how a resource was configured, want to see what changed, or must check resources against compliance rules.",
    reference: {
      label: "What is AWS Config?",
      url: "https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Config",
      "resource configuration history",
      "configuration compliance",
      "compliance",
      "configuration recorder",
    ],
    relatedTerms: [
      "configuration",
      "compliance",
      "change history",
      "resource inventory",
    ],
    relatedServices: ["aws-cloudtrail", "amazon-cloudwatch"],
  },
  {
    id: "aws-control-tower",
    name: "AWS Control Tower",
    shortName: "Control Tower",
    domain: 2,
    category: "Management and Governance",
    purpose:
      "A service that sets up and governs a secure, multi-account AWS environment, called a landing zone, based on established best practices.",
    whenToUse:
      "Reach for it when you are standing up many AWS accounts and want a governed landing zone with guardrails in place from the start instead of configuring each account by hand.",
    reference: {
      label: "What is AWS Control Tower?",
      url: "https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Control Tower",
      "landing zone",
      "account governance",
      "guardrails",
      "multi-account setup",
    ],
    relatedTerms: ["landing zone", "governance", "guardrails", "multi-account"],
    relatedServices: ["aws-organizations"],
  },
  {
    id: "aws-health-dashboard",
    name: "AWS Health Dashboard",
    shortName: "Health Dashboard",
    domain: 4,
    category: "Management and Governance",
    purpose:
      "A service that gives you visibility into the health of AWS services and personalized alerts about events that may affect your resources.",
    whenToUse:
      "Reach for it when you want to know whether an AWS service is having an issue or whether scheduled changes and events will affect your own resources.",
    reference: {
      label: "Getting started with your AWS Health Dashboard",
      url: "https://docs.aws.amazon.com/health/latest/ug/getting-started-health-dashboard.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Health Dashboard",
      "service health",
      "AWS Health",
      "status",
      "operational events",
    ],
    relatedTerms: ["service health", "status", "events", "notifications"],
  },
  {
    id: "aws-license-manager",
    name: "AWS License Manager",
    shortName: "License Manager",
    domain: 4,
    category: "Management and Governance",
    purpose:
      "A service that helps you manage software licenses from vendors centrally across AWS and on-premises, and enforce the rules of your licensing agreements.",
    whenToUse:
      "Reach for it when you must track and control where licensed software runs to stay within the terms of your agreements and avoid licensing overruns.",
    reference: {
      label: "What is AWS License Manager?",
      url: "https://docs.aws.amazon.com/license-manager/latest/userguide/license-manager.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "License Manager",
      "software licenses",
      "license tracking",
      "license compliance",
    ],
    relatedTerms: ["licenses", "software", "compliance", "tracking"],
  },
  {
    id: "aws-management-console",
    name: "AWS Management Console",
    shortName: "Console",
    domain: 3,
    category: "Management and Governance",
    purpose:
      "A web-based interface for accessing and managing your AWS account and its services through a browser.",
    whenToUse:
      "Reach for it when you want to point and click to explore services, create resources, or check on your account without writing code or commands.",
    reference: {
      label: "AWS Management Console",
      url: "https://docs.aws.amazon.com/awsconsolehelpdocs/latest/gsg/getting-started.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Management Console",
      "console",
      "web console",
      "browser interface",
    ],
    relatedTerms: ["console", "web interface", "browser", "access"],
  },
  {
    id: "aws-organizations",
    name: "AWS Organizations",
    shortName: "Organizations",
    domain: 2,
    category: "Management and Governance",
    purpose:
      "A service for centrally managing and governing multiple AWS accounts, grouping them into organizational units, applying policies, and consolidating their billing.",
    whenToUse:
      "Reach for it when you have more than one AWS account and want to manage them together, apply rules across them, and get a single consolidated bill.",
    reference: {
      label: "What is AWS Organizations?",
      url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Organizations",
      "multi-account management",
      "consolidated billing",
      "organizational units",
      "service control policies",
    ],
    relatedTerms: [
      "multi-account",
      "consolidated billing",
      "policies",
      "governance",
    ],
    relatedServices: ["aws-control-tower"],
  },
  {
    id: "aws-service-catalog",
    name: "AWS Service Catalog",
    shortName: "Service Catalog",
    domain: 3,
    category: "Management and Governance",
    purpose:
      "A service that lets organizations create and manage approved catalogs of IT products, so users can deploy only the resources their organization has vetted.",
    whenToUse:
      "Reach for it when you want to give teams a self-service menu of pre-approved, standardized resources to launch while keeping governance and consistency.",
    reference: {
      label: "What is Service Catalog?",
      url: "https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Service Catalog",
      "approved products",
      "self-service catalog",
      "standardized resources",
    ],
    relatedTerms: ["catalog", "approved products", "self-service", "governance"],
  },
  {
    id: "service-quotas",
    name: "Service Quotas",
    shortName: "Service Quotas",
    domain: 3,
    category: "Management and Governance",
    purpose:
      "A service that gives you a central place to view and manage your AWS service quotas, the maximum values for your resources, and request increases.",
    whenToUse:
      "Reach for it when you are approaching a service limit and want to see your current quotas in one place and request a higher limit.",
    reference: {
      label: "What is Service Quotas?",
      url: "https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Service Quotas",
      "service limits",
      "quotas",
      "limit increase",
    ],
    relatedTerms: ["quotas", "limits", "service limits", "increase"],
  },
  {
    id: "aws-systems-manager",
    name: "AWS Systems Manager",
    shortName: "Systems Manager",
    domain: 3,
    category: "Management and Governance",
    purpose:
      "A service that gives you a unified interface to view operational data and automate operational tasks across your AWS resources.",
    whenToUse:
      "Reach for it when you want to manage and automate operations on your fleet, such as running commands, applying patches, or storing configuration, from one place.",
    reference: {
      label: "What is AWS Systems Manager?",
      url: "https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Systems Manager",
      "SSM",
      "operations management",
      "patch management",
      "automation",
    ],
    relatedTerms: ["operations", "automation", "patching", "management"],
  },
  {
    id: "aws-trusted-advisor",
    name: "AWS Trusted Advisor",
    shortName: "Trusted Advisor",
    domain: 4,
    category: "Management and Governance",
    purpose:
      "A service that inspects your AWS environment and provides real-time recommendations following AWS best practices for cost, performance, security, fault tolerance, and service limits.",
    whenToUse:
      "Reach for it when you want automated best-practice checks across your account that flag savings, security gaps, and reliability risks.",
    reference: {
      label: "AWS Trusted Advisor",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Trusted Advisor",
      "best-practice checks",
      "recommendations",
      "cost and security checks",
    ],
    relatedTerms: [
      "best practices",
      "recommendations",
      "checks",
      "optimization",
    ],
    relatedServices: ["aws-well-architected-tool"],
  },
  {
    id: "aws-well-architected-tool",
    name: "AWS Well-Architected Tool",
    shortName: "Well-Architected Tool",
    domain: 4,
    category: "Management and Governance",
    purpose:
      "A service that helps you review the state of your workloads against AWS architectural best practices and gives guidance to improve them.",
    whenToUse:
      "Reach for it when you want a structured review of a workload against the Well-Architected Framework to find and address architectural risks.",
    reference: {
      label: "What is AWS Well-Architected Tool?",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/userguide/intro.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Well-Architected Tool",
      "architecture review",
      "Well-Architected Framework",
      "workload review",
    ],
    relatedTerms: [
      "architecture review",
      "best practices",
      "workload",
      "framework",
    ],
    relatedServices: ["aws-trusted-advisor"],
  },
];
