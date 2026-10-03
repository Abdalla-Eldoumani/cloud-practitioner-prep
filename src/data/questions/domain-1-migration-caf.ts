import type { Question } from "../../lib/types";

// Domain 1: Cloud Concepts, migration and the AWS Cloud Adoption Framework.
// Original practice questions on the CAF perspectives, the migration strategies
// (the 7 Rs), and the migration tooling the exam names, including the AWS Snow
// Family for offline bulk transfer and edge processing. These are not real exam
// items. Every fact is verified against current AWS documentation; each question
// cites the page that backs its answer.
//
// Ids keep their historical d4-supportmig- and d3-db- prefixes deliberately: an
// id is a stable key in a learner's saved progress, so it survives a move
// between files and stays put when a question is retagged to another domain.
export const domain1MigrationCaf: Question[] = [
  {
    id: "d4-supportmig-20",
    domain: 1,
    type: "single",
    topic: "AWS Cloud Adoption Framework",
    difficulty: "easy",
    stem: "The AWS Cloud Adoption Framework (AWS CAF) organizes guidance into six perspectives. Which of the following is one of those perspectives?",
    options: [
      { id: "a", text: "Governance" },
      { id: "b", text: "Networking" },
      { id: "c", text: "Billing" },
      { id: "d", text: "Migration" },
    ],
    correct: ["a"],
    explanation:
      "The six AWS CAF perspectives are Business, People, Governance, Platform, Security, and Operations. Governance is one of them. Networking, Billing, and Migration are not CAF perspectives, though they are addressed within the perspectives where relevant.",
    reference: {
      label: "AWS Cloud Adoption Framework",
      url: "https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/foundational-capabilities.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-21",
    domain: 1,
    type: "multi",
    topic: "AWS Cloud Adoption Framework",
    difficulty: "medium",
    stem: "Which TWO of the following are perspectives of the AWS Cloud Adoption Framework? (Choose two.)",
    options: [
      { id: "a", text: "People" },
      { id: "b", text: "Platform" },
      { id: "c", text: "Pricing" },
      { id: "d", text: "Procurement" },
      { id: "e", text: "Partners" },
    ],
    correct: ["a", "b"],
    explanation:
      "The AWS CAF perspectives are Business, People, Governance, Platform, Security, and Operations. People and Platform are two of them. Pricing, Procurement, and Partners are not CAF perspectives.",
    reference: {
      label: "AWS Cloud Adoption Framework",
      url: "https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/foundational-capabilities.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-22",
    domain: 1,
    type: "single",
    topic: "AWS Cloud Adoption Framework",
    difficulty: "hard",
    stem: "A company adopting the cloud needs to retrain staff, evolve roles, and manage the cultural change that comes with new ways of working. Which AWS Cloud Adoption Framework perspective most directly addresses these concerns?",
    options: [
      { id: "a", text: "Platform perspective" },
      { id: "b", text: "People perspective" },
      { id: "c", text: "Security perspective" },
      { id: "d", text: "Operations perspective" },
    ],
    correct: ["b"],
    explanation:
      "The People perspective addresses culture, organizational structure, roles, and the skills and training needed for cloud adoption. The Platform perspective covers building and modernizing the technology platform, Security covers protecting data and workloads, and Operations covers running and managing services to meet business needs.",
    reference: {
      label: "AWS Cloud Adoption Framework",
      url: "https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/foundational-capabilities.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-23",
    domain: 1,
    type: "single",
    topic: "Migration strategies (7 Rs)",
    difficulty: "easy",
    stem: "A team plans to move an application to AWS by lifting and shifting it to Amazon EC2 with little to no change to its code. Which of the 7 Rs migration strategies is this?",
    options: [
      { id: "a", text: "Refactor" },
      { id: "b", text: "Repurchase" },
      { id: "c", text: "Rehost" },
      { id: "d", text: "Retire" },
    ],
    correct: ["c"],
    explanation:
      "Rehosting, often called lift and shift, moves an application to AWS with little or no change to its code, typically onto Amazon EC2. A refactor re-architects the application using cloud-native features, a repurchase replaces it with a different product such as a SaaS offering, and a retire decommissions an application that is no longer needed.",
    reference: {
      label: "Migration strategies (the 7 Rs)",
      url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-24",
    domain: 1,
    type: "single",
    topic: "Migration strategies (7 Rs)",
    difficulty: "medium",
    stem: "During a migration assessment, a team finds an internal application that no one uses anymore and that provides no business value. Which of the 7 Rs strategies applies?",
    options: [
      { id: "a", text: "Retain" },
      { id: "b", text: "Retire" },
      { id: "c", text: "Replatform" },
      { id: "d", text: "Relocate" },
    ],
    correct: ["b"],
    explanation:
      "Retire means decommissioning an application that is no longer needed, which removes cost and effort from the migration. Retain keeps an application in its current environment for now, replatform makes a few cloud optimizations without re-architecting, and relocate moves infrastructure such as VMware workloads to AWS without changing the applications.",
    reference: {
      label: "Migration strategies (the 7 Rs)",
      url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-25",
    domain: 1,
    type: "single",
    topic: "Migration strategies (7 Rs)",
    difficulty: "medium",
    stem: "A company decides to drop its self-managed email server and adopt a software-as-a-service email product instead, rather than moving the existing server. Which of the 7 Rs strategies is this?",
    options: [
      { id: "a", text: "Rehost" },
      { id: "b", text: "Replatform" },
      { id: "c", text: "Repurchase" },
      { id: "d", text: "Refactor" },
    ],
    correct: ["c"],
    explanation:
      "Repurchasing, sometimes called drop and shop, replaces an existing application with a different product, commonly a SaaS offering. Rehosting would move the existing server as is, replatforming would make small cloud optimizations to it, and refactoring would re-architect it using cloud-native services.",
    reference: {
      label: "Migration strategies (the 7 Rs)",
      url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-26",
    domain: 1,
    type: "multi",
    topic: "Migration strategies (7 Rs)",
    difficulty: "hard",
    stem: "Which TWO of the following are among the 7 Rs migration strategies? (Choose two.)",
    options: [
      { id: "a", text: "Replatform" },
      { id: "b", text: "Relocate" },
      { id: "c", text: "Resell" },
      { id: "d", text: "Replicate" },
      { id: "e", text: "Restore" },
    ],
    correct: ["a", "b"],
    explanation:
      "The 7 Rs are retire, retain, rehost, relocate, repurchase, replatform, and refactor (re-architect). Replatform and relocate are two of them. Resell, replicate, and restore are not migration strategies in this framework.",
    reference: {
      label: "Migration strategies (the 7 Rs)",
      url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-27",
    domain: 1,
    type: "single",
    topic: "Migration tooling",
    difficulty: "medium",
    stem: "A company wants a single place to discover its existing servers, plan a migration, and track the status of each application as it moves to AWS, across whichever migration tools it uses. Which service provides this?",
    options: [
      { id: "a", text: "AWS Migration Hub" },
      { id: "b", text: "AWS Config" },
      { id: "c", text: "AWS Systems Manager" },
      { id: "d", text: "Amazon CloudWatch" },
    ],
    correct: ["a"],
    explanation:
      "AWS Migration Hub provides a single place to discover existing servers, plan migrations, and track the status of each application migration, with visibility across multiple AWS and partner migration tools. Config records resource configurations, Systems Manager operates and manages resources, and CloudWatch monitors metrics and logs. Migration Hub is no longer open to new customers as of November 7, 2025, and AWS points new customers to AWS Transform for similar capabilities, but the exam guide still lists it.",
    reference: {
      label: "What Is AWS Migration Hub?",
      url: "https://docs.aws.amazon.com/migrationhub/latest/ug/whatishub.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d4-supportmig-28",
    domain: 1,
    type: "single",
    topic: "Migration tooling",
    difficulty: "medium",
    stem: "A company wants to rehost (lift and shift) hundreds of physical and virtual servers to run as native Amazon EC2 instances, using continuous replication and an automated cutover. Which service is the primary one AWS recommends for this?",
    options: [
      { id: "a", text: "AWS Database Migration Service (AWS DMS)" },
      { id: "b", text: "AWS Application Migration Service" },
      { id: "c", text: "AWS DataSync" },
      { id: "d", text: "AWS Snowball" },
    ],
    correct: ["b"],
    explanation:
      "AWS Application Migration Service, which AWS now documents as AWS Transform MGN, is AWS's dedicated rehosting capability for lift-and-shift migrations. It converts physical, virtual, or cloud source servers into native Amazon EC2 instances. DMS migrates databases, DataSync moves file and object data over the network, and Snowball is a physical device for offline data transfer.",
    reference: {
      label: "AWS Transform MGN (formerly AWS Application Migration Service)",
      url: "https://aws.amazon.com/application-migration-service/",
    },
    lastVerified: "2026-10-03",
    services: ["Application Migration Service", "EC2"],
  },
  {
    id: "d4-supportmig-29",
    domain: 1,
    type: "single",
    topic: "Migration tooling",
    difficulty: "medium",
    stem: "A team needs to migrate an on-premises database to AWS while keeping the source database fully operational during the migration to minimize downtime. Which service is purpose-built for this?",
    options: [
      { id: "a", text: "AWS Database Migration Service (AWS DMS)" },
      { id: "b", text: "AWS Application Migration Service" },
      { id: "c", text: "Amazon S3 Transfer Acceleration" },
      { id: "d", text: "AWS Migration Hub" },
    ],
    correct: ["a"],
    explanation:
      "AWS Database Migration Service migrates databases to AWS and keeps the source database operational during the migration to minimize downtime. It supports both homogeneous migrations (such as Oracle to Oracle) and heterogeneous migrations between different engines. Application Migration Service, now documented as AWS Transform MGN, rehosts servers, S3 Transfer Acceleration speeds uploads to a bucket, and AWS Migration Hub tracks migration status rather than performing the database move.",
    reference: {
      label: "AWS Database Migration Service",
      url: "https://aws.amazon.com/dms/",
    },
    lastVerified: "2026-10-03",
    services: ["DMS"],
  },
  {
    id: "d4-supportmig-30",
    domain: 1,
    type: "single",
    topic: "Migration tooling",
    difficulty: "medium",
    stem: "A research site has petabytes of data to move to AWS, but its internet connection is too slow to transfer the data in a reasonable time. Which AWS option is designed to move large data sets using physical devices shipped to and from AWS?",
    options: [
      { id: "a", text: "AWS DataSync" },
      { id: "b", text: "The AWS Snow Family" },
      { id: "c", text: "AWS Direct Connect" },
      { id: "d", text: "Amazon S3 Multipart Upload" },
    ],
    correct: ["b"],
    explanation:
      "The AWS Snow Family provides physical devices, such as Snowball Edge, that carry data by being shipped rather than sent over the network, which suits large transfers where the network is too slow or costly. DataSync moves data over the network, Direct Connect is a dedicated network connection rather than a shipped device, and S3 Multipart Upload still relies on the existing internet connection. Snowball Edge is no longer available to new customers, and AWS directs them to AWS DataSync for online transfers or AWS Data Transfer Terminal for physical transfers, but the exam guide still lists the Snow Family.",
    reference: {
      label: "What is Snowball Edge?",
      url: "https://docs.aws.amazon.com/snowball/latest/developer-guide/whatisedge.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d4-supportmig-31",
    domain: 1,
    type: "single",
    topic: "Migration tooling",
    difficulty: "hard",
    stem: "A company wants to move large amounts of data from an on-premises NFS file share to Amazon S3 over its network connection on an automated, scheduled basis, with encryption in transit and integrity checks. Which service fits best?",
    options: [
      { id: "a", text: "AWS DataSync" },
      { id: "b", text: "The AWS Snow Family" },
      { id: "c", text: "AWS Database Migration Service (AWS DMS)" },
      { id: "d", text: "AWS Application Migration Service" },
    ],
    correct: ["a"],
    explanation:
      "AWS DataSync is an online data transfer service that moves data between on-premises storage and AWS storage services over the network, with scheduling, encryption in transit, and data integrity validation. The Snow Family is for offline physical transfer, DMS migrates databases, and Application Migration Service rehosts whole servers rather than moving file data.",
    reference: {
      label: "AWS DataSync",
      url: "https://aws.amazon.com/datasync/",
    },
    lastVerified: "2026-07-29",
    services: ["DataSync", "S3"],
  },
  {
    id: "d4-supportmig-32",
    domain: 1,
    type: "multi",
    topic: "Migration tooling",
    difficulty: "hard",
    stem: "A migration team is selecting tools. Which TWO statements correctly match an AWS service to its primary migration purpose? (Choose two.)",
    options: [
      { id: "a", text: "AWS Application Migration Service rehosts servers to Amazon EC2." },
      { id: "b", text: "AWS Database Migration Service migrates databases while keeping the source operational." },
      { id: "c", text: "AWS Migration Hub physically ships disks to transfer petabytes of data." },
      { id: "d", text: "AWS DataSync replaces an application with a SaaS product." },
      { id: "e", text: "The AWS Snow Family records and evaluates resource configurations." },
    ],
    correct: ["a", "b"],
    explanation:
      "Application Migration Service, now documented as AWS Transform MGN, is AWS's dedicated rehosting capability, and Database Migration Service migrates databases while the source stays operational. Migration Hub tracks migrations rather than shipping disks (that is the Snow Family), DataSync moves data over the network rather than buying a SaaS product (that is the repurchase strategy), and the Snow Family transfers data rather than evaluating configurations (that is AWS Config).",
    reference: {
      label: "AWS Transform MGN (formerly AWS Application Migration Service)",
      url: "https://aws.amazon.com/application-migration-service/",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d4-supportmig-34",
    domain: 1,
    type: "single",
    topic: "AWS Cloud Adoption Framework",
    difficulty: "hard",
    stem: "An organization is defining how it will identify, measure, and manage IT risk during cloud adoption, and how it will maintain compliance and decision-making oversight. Which AWS Cloud Adoption Framework perspective focuses on this?",
    options: [
      { id: "a", text: "Operations perspective" },
      { id: "b", text: "Governance perspective" },
      { id: "c", text: "Business perspective" },
      { id: "d", text: "Platform perspective" },
    ],
    correct: ["b"],
    explanation:
      "The Governance perspective focuses on orchestrating cloud initiatives while maximizing benefits and managing risk, which covers risk management, compliance, and decision oversight. The Business perspective aligns cloud investment with business outcomes, the Platform perspective builds the technology environment, and the Operations perspective runs and supports cloud services.",
    reference: {
      label: "AWS Cloud Adoption Framework",
      url: "https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/foundational-capabilities.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-35",
    domain: 1,
    type: "multi",
    topic: "AWS Cloud Adoption Framework",
    difficulty: "hard",
    stem: "An organization is sorting its cloud-adoption concerns into AWS Cloud Adoption Framework perspectives. Which TWO concerns map to the Operations perspective? (Choose two.)",
    options: [
      { id: "a", text: "Running, monitoring, and supporting cloud workloads to meet agreed service levels" },
      { id: "b", text: "Managing events and incidents and recovering from disruptions" },
      { id: "c", text: "Building the business case and measuring return on cloud investment" },
      { id: "d", text: "Retraining staff and evolving team roles for the cloud" },
      { id: "e", text: "Protecting data confidentiality and controlling access" },
    ],
    correct: ["a", "b"],
    explanation:
      "The Operations perspective covers running and supporting cloud services to the levels the business needs, including event, incident, and problem management. Building the business case sits in the Business perspective, retraining staff sits in the People perspective, and protecting data and access sits in the Security perspective.",
    reference: {
      label: "AWS Cloud Adoption Framework",
      url: "https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/operations-perspective.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d4-supportmig-36",
    domain: 1,
    type: "multi",
    topic: "Migration strategies (7 Rs)",
    difficulty: "medium",
    stem: "A team is classifying applications by migration strategy. Which TWO descriptions correctly match a strategy in the 7 Rs? (Choose two.)",
    options: [
      { id: "a", text: "Rehost is lift and shift with little or no code change." },
      { id: "b", text: "Replatform makes a few cloud optimizations without changing the core architecture." },
      { id: "c", text: "Retire keeps an application in its current environment for now." },
      { id: "d", text: "Refactor replaces an application with a third-party SaaS product." },
      { id: "e", text: "Relocate decommissions an application that is no longer needed." },
    ],
    correct: ["a", "b"],
    explanation:
      "Rehost is lift and shift with little or no code change, and replatform makes a few cloud optimizations (lift, tinker, and shift) without re-architecting. Retire decommissions an unneeded application (not keep it), refactor re-architects with cloud-native services (repurchase is the SaaS swap), and relocate moves infrastructure such as VMware workloads to AWS (not decommission).",
    reference: {
      label: "Migration strategies (the 7 Rs)",
      url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d3-db-10",
    domain: 1,
    type: "single",
    topic: "AWS Snow Family",
    difficulty: "medium",
    stem: "A company must move petabytes of data into AWS from a site with limited network bandwidth, where transferring the data over the internet would be too slow and costly. Which service uses physical devices shipped to and from AWS to perform this transfer?",
    options: [
      { id: "a", text: "The AWS Snow Family, using a Snowball Edge device" },
      { id: "b", text: "AWS Storage Gateway File Gateway" },
      { id: "c", text: "Amazon S3 Transfer Acceleration over the public internet" },
      { id: "d", text: "Amazon EFS" },
    ],
    correct: ["a"],
    explanation:
      "The AWS Snow Family uses physical devices such as Snowball Edge that carry data by being shipped through a carrier rather than sent over the network, which suits large transfers when network bandwidth is limited or online transfer is too slow or costly. Storage Gateway and Transfer Acceleration still move data over the network, and Amazon EFS is a file system, not a data-transfer device. Snowball Edge is no longer available to new customers, and AWS directs them to AWS DataSync for online transfers or AWS Data Transfer Terminal for physical transfers, but the exam guide still lists the Snow Family.",
    reference: {
      label: "What is Snowball Edge?",
      url: "https://docs.aws.amazon.com/snowball/latest/developer-guide/whatisedge.html",
    },
    lastVerified: "2026-10-03",
    services: ["Snow Family"],
  },
  {
    id: "d3-db-11",
    domain: 1,
    type: "single",
    topic: "AWS Snow Family",
    difficulty: "hard",
    stem: "A remote site with little or no network connectivity needs to collect sensor data and run some local processing on it before shipping the data to AWS. Which capability of an AWS Snowball Edge device supports running compute at the edge?",
    options: [
      { id: "a", text: "Snowball Edge can run EC2 instances and Lambda functions on the device." },
      { id: "b", text: "Snowball Edge can only store data and cannot run any processing." },
      { id: "c", text: "Snowball Edge requires a constant high-speed internet connection to function." },
      { id: "d", text: "Snowball Edge is a managed relational database that runs in the cloud." },
    ],
    correct: ["a"],
    explanation:
      "Snowball Edge devices can run Amazon EC2 instances from AMIs and AWS Lambda code on the device to process data at the edge, which is useful in disconnected or remote locations. AWS will discontinue support for Snowball devices in all commercial Regions on December 31, 2026, so learn this as exam knowledge rather than as a service to adopt today. It is not limited to store-only use and it can run processing, so the claim that it cannot is wrong; it is built for places with limited connectivity rather than requiring a constant internet connection, and it is a physical edge and transfer device rather than a cloud database.",
    reference: {
      label: "AWS Snow Family",
      url: "https://aws.amazon.com/snowball/",
    },
    lastVerified: "2026-10-03",
    services: ["Snow Family"],
  },
  {
    id: "d1-mig-01",
    domain: 1,
    type: "single",
    topic: "Migration strategies (7 Rs)",
    difficulty: "medium",
    stem: "A company must move an Amazon RDS DB instance into a different VPC in another AWS account. It will not buy new hardware, rewrite the application, or change how the workload is operated, and the application keeps serving users throughout. Which of the 7 Rs describes this?",
    options: [
      { id: "a", text: "Relocate" },
      { id: "b", text: "Refactor" },
      { id: "c", text: "Repurchase" },
      { id: "d", text: "Retire" },
    ],
    correct: ["a"],
    distractorRationales: {
      b: "Refactor re-architects the application, which is the most complex and costly of the seven, not a move that leaves the design untouched.",
      c: "Repurchase swaps the application for a different product, often software as a service.",
      d: "Retire decommissions an application. This one is still needed.",
    },
    explanation:
      "AWS gives moving an Amazon RDS DB instance to another VPC or AWS account as its own example of the relocate strategy, and says relocate does not require purchasing new hardware, rewriting applications, or modifying existing operations, with the application continuing to serve users during the move. Refactor re-architects the application to take full advantage of cloud-native features, repurchase replaces the application with a different product, and retire decommissions an application that is no longer needed.",
    reference: {
      label: "Migration strategies (the 7 Rs)",
      url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-mig-02",
    domain: 1,
    type: "single",
    topic: "Migration strategies (7 Rs)",
    difficulty: "easy",
    stem: "During a portfolio review, a team finds an application that has to stay in the data center for now because a detailed risk assessment is unfinished, though the team expects to move it in a later wave. Which of the 7 Rs applies?",
    options: [
      { id: "a", text: "Retain" },
      { id: "b", text: "Retire" },
      { id: "c", text: "Rehost" },
      { id: "d", text: "Replatform" },
    ],
    correct: ["a"],
    distractorRationales: {
      b: "Retire is for applications you shut down or archive, not ones you plan to migrate later.",
      c: "Rehost is a lift and shift that has already moved the application to AWS.",
      d: "Replatform also moves the application, adding some optimization on the way.",
    },
    explanation:
      "Retain is the strategy for applications you want to keep in your source environment or are not ready to migrate, and AWS lists a high-risk application that needs a detailed assessment and plan before migration as a common reason, with migration possible in the future. Retire is for applications you decommission or archive, rehost is the lift and shift that moves an application to AWS without changing it, and replatform moves the application while introducing some optimization, such as a managed database.",
    reference: {
      label: "Migration strategies (the 7 Rs)",
      url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-mig-03",
    domain: 1,
    type: "single",
    topic: "AWS Cloud Adoption Framework",
    difficulty: "medium",
    stem: "A CFO and a CIO want assurance that the company's cloud spending accelerates its digital transformation ambitions and business outcomes rather than becoming technology for its own sake. Which AWS Cloud Adoption Framework perspective owns that concern?",
    options: [
      { id: "a", text: "Business" },
      { id: "b", text: "Platform" },
      { id: "c", text: "Operations" },
      { id: "d", text: "People" },
    ],
    correct: ["a"],
    distractorRationales: {
      b: "Platform builds the cloud platform itself and modernizes workloads on it.",
      c: "Operations makes sure the cloud services already running meet what the business needs.",
      d: "People handles culture, structure, leadership, and workforce skills.",
    },
    explanation:
      "AWS says the Business perspective helps ensure that your cloud investments accelerate your digital transformation ambitions and business outcomes, and names the CEO, CFO, COO, CIO, and CTO among its common stakeholders. The Platform perspective builds an enterprise-grade cloud platform and modernizes workloads, the Operations perspective ensures cloud services are delivered at a level that meets the needs of the business, and the People perspective bridges technology and business through culture, organizational structure, leadership, and workforce.",
    reference: {
      label: "AWS CAF: Business perspective",
      url: "https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/business-perspective.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-mig-04",
    domain: 1,
    type: "multi",
    topic: "AWS Cloud Adoption Framework",
    difficulty: "hard",
    stem: "Which TWO statements correctly match an AWS Cloud Adoption Framework perspective to what AWS says it covers? (Choose two.)",
    options: [
      { id: "a", text: "Platform: building an enterprise-grade, scalable, hybrid cloud platform, modernizing existing workloads, and implementing new cloud-native solutions." },
      { id: "b", text: "Security: achieving the confidentiality, integrity, and availability of your data and cloud workloads." },
      { id: "c", text: "People: orchestrating cloud initiatives while maximizing organizational benefits and minimizing transformation-related risks." },
      { id: "d", text: "Operations: ensuring that cloud investments accelerate your digital transformation ambitions and business outcomes." },
      { id: "e", text: "Business: ensuring cloud services are delivered at a level that meets the needs of the business." },
    ],
    correct: ["a", "b"],
    distractorRationales: {
      c: "Orchestrating initiatives while minimizing transformation risk is the Governance perspective, not People.",
      d: "Accelerating digital transformation ambitions and business outcomes is the Business perspective, not Operations.",
      e: "Delivering cloud services at the level the business needs is the Operations perspective, not Business.",
    },
    explanation:
      "AWS describes the Platform perspective as helping you build an enterprise-grade, scalable, hybrid cloud platform, modernize existing workloads, and implement new cloud-native solutions, and the Security perspective as helping you achieve the confidentiality, integrity, and availability of your data and cloud workloads. The other three pairings swap perspectives: orchestrating initiatives while minimizing transformation-related risks belongs to Governance rather than People, accelerating digital transformation ambitions and business outcomes belongs to Business rather than Operations, and ensuring cloud services are delivered at a level that meets the needs of the business belongs to Operations rather than Business.",
    reference: {
      label: "AWS CAF: foundational capabilities and the six perspectives",
      url: "https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/foundational-capabilities.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-mig-05",
    domain: 1,
    type: "single",
    topic: "Migration tooling",
    difficulty: "medium",
    stem: "A team must move an on-premises Oracle database to Amazon Aurora PostgreSQL, a different database engine. Which statement describes what AWS Database Migration Service offers for this migration?",
    options: [
      { id: "a", text: "It works across engines: schema conversion adapts the schema, then DMS moves the data." },
      { id: "b", text: "It supports migrations only where the source and target run an identical database engine." },
      { id: "c", text: "It ships the stored data to AWS on a physical device that AWS loads on arrival." },
      { id: "d", text: "It replaces the database with a software-as-a-service product bought from a vendor." },
    ],
    correct: ["a"],
    distractorRationales: {
      b: "AWS states that DMS supports fully heterogeneous migrations between the supported engines, so an identical engine is not required.",
      c: "Shipping a physical device is the AWS Snow Family, not a database migration service.",
      d: "Buying a replacement product is the repurchase migration strategy, not something a migration service performs.",
    },
    explanation:
      "AWS DMS supports fully heterogeneous data migrations between supported engines. DMS Schema Conversion, or the downloadable AWS Schema Conversion Tool, automatically assesses and converts the source schema to the new target engine, and AWS DMS then migrates the data, either as a one-time migration or by replicating ongoing changes to keep source and target in sync. It is therefore not limited to an identical engine on both sides, it does not ship data on a physical device, and buying a software-as-a-service replacement is the repurchase migration strategy rather than anything AWS DMS does.",
    reference: {
      label: "What is AWS Database Migration Service?",
      url: "https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html",
    },
    lastVerified: "2026-10-03",
    services: ["DMS"],
  },
];
