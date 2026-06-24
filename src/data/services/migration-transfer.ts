import type { ServiceEntry } from "../../lib/types";

// AWS category: Migration and Transfer. In-scope set: AWS Application Discovery
// Service, AWS Application Migration Service, AWS DMS, Migration Evaluator, AWS
// Migration Hub, AWS Schema Conversion Tool, AWS Snow Family. All tagged D3
// (Cloud Technology and Services). Acronyms (DMS, SCT) are carried as aliases.
// Snow Family is described as the physical data-transfer device family without
// quoting specific device capacities (those are version-dependent and unsourced
// here). Authored against the official in-scope appendix; each entry carries a
// sourced reference and a lastVerified date. Expected ids: see
// expected-manifest.ts.
export const migrationTransfer: ServiceEntry[] = [
  {
    id: "aws-application-discovery-service",
    name: "AWS Application Discovery Service",
    shortName: "Application Discovery Service",
    domain: 3,
    category: "Migration and Transfer",
    purpose:
      "A service that gathers information about your on-premises servers and applications to help you plan a migration to AWS.",
    whenToUse:
      "Reach for it at the start of a migration when you need to inventory your existing data center and understand server usage and dependencies before moving.",
    reference: {
      label: "What is AWS Application Discovery Service?",
      url: "https://docs.aws.amazon.com/application-discovery/latest/userguide/what-is-appdiscovery.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Application Discovery Service",
      "discovery",
      "migration discovery",
      "server inventory",
    ],
    relatedTerms: ["discovery", "inventory", "migration planning", "dependencies"],
  },
  {
    id: "aws-application-migration-service",
    name: "AWS Application Migration Service",
    shortName: "MGN",
    domain: 3,
    category: "Migration and Transfer",
    purpose:
      "A service that automates the rehosting, or lift and shift, of your servers to AWS by replicating them and converting them to run natively on AWS.",
    whenToUse:
      "Reach for it when you want to move existing applications to AWS with minimal changes by lifting and shifting whole servers rather than rebuilding them.",
    reference: {
      label: "What is AWS Application Migration Service?",
      url: "https://docs.aws.amazon.com/mgn/latest/ug/what-is-mgn.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Application Migration Service",
      "MGN",
      "lift and shift",
      "rehost",
      "server migration",
    ],
    relatedTerms: ["lift and shift", "rehost", "replication", "migration"],
  },
  {
    id: "aws-dms",
    name: "AWS Database Migration Service",
    shortName: "DMS",
    domain: 3,
    category: "Migration and Transfer",
    purpose:
      "A service that helps you migrate databases to AWS, keeping the source database operational during the migration to minimize downtime.",
    whenToUse:
      "Reach for it when you need to move a database to AWS, whether to the same engine or a different one, while keeping the application running through the move.",
    reference: {
      label: "What is AWS Database Migration Service?",
      url: "https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "DMS",
      "Database Migration Service",
      "database migration",
      "migrate database",
    ],
    relatedTerms: ["database migration", "replication", "downtime", "migration"],
  },
  {
    id: "migration-evaluator",
    name: "Migration Evaluator",
    shortName: "Migration Evaluator",
    domain: 3,
    category: "Migration and Transfer",
    purpose:
      "A service that builds a data-driven business case for migrating to AWS by analyzing your current on-premises footprint and projecting costs on AWS.",
    whenToUse:
      "Reach for it when you need to justify a migration with cost projections, comparing what you spend on-premises today against an estimated AWS cost.",
    reference: {
      label: "Migration Evaluator",
      url: "https://aws.amazon.com/migration-evaluator/",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Migration Evaluator",
      "business case",
      "cost projection",
      "migration assessment",
    ],
    relatedTerms: ["business case", "cost projection", "assessment", "planning"],
  },
  {
    id: "aws-migration-hub",
    name: "AWS Migration Hub",
    shortName: "Migration Hub",
    domain: 3,
    category: "Migration and Transfer",
    purpose:
      "A service that gives you a single place to discover, plan, and track the progress of application migrations across multiple AWS migration tools.",
    whenToUse:
      "Reach for it when a migration spans several tools and you want one dashboard to follow the status of each application as it moves to AWS.",
    reference: {
      label: "What is AWS Migration Hub?",
      url: "https://docs.aws.amazon.com/migrationhub/latest/ug/whatishub.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Migration Hub",
      "migration tracking",
      "migration dashboard",
      "track migrations",
    ],
    relatedTerms: ["migration tracking", "dashboard", "progress", "planning"],
  },
  {
    id: "aws-schema-conversion-tool",
    name: "AWS Schema Conversion Tool",
    shortName: "SCT",
    domain: 3,
    category: "Migration and Transfer",
    purpose:
      "A tool that converts a database schema from one database engine to another, so you can move a database to a different engine on AWS.",
    whenToUse:
      "Reach for it alongside a database migration when the source and target run different database engines and the schema must be converted to fit the new engine.",
    reference: {
      label: "What is the AWS Schema Conversion Tool?",
      url: "https://docs.aws.amazon.com/SchemaConversionTool/latest/userguide/CHAP_Welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "SCT",
      "Schema Conversion Tool",
      "schema conversion",
      "convert database schema",
    ],
    relatedTerms: ["schema conversion", "database engine", "migration", "conversion"],
  },
  {
    id: "aws-snow-family",
    name: "AWS Snow Family",
    shortName: "Snow Family",
    domain: 3,
    category: "Migration and Transfer",
    purpose:
      "A family of physical devices you can use to move large amounts of data into and out of AWS offline, when transferring over a network would be too slow or impractical.",
    whenToUse:
      "Reach for it when you have so much data, or such limited bandwidth, that shipping it on a physical device is faster and cheaper than sending it over the internet.",
    reference: {
      label: "What is the AWS Snow Family?",
      url: "https://docs.aws.amazon.com/snowball/latest/developer-guide/whatisedge.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Snow Family",
      "Snowball",
      "offline data transfer",
      "physical data transfer",
      "data transfer devices",
    ],
    relatedTerms: ["offline transfer", "physical devices", "bandwidth", "data migration"],
  },
];
