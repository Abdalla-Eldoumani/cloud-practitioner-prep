import type { CompareGroup } from "../../lib/types";

// Side-by-side disambiguation cards for commonly-confused service groups. Each
// group's serviceIds reference real ServiceEntry ids (single-sourced names and
// doc links); every row's cells are keyed by service id, never column position,
// so a responsive reorder cannot desync a cell from its service. The catalog
// lint validates referential integrity (every serviceId resolves) and per-row
// cell coverage (every row carries a cell for every member).
//
// The four attribute rows are fixed and shared across every card: What it is /
// You manage / Best for / Watch out for. Cells are kept to one or two short
// sentences so the stacked mobile layout stays legible.
//
// Security group vs Network ACL is the one comparison NOT modelled here: both
// are VPC features, not standalone in-scope services, so neither has a
// ServiceEntry id to key on. It ships as a static, hand-built table in
// catalog.astro (keyed on plain concept labels) so this array stays fully
// id-resolved and the lint stays green without a concept-key exception.
//
// The RDS vs DynamoDB vs Redshift group's serviceIds is the sole place those
// three ids are linked: the content files authored amazon-rds/amazon-dynamodb
// (one batch) and amazon-redshift (another) with no cross-batch relatedServices,
// so this card is where the relational/NoSQL/warehouse set is wired together.
const VERIFIED = "2026-06-24";

