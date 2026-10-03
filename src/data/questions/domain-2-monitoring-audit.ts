import type { Question } from "../../lib/types";

// Domain 2: Security and Compliance, monitoring and auditing cluster. Original
// practice questions on Amazon CloudWatch, AWS CloudTrail, and choosing between
// them, the services the exam guide names for governance and compliance. These
// are not real exam items. Every fact is verified against current AWS
// documentation; each question cites the page that backs its answer.
//
// Ids keep their historical d3-integ- prefixes deliberately: an id is a stable
// key in a learner's saved progress, so it survives a move between files.
export const domain2MonitoringAudit: Question[] = [
  {
    id: "d3-integ-17",
    domain: 2,
    type: "single",
    topic: "Amazon CloudWatch",
    difficulty: "easy",
    stem: "An operations team wants to collect metrics such as CPU utilization, set alarms that trigger when a threshold is crossed, and view it all on dashboards in near real time. Which AWS service provides this monitoring?",
    options: [
      { id: "a", text: "Amazon CloudWatch" },
      { id: "b", text: "AWS CloudTrail" },
      { id: "c", text: "AWS Config" },
      { id: "d", text: "AWS Organizations" },
    ],
    correct: ["a"],
    explanation:
      "Amazon CloudWatch monitors AWS resources and applications in real time, collecting metrics, raising alarms against thresholds, aggregating logs, and presenting dashboards. CloudTrail records API activity for audit, AWS Config tracks resource configuration and compliance, and AWS Organizations manages multiple accounts.",
    reference: {
      label: "What is Amazon CloudWatch?",
      url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html",
    },
    lastVerified: "2026-07-29",
    services: ["CloudWatch"],
  },
  {
    id: "d3-integ-18",
    domain: 2,
    type: "single",
    topic: "Amazon CloudWatch",
    difficulty: "medium",
    stem: "A CloudWatch alarm is configured on a metric. What does the alarm do when the metric stays above the configured threshold?",
    options: [
      { id: "a", text: "It performs configured actions, such as an SNS notification or Auto Scaling." },
      { id: "b", text: "It deletes the resource that produced the metric." },
      { id: "c", text: "It changes state on the console but cannot notify anyone or take any action." },
      { id: "d", text: "It blocks all network traffic to the account until cleared." },
    ],
    correct: ["a"],
    explanation:
      "A CloudWatch metric alarm watches a metric over a number of time periods and, when the value breaches the threshold, performs one or more specified actions such as notifying an SNS topic or invoking an EC2 or Auto Scaling action. It does not delete resources or cut off account-wide traffic, and it is not limited to changing state on the console, because notifying and acting are exactly what alarm actions do.",
    reference: {
      label: "Using Amazon CloudWatch alarms",
      url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html",
    },
    lastVerified: "2026-10-03",
    services: ["CloudWatch", "SNS"],
  },
  {
    id: "d3-integ-19",
    domain: 2,
    type: "multi",
    topic: "Amazon CloudWatch",
    difficulty: "medium",
    stem: "A team wants to centralize, store, and search log data from AWS services and from their own application running on Amazon EC2. Which TWO statements about Amazon CloudWatch Logs are correct? (Choose two.)",
    options: [
      { id: "a", text: "It can ingest and store logs from AWS services and from applications and servers." },
      { id: "b", text: "It organizes log data into log groups and log streams that you can search." },
      { id: "c", text: "It is the service that records which IAM user made each API call for audit." },
      { id: "d", text: "It provisions the EC2 instances that generate the logs." },
      { id: "e", text: "It replaces the need for any metrics or alarms in CloudWatch." },
    ],
    correct: ["a", "b"],
    explanation:
      "CloudWatch Logs ingests and stores logs from AWS services and from applications and servers, and it organizes them into searchable log groups and streams. Recording who made each API call is AWS CloudTrail, provisioning instances is Amazon EC2, and CloudWatch Logs works alongside metrics and alarms rather than replacing them.",
    reference: {
      label: "What is Amazon CloudWatch? Collect, store, and query logs",
      url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html",
    },
    lastVerified: "2026-07-29",
    services: ["CloudWatch"],
  },
  {
    id: "d3-integ-20",
    domain: 2,
    type: "single",
    topic: "AWS CloudTrail",
    difficulty: "easy",
    stem: "A security team needs a record of every action taken in the account, including who made each API call, what action was taken, and when it happened, for governance and audit. Which AWS service provides this?",
    options: [
      { id: "a", text: "AWS CloudTrail" },
      { id: "b", text: "Amazon CloudWatch" },
      { id: "c", text: "Amazon Inspector" },
      { id: "d", text: "Amazon Quick Sight" },
    ],
    correct: ["a"],
    explanation:
      "AWS CloudTrail records actions taken by a user, role, or AWS service as events, letting you identify who or what took which action, on which resources, and when, for auditing, governance, and compliance. CloudWatch is for performance and operational monitoring, Inspector assesses workloads for vulnerabilities, and Quick Sight is a business intelligence service.",
    reference: {
      label: "What Is AWS CloudTrail?",
      url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
    },
    lastVerified: "2026-07-29",
    services: ["CloudTrail"],
  },
  {
    id: "d3-integ-21",
    domain: 2,
    type: "single",
    topic: "CloudWatch vs CloudTrail",
    difficulty: "medium",
    stem: "Which statement best distinguishes Amazon CloudWatch from AWS CloudTrail?",
    options: [
      { id: "a", text: "CloudWatch monitors performance and health; CloudTrail records API activity for audit." },
      { id: "b", text: "CloudWatch records who made each API call, while CloudTrail collects CPU and memory metrics." },
      { id: "c", text: "Both services do exactly the same thing and are interchangeable." },
      { id: "d", text: "Both are parts of AWS Config for tracking how resources are configured." },
    ],
    correct: ["a"],
    explanation:
      "CloudWatch is for monitoring: metrics, alarms, dashboards, and logs that show how resources and applications are performing. CloudTrail is for auditing: it records API calls and account activity so you can see who took which action and when. The roles are not reversed, the services are not interchangeable, and neither is part of AWS Config, the separate service that records how resources are configured over time.",
    reference: {
      label: "What Is AWS CloudTrail?",
      url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
    },
    lastVerified: "2026-10-03",
    services: ["CloudWatch", "CloudTrail"],
  },
  {
    id: "d3-integ-22",
    domain: 2,
    type: "single",
    topic: "CloudWatch vs CloudTrail",
    difficulty: "hard",
    stem: "An auditor asks, \"Which IAM user terminated this EC2 instance last Tuesday, and from what source IP address?\" Which AWS service answers that question?",
    options: [
      { id: "a", text: "AWS CloudTrail, because it records API calls and who made them." },
      { id: "b", text: "Amazon CloudWatch, because it stores CPU metrics for the instance." },
      { id: "c", text: "AWS Budgets, because it tracks spending thresholds." },
      { id: "d", text: "Amazon SNS, because it sends notifications." },
    ],
    correct: ["a"],
    explanation:
      "CloudTrail records the TerminateInstances API call along with the identity, time, and source IP, so it can identify who took the action and from where. CloudWatch tracks performance metrics rather than who issued an API call, Budgets is for cost thresholds, and SNS only sends notifications.",
    reference: {
      label: "CloudTrail record contents for management, data, and network activity events",
      url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html",
    },
    lastVerified: "2026-07-29",
    services: ["CloudTrail"],
  },
  {
    id: "d3-integ-23",
    domain: 2,
    type: "single",
    topic: "CloudWatch vs CloudTrail",
    difficulty: "hard",
    stem: "A team wants to be paged when average CPU utilization on a fleet of EC2 instances stays above 80 percent for ten minutes. Which AWS service should they use to detect the condition and trigger the alert?",
    options: [
      { id: "a", text: "Amazon CloudWatch, using a metric alarm that notifies an SNS topic." },
      { id: "b", text: "AWS CloudTrail, using its API event history." },
      { id: "c", text: "AWS Config, using a rule that evaluates the instances' configuration." },
      { id: "d", text: "AWS CloudTrail, because it monitors CPU utilization." },
    ],
    correct: ["a"],
    explanation:
      "CloudWatch collects the CPU metric and can raise a metric alarm when the threshold is breached over the specified period, notifying an SNS topic to page the team. CloudTrail records API activity, not resource performance metrics, and AWS Config rules evaluate resource configuration settings rather than live CPU metrics, so neither detects a CPU threshold.",
    reference: {
      label: "What is Amazon CloudWatch?",
      url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html",
    },
    lastVerified: "2026-10-03",
    services: ["CloudWatch", "SNS"],
  },
  {
    id: "d3-integ-24",
    domain: 2,
    type: "multi",
    topic: "CloudWatch vs CloudTrail",
    difficulty: "hard",
    stem: "A company is sorting tasks between Amazon CloudWatch and AWS CloudTrail. Which TWO are correct? (Choose two.)",
    options: [
      { id: "a", text: "Use Amazon CloudWatch to graph metrics and alarm on resource performance and operational health." },
      { id: "b", text: "Use AWS CloudTrail to audit which user or role made a given API call and when." },
      { id: "c", text: "Use AWS CloudTrail to set CPU-utilization alarms that trigger Auto Scaling." },
      { id: "d", text: "Use Amazon CloudWatch as the primary record of who deleted an S3 bucket for a compliance audit." },
      { id: "e", text: "Both services exist only to send marketing emails." },
    ],
    correct: ["a", "b"],
    explanation:
      "CloudWatch graphs metrics and alarms on performance, while CloudTrail audits API activity and the identity behind it. CloudTrail does not set performance alarms or drive Auto Scaling, CloudWatch is not the audit record of who deleted a resource, and neither service sends marketing email.",
    reference: {
      label: "What Is AWS CloudTrail?",
      url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
    },
    lastVerified: "2026-07-29",
    services: ["CloudWatch", "CloudTrail"],
  },
  {
    id: "d3-integ-25",
    domain: 2,
    type: "multi",
    topic: "AWS CloudTrail",
    difficulty: "medium",
    stem: "Which TWO statements about AWS CloudTrail Event history are accurate for a new AWS account? (Choose two.)",
    options: [
      { id: "a", text: "It is available from account creation with no setup." },
      { id: "b", text: "It provides a viewable, searchable record of the past 90 days of management events." },
      { id: "c", text: "It must be purchased separately before any events are recorded." },
      { id: "d", text: "It stores real-time CPU and memory metrics for your instances." },
      { id: "e", text: "It begins recording only after you launch your first EC2 instance." },
    ],
    correct: ["a", "b"],
    explanation:
      "CloudTrail Event history is available automatically when you create an account and provides a viewable, searchable, downloadable record of the past 90 days of management events. It does not have to be purchased separately before events are recorded, it records API activity rather than performance metrics, and it does not depend on first launching EC2.",
    reference: {
      label: "What Is AWS CloudTrail? Event history",
      url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
    },
    lastVerified: "2026-10-03",
    services: ["CloudTrail"],
  },
  {
    id: "d3-integ-32",
    domain: 2,
    type: "single",
    topic: "Choosing a monitoring service",
    difficulty: "medium",
    stem: "A compliance review needs the answer to \"what changed in our account and who changed it\" over the last month, while a separate operations review needs CPU and latency graphs with alarms. Which pairing of services is correct?",
    options: [
      { id: "a", text: "AWS CloudTrail for the account-activity audit, and Amazon CloudWatch for the metrics and alarms." },
      { id: "b", text: "Amazon CloudWatch for the account-activity audit, and AWS CloudTrail for the metrics and alarms." },
      { id: "c", text: "AWS Config for both the metrics graphs and the API alarms." },
      { id: "d", text: "Amazon SNS for the audit trail, and Amazon SQS for the metrics." },
    ],
    correct: ["a"],
    distractorRationales: {
      b: "This reverses the roles; CloudTrail records account activity and CloudWatch provides metrics and alarms, not the other way around.",
      c: "AWS Config tracks configuration state; it does not serve performance metric graphs or CPU and latency alarms.",
      d: "Amazon SNS and SQS are messaging services, not the audit-trail and metrics tools this needs.",
    },
    explanation:
      "CloudTrail answers who changed what and when through its record of API activity, while CloudWatch provides the metrics, graphs, and alarms for operational health. The roles are not reversed, AWS Config tracks configuration state rather than serving performance graphs and API alarms, and SNS and SQS are messaging services, not monitoring or audit tools.",
    reference: {
      label: "What Is AWS CloudTrail?",
      url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
    },
    lastVerified: "2026-07-29",
    services: ["CloudTrail", "CloudWatch"],
  },
  {
    id: "d3-integ-35",
    domain: 2,
    type: "multi",
    topic: "Amazon CloudWatch",
    difficulty: "medium",
    stem: "Which TWO of the following are capabilities of Amazon CloudWatch? (Choose two.)",
    options: [
      { id: "a", text: "Collecting and tracking metrics from AWS resources and applications." },
      { id: "b", text: "Setting alarms that trigger actions when a metric crosses a threshold." },
      { id: "c", text: "Recording every API call with the identity of the caller for audit." },
      { id: "d", text: "Encrypting data at rest with customer managed keys as its primary function." },
      { id: "e", text: "Provisioning and running virtual servers." },
    ],
    correct: ["a", "b"],
    explanation:
      "CloudWatch collects and tracks metrics and lets you set alarms that act when a threshold is breached. Recording API calls with caller identity is CloudTrail's job, encrypting data at rest with customer managed keys as a primary function is AWS KMS, and provisioning virtual servers is Amazon EC2, so those are not CloudWatch capabilities.",
    reference: {
      label: "What is Amazon CloudWatch?",
      url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html",
    },
    lastVerified: "2026-07-29",
    services: ["CloudWatch"],
  },
];
