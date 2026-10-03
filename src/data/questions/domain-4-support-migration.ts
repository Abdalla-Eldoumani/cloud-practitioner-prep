import type { Question } from "../../lib/types";

// Domain 4: Billing, Pricing, and Support. Support plans, support case
// severity, AWS Trusted Advisor, the AWS Health Dashboard, and the AWS
// resources and help the exam names. Migration and the Cloud Adoption Framework
// live in domain-1-migration-caf.ts.
// Original practice questions. Every fact verified against current AWS docs.
//
// Support-plan note: AWS has announced a consolidation. Developer Support,
// Business Support, and Enterprise On-Ramp reach end of support on
// January 1, 2027. Developer and Business customers move to Business Support+,
// and Enterprise On-Ramp customers move to Enterprise Support. The CLF-C02 exam
// still frames the classic five tiers (Basic, Developer, Business, Enterprise
// On-Ramp, Enterprise), so the questions teach those tiers and the verified
// severity response times, with a question acknowledging the change.
//
// Ids keep their historical d4-supportmig- and d3-integ- prefixes deliberately:
// an id is a stable key in a learner's saved progress, so it survives a move
// between files and stays put when a question is retagged to another domain.
export const domain4SupportMigration: Question[] = [
  {
    id: "d4-supportmig-01",
    domain: 4,
    type: "single",
    topic: "AWS Support plans",
    difficulty: "easy",
    stem: "Which AWS Support plan is included for every AWS account at no additional charge?",
    options: [
      { id: "a", text: "Developer Support" },
      { id: "b", text: "Business Support" },
      { id: "c", text: "Basic Support" },
      { id: "d", text: "Enterprise Support" },
    ],
    correct: ["c"],
    explanation:
      "Basic Support comes with every AWS account at no cost. It covers account and billing questions, service quota increase requests, AWS Trusted Advisor core checks, and round-the-clock access to documentation and the AWS re:Post community. Developer Support, Business Support, and Enterprise Support are all paid plans that add technical support cases and further features, so none of them is the one included free.",
    reference: {
      label: "AWS Support Plans",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/aws-support-plans.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-02",
    domain: 4,
    type: "single",
    topic: "AWS Support plans",
    difficulty: "easy",
    stem: "A startup on the Basic Support plan hits an error in its application running on AWS and wants to open a technical support case with an AWS engineer. What must it do first?",
    options: [
      { id: "a", text: "Nothing; Basic Support already includes technical support cases." },
      { id: "b", text: "Upgrade to a paid plan such as Developer or Business." },
      { id: "c", text: "Buy a separate Trusted Advisor subscription." },
      { id: "d", text: "Open it as an account and billing case instead." },
    ],
    correct: ["b"],
    explanation:
      "With Basic Support you cannot create a technical support case. Account, billing, and service quota increase cases are available to all customers, but an account and billing case covers billing and account questions rather than technical issues, so a technical case requires a paid plan such as Developer, Business, or Enterprise. Trusted Advisor is not a separate purchase.",
    reference: {
      label: "AWS Support case management",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/case-management.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d4-supportmig-03",
    domain: 4,
    type: "single",
    topic: "AWS Support plans",
    difficulty: "medium",
    stem: "A company runs production workloads on AWS and needs 24/7 access to Cloud Support Engineers by phone, chat, and the web, plus the full set of AWS Trusted Advisor checks, at the lowest cost. Which plan meets these needs?",
    options: [
      { id: "a", text: "Basic Support" },
      { id: "b", text: "Developer Support" },
      { id: "c", text: "Business Support" },
      { id: "d", text: "Enterprise Support" },
    ],
    correct: ["c"],
    explanation:
      "Business Support is the lowest classic tier that provides 24/7 phone, chat, and web access to Cloud Support Engineers along with the full set of Trusted Advisor checks. Basic and Developer lack 24/7 engineer access and the full checks. Enterprise adds a designated Technical Account Manager and faster critical response, but at higher cost than required here. AWS is consolidating its lineup, with Business Support reaching end of support on January 1, 2027 and customers moving to Business Support+, but the exam still frames the classic tier.",
    reference: {
      label: "AWS Business Support",
      url: "https://aws.amazon.com/premiumsupport/plans/business/",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-04",
    domain: 4,
    type: "single",
    topic: "AWS Support plans",
    difficulty: "medium",
    stem: "Under the classic AWS Support tiers the CLF-C02 exam covers, which plan is the cheapest paid tier that lets a developer open technical support cases?",
    options: [
      { id: "a", text: "Basic Support" },
      { id: "b", text: "Developer Support" },
      { id: "c", text: "Business Support" },
      { id: "d", text: "Enterprise Support" },
    ],
    correct: ["b"],
    explanation:
      "Developer Support is the entry paid plan aimed at testing and early development, and it is the cheapest tier that can open technical support cases. Basic cannot open technical cases at all, while Business and Enterprise are built for production workloads and cost more than a non-production experiment needs. AWS is consolidating its lineup: Developer Support and Business Support closed to new subscriptions on December 2, 2025, and Developer Support reaches end of support on January 1, 2027 with customers moving to Business Support+, but the exam still frames the classic tier.",
    reference: {
      label: "AWS Support FAQs",
      url: "https://aws.amazon.com/premiumsupport/faqs/",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-05",
    domain: 4,
    type: "single",
    topic: "AWS Support plans",
    difficulty: "medium",
    stem: "Which AWS Support feature is available only with the Enterprise Support plan?",
    options: [
      { id: "a", text: "A designated Technical Account Manager (TAM)" },
      { id: "b", text: "The full set of AWS Trusted Advisor checks" },
      { id: "c", text: "24/7 access to Cloud Support Engineers by phone and chat" },
      { id: "d", text: "Service quota increase requests" },
    ],
    correct: ["a"],
    explanation:
      "A designated Technical Account Manager is part of Enterprise Support. The full set of Trusted Advisor checks and 24/7 engineer access by phone and chat are already available at the Business tier, and service quota increase requests are open to every customer including Basic Support.",
    reference: {
      label: "Features of AWS Support Plans",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/aws-support-plans.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-06",
    domain: 4,
    type: "single",
    topic: "Support case severity",
    difficulty: "medium",
    stem: "On a plan that supports it, a customer opens a case at the highest severity, business-critical system down, with Enterprise Support. What is the first-response time AWS targets for this severity on Enterprise Support?",
    options: [
      { id: "a", text: "15 minutes" },
      { id: "b", text: "1 hour" },
      { id: "c", text: "4 hours" },
      { id: "d", text: "24 hours" },
    ],
    correct: ["a"],
    explanation:
      "For a business-critical system down case, Enterprise Support targets a first response in under 15 minutes, the fastest commitment AWS offers in this tier. The 1 hour figure is for a production system down case, 4 hours is for a production system impaired case, and 24 hours is for a general guidance case.",
    reference: {
      label: "Choosing a support case severity level",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/case-management.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d4-supportmig-07",
    domain: 4,
    type: "single",
    topic: "Support case severity",
    difficulty: "hard",
    stem: "A customer reports that important functions of a production application are unavailable and the business is significantly impacted. They open a case at the production system down severity. What first-response time does AWS target for this severity?",
    options: [
      { id: "a", text: "24 hours" },
      { id: "b", text: "4 hours" },
      { id: "c", text: "1 hour" },
      { id: "d", text: "12 hours" },
    ],
    correct: ["c"],
    explanation:
      "Production system down is the urgent severity, and AWS targets a first response within 1 hour. General guidance targets 24 hours, system impaired targets 12 hours, and production system impaired targets 4 hours. The fastest tier, business-critical system down, is reserved for cases where the business is at risk.",
    reference: {
      label: "Understanding AWS Support response times",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/case-management.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-08",
    domain: 4,
    type: "multi",
    topic: "Support case severity",
    difficulty: "hard",
    stem: "Match the intent: which TWO statements about AWS Support first-response time targets are correct? (Choose two.)",
    options: [
      { id: "a", text: "A general guidance case targets a first response within 24 hours." },
      { id: "b", text: "A production system impaired case targets a first response within 4 hours." },
      { id: "c", text: "A system impaired case targets a first response within 1 hour." },
      { id: "d", text: "A production system down case targets a first response within 12 hours." },
      { id: "e", text: "Every severity level is available on the Basic Support plan." },
    ],
    correct: ["a", "b"],
    explanation:
      "General guidance targets 24 hours and production system impaired targets 4 hours. System impaired targets 12 hours, not 1 hour, and production system down targets 1 hour, not 12 hours. Basic Support cannot open technical cases at all, so the severity levels are not all available to it.",
    reference: {
      label: "Choosing a support case severity level",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/case-management.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-09",
    domain: 4,
    type: "single",
    topic: "AWS Support plans",
    difficulty: "hard",
    stem: "AWS has announced changes to its support plan lineup. Which statement reflects the announced consolidation?",
    options: [
      { id: "a", text: "Developer and Business Support end; customers move to Business Support+." },
      { id: "b", text: "Basic Support is being discontinued and replaced by a paid entry plan." },
      { id: "c", text: "Enterprise Support is being discontinued with no successor." },
      { id: "d", text: "Enterprise On-Ramp replaces Developer and Business Support for all customers." },
    ],
    correct: ["a"],
    explanation:
      "AWS announced that Developer Support, Business Support, and Enterprise On-Ramp reach end of support on January 1, 2027. Developer and Business customers can move to Business Support+, and Enterprise On-Ramp customers are upgraded to Enterprise Support. Basic Support continues, Enterprise Support continues, and Enterprise On-Ramp is itself being discontinued rather than replacing Developer and Business Support.",
    reference: {
      label: "Developer, Business, and Enterprise On-Ramp end of support",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/support-plans-eos.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d4-supportmig-10",
    domain: 4,
    type: "single",
    topic: "AWS Trusted Advisor",
    difficulty: "easy",
    stem: "Which AWS service inspects an AWS environment and makes recommendations across categories such as cost optimization, performance, security, fault tolerance, service limits, and operational excellence?",
    options: [
      { id: "a", text: "AWS Trusted Advisor" },
      { id: "b", text: "AWS Config" },
      { id: "c", text: "Amazon CloudWatch" },
      { id: "d", text: "AWS CloudTrail" },
    ],
    correct: ["a"],
    explanation:
      "AWS Trusted Advisor inspects your account and provides recommendations across those six categories so you can follow AWS best practices. AWS Config records and evaluates resource configurations, CloudWatch collects metrics and logs for monitoring, and CloudTrail records API activity for auditing.",
    reference: {
      label: "AWS Trusted Advisor check reference",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor-check-reference.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-11",
    domain: 4,
    type: "multi",
    topic: "AWS Trusted Advisor",
    difficulty: "medium",
    stem: "Which TWO of the following are AWS Trusted Advisor check categories? (Choose two.)",
    options: [
      { id: "a", text: "Service limits" },
      { id: "b", text: "Fault tolerance" },
      { id: "c", text: "Carbon footprint" },
      { id: "d", text: "Data residency" },
      { id: "e", text: "Reliability" },
    ],
    correct: ["a", "b"],
    explanation:
      "Trusted Advisor checks fall into six categories: cost optimization, performance, security, fault tolerance, service limits, and operational excellence. Service limits and fault tolerance are two of them. Carbon footprint, data residency, and reliability are not among the six Trusted Advisor category names.",
    reference: {
      label: "AWS Trusted Advisor check reference",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor-check-reference.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d4-supportmig-12",
    domain: 4,
    type: "single",
    topic: "AWS Trusted Advisor",
    difficulty: "medium",
    stem: "A company on Basic Support wants the complete set of AWS Trusted Advisor checks across all six categories rather than the limited set its plan provides. What is required?",
    options: [
      { id: "a", text: "Upgrade to a Business or Enterprise support plan." },
      { id: "b", text: "Enable AWS Config in every Region." },
      { id: "c", text: "Subscribe to Trusted Advisor through AWS Marketplace." },
      { id: "d", text: "Open an Enterprise On-Ramp case to unlock the checks." },
    ],
    correct: ["a"],
    explanation:
      "Basic and Developer Support include all checks in the Service limits category plus a small set of specific Security and Fault tolerance checks. The full set of Trusted Advisor checks across all six categories requires a Business or Enterprise support plan. Trusted Advisor is not purchased through Marketplace, and Config addresses configuration recording rather than these checks.",
    reference: {
      label: "AWS Trusted Advisor check reference",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor-check-reference.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-13",
    domain: 4,
    type: "single",
    topic: "AWS Trusted Advisor",
    difficulty: "medium",
    stem: "A team wants Trusted Advisor to warn them when usage of a resource is approaching an AWS service quota so they can request an increase before hitting the ceiling. Which Trusted Advisor category covers this?",
    options: [
      { id: "a", text: "Cost optimization" },
      { id: "b", text: "Service limits" },
      { id: "c", text: "Performance" },
      { id: "d", text: "Security" },
    ],
    correct: ["b"],
    explanation:
      "The Service limits category checks how close your usage is to AWS service quotas so you can act before reaching them. Cost optimization flags underused or idle resources, performance flags configurations that may slow workloads, and security flags exposure such as open ports or public snapshots.",
    reference: {
      label: "AWS Trusted Advisor check reference",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor-check-reference.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-14",
    domain: 4,
    type: "single",
    topic: "AWS re:Post",
    difficulty: "easy",
    stem: "An AWS user wants to ask a technical question and get crowd-sourced, expert-reviewed answers from a community of AWS customers, Partners, and employees, at no cost. Which AWS resource is designed for this?",
    options: [
      { id: "a", text: "AWS re:Post" },
      { id: "b", text: "AWS Marketplace" },
      { id: "c", text: "AWS Trusted Advisor" },
      { id: "d", text: "AWS Whitepapers and Guides" },
    ],
    correct: ["a"],
    explanation:
      "AWS re:Post is a community-driven question-and-answer service that replaced the original AWS Forums. It offers crowd-sourced, expert-reviewed answers and is integrated with AWS Support. Marketplace is a software catalog, Trusted Advisor gives account recommendations, and Whitepapers and Guides are AWS-authored technical content rather than a place to ask a question and get community answers.",
    reference: {
      label: "AWS re:Post",
      url: "https://aws.amazon.com/blogs/aws/aws-repost-a-reimagined-qa-experience-for-the-aws-community/",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-15",
    domain: 4,
    type: "single",
    topic: "AWS Marketplace",
    difficulty: "easy",
    stem: "A company wants to find, buy, and deploy third-party software, including SaaS products, and have the charges appear on its AWS bill. Which AWS offering provides this curated digital catalog?",
    options: [
      { id: "a", text: "AWS Marketplace" },
      { id: "b", text: "AWS re:Post" },
      { id: "c", text: "AWS Activate" },
      { id: "d", text: "AWS Artifact" },
    ],
    correct: ["a"],
    explanation:
      "AWS Marketplace is a curated digital catalog where customers find, buy, deploy, and manage third-party software and services, with charges consolidated on the AWS bill. re:Post is a community Q&A service, Activate is a program that offers credits to startups rather than a software catalog, and Artifact provides on-demand access to AWS compliance reports.",
    reference: {
      label: "AWS Marketplace",
      url: "https://aws.amazon.com/marketplace/",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-16",
    domain: 4,
    type: "single",
    topic: "AWS Partner Network",
    difficulty: "medium",
    stem: "A business wants to engage an outside firm that has proven AWS expertise to help design and build its cloud solution. Which AWS program is the global community of such partners?",
    options: [
      { id: "a", text: "AWS Partner Network" },
      { id: "b", text: "AWS Trusted Advisor" },
      { id: "c", text: "AWS Activate" },
      { id: "d", text: "AWS re:Post" },
    ],
    correct: ["a"],
    explanation:
      "The AWS Partner Network is the global community of organizations that use AWS to build solutions and services for customers, including software (technology) partners and consulting and services partners. Trusted Advisor and re:Post are not partner programs, and Activate is a program for startups rather than a partner community.",
    reference: {
      label: "AWS Partner Network",
      url: "https://aws.amazon.com/partners/",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-17",
    domain: 4,
    type: "single",
    topic: "AWS resources and help",
    difficulty: "easy",
    stem: "An architect wants free, AWS-authored technical guides, reference architecture diagrams, and decision guides to deepen their understanding of designing on AWS. Which resource collection provides these?",
    options: [
      { id: "a", text: "AWS Whitepapers and Guides" },
      { id: "b", text: "AWS Marketplace listings" },
      { id: "c", text: "AWS Trusted Advisor" },
      { id: "d", text: "AWS Health Dashboard" },
    ],
    correct: ["a"],
    explanation:
      "AWS Whitepapers and Guides are technical content authored by AWS and the AWS community, including whitepapers, technical guides, reference material, and reference architecture diagrams, available at no cost. Marketplace lists third-party software, Trusted Advisor checks your account against best practices rather than publishing guides, and the Health Dashboard reports on service events affecting your resources.",
    reference: {
      label: "AWS Whitepapers & Guides",
      url: "https://aws.amazon.com/whitepapers/",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-19",
    domain: 4,
    type: "multi",
    topic: "AWS resources and help",
    difficulty: "medium",
    stem: "Which TWO AWS resources are intended to help customers learn and get answers, rather than to purchase software or detect threats? (Choose two.)",
    options: [
      { id: "a", text: "AWS re:Post" },
      { id: "b", text: "AWS Whitepapers and Guides" },
      { id: "c", text: "AWS Marketplace" },
      { id: "d", text: "Amazon GuardDuty" },
      { id: "e", text: "AWS Shield" },
    ],
    correct: ["a", "b"],
    explanation:
      "AWS re:Post (community Q&A) and AWS Whitepapers and Guides (technical content) are learning and help resources. AWS Marketplace is for buying third-party software, while GuardDuty (threat detection) and Shield (DDoS protection) are security services, not knowledge resources.",
    reference: {
      label: "AWS re:Post",
      url: "https://aws.amazon.com/blogs/aws/aws-repost-a-reimagined-qa-experience-for-the-aws-community/",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-33",
    domain: 4,
    type: "multi",
    topic: "AWS Support plans",
    difficulty: "medium",
    stem: "Which TWO capabilities are available to all AWS customers, including those on the Basic Support plan? (Choose two.)",
    options: [
      { id: "a", text: "Opening account and billing support cases" },
      { id: "b", text: "Requesting a service quota (limit) increase" },
      { id: "c", text: "Opening technical support cases with an engineer" },
      { id: "d", text: "A designated Technical Account Manager" },
      { id: "e", text: "The full set of Trusted Advisor checks" },
    ],
    correct: ["a", "b"],
    explanation:
      "Account and billing cases and service quota increase requests are available to every AWS customer, including Basic Support. Technical support cases require a paid plan, a designated Technical Account Manager is an Enterprise Support feature, and the full set of Trusted Advisor checks requires Business or Enterprise Support.",
    reference: {
      label: "AWS Support case management",
      url: "https://docs.aws.amazon.com/awssupport/latest/user/case-management.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d3-integ-26",
    domain: 4,
    type: "single",
    topic: "AWS Health Dashboard",
    difficulty: "medium",
    stem: "A customer wants a personalized view of AWS events that affect their own resources and accounts, including scheduled changes and ongoing issues, with alerts and guidance. Which AWS service provides this?",
    options: [
      { id: "a", text: "AWS Health Dashboard" },
      { id: "b", text: "Amazon CloudWatch Logs" },
      { id: "c", text: "AWS CloudTrail" },
      { id: "d", text: "AWS Trusted Advisor" },
    ],
    correct: ["a"],
    explanation:
      "The AWS Health Dashboard, powered by AWS Health, gives ongoing visibility into the health of AWS services and your accounts, with personalized alerts and guidance about events and scheduled changes that affect your resources, and it requires no setup. CloudWatch Logs stores log data, CloudTrail records API activity, and Trusted Advisor recommends best-practice improvements rather than reporting AWS events that affect you.",
    reference: {
      label: "What is AWS Health?",
      url: "https://docs.aws.amazon.com/health/latest/ug/what-is-aws-health.html",
    },
    lastVerified: "2026-10-03",
    services: ["AWS Health"],
  },
  {
    id: "d3-integ-27",
    domain: 4,
    type: "single",
    topic: "AWS Health Dashboard",
    difficulty: "hard",
    stem: "An AWS service is reporting elevated error rates, and an operations engineer needs to know whether the disruption affects their specific account and resources, not just the general service status. Which view answers that?",
    options: [
      { id: "a", text: "The \"Your account health\" view of the AWS Health Dashboard" },
      { id: "b", text: "A CloudWatch dashboard of the application's request latency." },
      { id: "c", text: "The CloudTrail Event history of recent API calls." },
      { id: "d", text: "The \"Service health\" view of the AWS Health Dashboard." },
    ],
    correct: ["a"],
    explanation:
      "The \"Your account health\" view of the AWS Health Dashboard shows events specific to your account, so you can see whether an issue affects your own resources. The Service health view shows only public events that are not specific to any account, a CloudWatch latency dashboard shows performance but not AWS-side event impact, and CloudTrail shows API activity.",
    reference: {
      label: "AWS Health Dashboard: Service health and Your account health",
      url: "https://docs.aws.amazon.com/health/latest/ug/aws-health-dashboard-status.html",
    },
    lastVerified: "2026-10-03",
    services: ["AWS Health"],
  },
];