export const COMPARE_GROUPS: CompareGroup[] = [
  {
    id: "cloudtrail-vs-cloudwatch-vs-config",
    title: "CloudTrail vs CloudWatch vs Config",
    framing:
      "three records of your account — who did what, how it is performing, and how it is configured.",
    serviceIds: ["aws-cloudtrail", "amazon-cloudwatch", "aws-config"],
    rows: [
      {
        axis: "What it is",
        cells: {
          "aws-cloudtrail":
            "A log of the API calls and account activity — who did what, when, and from where.",
          "amazon-cloudwatch":
            "A monitoring service for metrics, logs, alarms, and dashboards of how resources are performing.",
          "aws-config":
            "A record of resource configurations over time, with rules that flag non-compliant settings.",
        },
      },
      {
        axis: "You manage",
        cells: {
          "aws-cloudtrail":
            "Which trails to keep and where to store the event history; the recording itself is managed.",
          "amazon-cloudwatch":
            "The metrics, log groups, alarms, and dashboards you choose to collect and watch.",
          "aws-config":
            "Which resource types to record and which config rules to evaluate them against.",
        },
      },
      {
        axis: "Best for",
        cells: {
          "aws-cloudtrail":
            "Security and audit questions: tracing an action back to an identity.",
          "amazon-cloudwatch":
            "Operational health: alerting on a metric, watching logs, seeing performance trends.",
          "aws-config":
            "Configuration and compliance: proving a resource stayed within an approved state.",
        },
      },
      {
        axis: "Watch out for",
        cells: {
          "aws-cloudtrail":
            "It records activity, not performance — it will not tell you a server is slow.",
          "amazon-cloudwatch":
            "It watches metrics and logs, not the identity behind an API call.",
          "aws-config":
            "It tracks configuration state and compliance, not API activity or live metrics.",
        },
      },
    ],
    lastVerified: VERIFIED,
  },
  {
    id: "guardduty-vs-inspector-vs-macie-vs-detective",
    title: "GuardDuty vs Inspector vs Macie vs Detective",
    framing:
      "four security services that each find — or investigate — a different kind of problem.",
    serviceIds: [
      "amazon-guardduty",
      "amazon-inspector",
      "amazon-macie",
      "amazon-detective",
    ],
    rows: [
      {
        axis: "What it is",
        cells: {
          "amazon-guardduty":
            "Continuous threat detection that finds malicious or unauthorized activity from account and network logs.",
          "amazon-inspector":
            "Automated vulnerability assessment that finds software flaws and unintended network exposure.",
          "amazon-macie":
            "Sensitive-data discovery that finds and classifies things like PII in Amazon S3.",
          "amazon-detective":
            "Investigation that links findings and events over time to analyze a root cause.",
        },
      },
      {
        axis: "You manage",
        cells: {
          "amazon-guardduty":
            "Turning it on and triaging findings; it analyzes the log sources for you.",
          "amazon-inspector":
            "Which workloads to scan; it runs the assessments and scores the findings.",
          "amazon-macie":
            "Which S3 buckets to scan and the data-type rules; it does the classification.",
          "amazon-detective":
            "Nothing to scan — you explore the linked event graph it builds from your findings.",
        },
      },
      {
        axis: "Best for",
        cells: {
          "amazon-guardduty":
            "Catching active threats like unusual API calls or traffic to known-bad hosts.",
          "amazon-inspector":
            "Knowing what to patch on your compute before an attacker exploits it.",
          "amazon-macie":
            "Knowing where sensitive data lives so you can protect it.",
          "amazon-detective":
            "Understanding the story behind an alert: what led to it and what it touched.",
        },
      },
      {
        axis: "Watch out for",
        cells: {
          "amazon-guardduty":
            "It detects threats; it does not scan for software vulnerabilities or classify data.",
          "amazon-inspector":
            "It assesses vulnerabilities; it does not detect live threats or investigate incidents.",
          "amazon-macie":
            "It is about data sensitivity, not threat detection or vulnerability scanning.",
          "amazon-detective":
            "It investigates existing findings; it is not itself a detector that raises them.",
        },
      },
    ],
    lastVerified: VERIFIED,
  },
  {
    id: "sqs-vs-sns-vs-eventbridge",
    title: "SQS vs SNS vs EventBridge",
    framing:
      "three ways to move messages between parts of a system — a queue, a broadcast, and an event bus.",
    serviceIds: ["amazon-sqs", "amazon-sns", "amazon-eventbridge"],
    rows: [
      {
        axis: "What it is",
        cells: {
          "amazon-sqs":
            "A managed message queue: one sender, one consumer that pulls each message when ready.",
          "amazon-sns":
            "A managed pub/sub topic: one message pushed (fanned out) to many subscribers at once.",
          "amazon-eventbridge":
            "An event bus that routes events to targets using rules that match the event content.",
        },
      },
      {
        axis: "You manage",
        cells: {
          "amazon-sqs":
            "Queues and how consumers poll them; messages wait until something processes them.",
          "amazon-sns":
            "Topics and their subscribers; the service pushes each message to all of them.",
          "amazon-eventbridge":
            "Buses and routing rules that filter and send events to the right targets.",
        },
      },
      {
        axis: "Best for",
        cells: {
          "amazon-sqs":
            "Decoupling work so a slow consumer can process at its own pace without losing messages.",
          "amazon-sns":
            "Notifying many endpoints of the same event at the same time (fan-out).",
          "amazon-eventbridge":
            "Routing events between AWS services and apps based on content, with many built-in sources.",
        },
      },
      {
        axis: "Watch out for",
        cells: {
          "amazon-sqs":
            "A consumer must pull messages; nothing is pushed and there is no fan-out on its own.",
          "amazon-sns":
            "Subscribers must handle the push; if one is down it can miss the broadcast.",
          "amazon-eventbridge":
            "It routes by rules, not a simple queue or a plain broadcast — more capable, more to configure.",
        },
      },
    ],
    lastVerified: VERIFIED,
  },
  {
    id: "shield-vs-waf",
    title: "Shield vs WAF",
    framing:
      "two edge protections at different layers — blunt-force DDoS defense vs precise web-request filtering.",
    serviceIds: ["aws-shield", "aws-waf"],
    rows: [
      {
        axis: "What it is",
        cells: {
          "aws-shield":
            "DDoS protection that absorbs and mitigates volumetric attacks on your applications.",
          "aws-waf":
            "A web application firewall that inspects and filters individual HTTP/HTTPS requests by rules.",
        },
      },
      {
        axis: "You manage",
        cells: {
          "aws-shield":
            "Little for common protection (it is on by default); Advanced adds response support and reporting.",
          "aws-waf":
            "The rules: which requests to allow, block, or rate-limit (for example SQL injection or bad IPs).",
        },
      },
      {
        axis: "Best for",
        cells: {
          "aws-shield":
            "Staying available when an attacker floods you with traffic to knock the service offline.",
          "aws-waf":
            "Blocking malicious request patterns like SQL injection, cross-site scripting, or scrapers.",
        },
      },
      {
        axis: "Watch out for",
        cells: {
          "aws-shield":
            "It defends against floods; it does not inspect request content for application-layer attacks.",
          "aws-waf":
            "It filters requests by rule; it does not by itself absorb a large-scale DDoS flood.",
        },
      },
    ],
    lastVerified: VERIFIED,
  },
  {
    id: "organizations-vs-control-tower",
    title: "Organizations vs Control Tower",
    framing:
      "the building block for many accounts vs the guided, governed setup built on top of it.",
    serviceIds: ["aws-organizations", "aws-control-tower"],
    rows: [
      {
        axis: "What it is",
        cells: {
          "aws-organizations":
            "Central management of many AWS accounts, with consolidated billing and service control policies.",
          "aws-control-tower":
            "An opinionated way to set up and govern a secure multi-account landing zone, built on Organizations.",
        },
      },
      {
        axis: "You manage",
        cells: {
          "aws-organizations":
            "The account structure, organizational units, and the SCP guardrails yourself.",
          "aws-control-tower":
            "Less by hand: it provisions accounts and applies pre-built guardrails and a baseline for you.",
        },
      },
      {
        axis: "Best for",
        cells: {
          "aws-organizations":
            "Grouping accounts and setting permission boundaries when you want full manual control.",
          "aws-control-tower":
            "Standing up a well-architected multi-account environment quickly with best practices baked in.",
        },
      },
      {
        axis: "Watch out for",
        cells: {
          "aws-organizations":
            "It is the toolbox, not a finished setup; you design the governance yourself.",
          "aws-control-tower":
            "It uses Organizations underneath — it adds automation and guardrails, it does not replace it.",
        },
      },
    ],
    lastVerified: VERIFIED,
  },
  {
    id: "trusted-advisor-vs-well-architected-tool",
    title: "Trusted Advisor vs Well-Architected Tool",
    framing:
      "live automated checks of your account vs a structured, manual review of a workload.",
    serviceIds: ["aws-trusted-advisor", "aws-well-architected-tool"],
    rows: [
      {
        axis: "What it is",
        cells: {
          "aws-trusted-advisor":
            "Automated checks that inspect your account and recommend fixes for cost, security, and more.",
          "aws-well-architected-tool":
            "A guided review where you answer questions about a workload against the Well-Architected pillars.",
        },
      },
      {
        axis: "You manage",
        cells: {
          "aws-trusted-advisor":
            "Reviewing the live findings and acting on them; the checks run automatically.",
          "aws-well-architected-tool":
            "Working through the questionnaire yourself; it produces a plan, it does not scan resources.",
        },
      },
      {
        axis: "Best for",
        cells: {
          "aws-trusted-advisor":
            "Spotting concrete issues right now, like idle resources or open security groups.",
          "aws-well-architected-tool":
            "Stepping back to assess a workload's design and track improvements over time.",
        },
      },
      {
        axis: "Watch out for",
        cells: {
          "aws-trusted-advisor":
            "It checks your account live; it is not a design-review framework.",
          "aws-well-architected-tool":
            "It is a self-assessment of design, not an automatic scanner of your running resources.",
        },
      },
    ],
    lastVerified: VERIFIED,
  },
  {
    id: "ec2-vs-lambda-vs-fargate",
    title: "EC2 vs Lambda vs Fargate",
    framing:
      "three ways to run code, from a full server you manage to no servers at all.",
    serviceIds: ["amazon-ec2", "aws-lambda", "aws-fargate"],
    rows: [
      {
        axis: "What it is",
        cells: {
          "amazon-ec2":
            "Virtual servers (instances) you size, configure, and run for as long as you keep them on.",
          "aws-lambda":
            "Serverless functions that run your code on demand in response to an event, then stop.",
          "aws-fargate":
            "A serverless engine that runs containers for ECS or EKS without managing the servers.",
        },
      },
      {
        axis: "You manage",
        cells: {
          "amazon-ec2":
            "The instance: operating system, patching, scaling, and capacity.",
          "aws-lambda":
            "Just the code and its configuration; AWS runs and scales it for you.",
          "aws-fargate":
            "The container and its task definition; AWS runs the underlying compute.",
        },
      },
      {
        axis: "Best for",
        cells: {
          "amazon-ec2":
            "Full control, long-running workloads, or software that needs a specific OS or instance type.",
          "aws-lambda":
            "Short, event-driven tasks and glue code where you pay only while it runs.",
          "aws-fargate":
            "Running containers without operating a cluster of servers to host them.",
        },
      },
      {
        axis: "Watch out for",
        cells: {
          "amazon-ec2":
            "You own the OS and scaling; a server keeps costing money while it is running.",
          "aws-lambda":
            "Built for short tasks with a run-time limit; not for long-running or stateful processes.",
          "aws-fargate":
            "You still build and run containers — it removes the servers, not the container work.",
        },
      },
    ],
    lastVerified: VERIFIED,
  },
  {
    id: "s3-vs-ebs-vs-efs",
    title: "S3 vs EBS vs EFS",
    framing:
      "object vs block vs file — three storage shapes for three different jobs.",
    serviceIds: ["amazon-s3", "amazon-ebs", "amazon-efs"],
    rows: [
      {
        axis: "What it is",
        cells: {
          "amazon-s3":
            "Object storage for files (objects) retrieved over the web by key, at massive scale.",
          "amazon-ebs":
            "Block storage volumes you attach to a single EC2 instance, like a virtual hard drive.",
          "amazon-efs":
            "A shared file system many Linux instances can mount and read or write at the same time.",
        },
      },
      {
        axis: "You manage",
        cells: {
          "amazon-s3":
            "Buckets, object keys, and access; capacity grows automatically as you add objects.",
          "amazon-ebs":
            "The volume size and type, and attaching it to an instance.",
          "amazon-efs":
            "The file system and mount targets; capacity grows and shrinks automatically.",
        },
      },
      {
        axis: "Best for",
        cells: {
          "amazon-s3":
            "Backups, media, data lakes, static assets — anything addressed as whole objects.",
          "amazon-ebs":
            "A boot disk or database storage for one EC2 instance that needs low-latency block access.",
          "amazon-efs":
            "Shared files that several instances need to access at once.",
        },
      },
      {
        axis: "Watch out for",
        cells: {
          "amazon-s3":
            "It is object storage over an API; you do not mount it as a regular disk.",
          "amazon-ebs":
            "A volume attaches to one instance in one Availability Zone — it is not shared storage.",
          "amazon-efs":
            "Shared file access is its purpose; it is not for object retrieval or single-instance block disks.",
        },
      },
    ],
    lastVerified: VERIFIED,
  },
  {
    id: "rds-vs-dynamodb-vs-redshift",
    title: "RDS vs DynamoDB vs Redshift",
    framing:
      "relational vs NoSQL vs data warehouse — three database shapes for three workloads.",
    serviceIds: ["amazon-rds", "amazon-dynamodb", "amazon-redshift"],
    rows: [
      {
        axis: "What it is",
        cells: {
          "amazon-rds":
            "A managed relational database (engines like MySQL or PostgreSQL) with tables, rows, and SQL.",
          "amazon-dynamodb":
            "A managed NoSQL key-value and document database built for fast lookups at any scale.",
          "amazon-redshift":
            "A managed data warehouse for running analytics across very large datasets.",
        },
      },
      {
        axis: "You manage",
        cells: {
          "amazon-rds":
            "The engine choice and size; AWS handles backups, patching, and failover.",
          "amazon-dynamodb":
            "Tables and keys; there are no servers to run and it scales for you.",
          "amazon-redshift":
            "The warehouse and how data is loaded; AWS runs the clusters behind it.",
        },
      },
      {
        axis: "Best for",
        cells: {
          "amazon-rds":
            "Transactional apps that need relationships, joins, and SQL queries.",
          "amazon-dynamodb":
            "High-traffic apps that need single-digit-millisecond reads and writes by key.",
          "amazon-redshift":
            "Business intelligence and reporting over large volumes of historical data.",
        },
      },
      {
        axis: "Watch out for",
        cells: {
          "amazon-rds":
            "It is for transactions, not large-scale analytics; very large reporting belongs in Redshift.",
          "amazon-dynamodb":
            "It is key-value, not relational; it does not do SQL joins across tables.",
          "amazon-redshift":
            "It is built for analytics (OLAP), not the fast single-record reads and writes of an app.",
        },
      },
    ],
    lastVerified: VERIFIED,
  },
];
