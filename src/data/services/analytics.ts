import type { ServiceEntry } from "../../lib/types";

// AWS category: Analytics. In-scope set: Amazon Athena, Amazon EMR, AWS Glue,
// Amazon Kinesis, Amazon OpenSearch Service, Amazon QuickSight, Amazon Redshift.
// Authored against the official in-scope appendix; each entry carries a sourced
// reference and a lastVerified date. Expected ids: see expected-manifest.ts.
//
// Amazon Redshift uses the canonical slug "amazon-redshift" so the compare card
// for relational-vs-NoSQL-vs-warehouse can key on it. It carries no
// relatedServices to the relational/NoSQL databases: those entries live in a
// separate category file authored in parallel, so a cross-file reference here
// would not resolve when this file's lint runs. The cross-group linkage lives in
// the compare group, not in relatedServices.
export const analytics: ServiceEntry[] = [
  {
    id: "amazon-athena",
    name: "Amazon Athena",
    shortName: "Athena",
    domain: 3,
    category: "Analytics",
    purpose:
      "A serverless, interactive query service that analyzes data directly in Amazon S3 using standard SQL.",
    whenToUse:
      "Reach for it when you want to run SQL queries over data sitting in Amazon S3 without setting up or managing any servers.",
    reference: {
      label: "What is Amazon Athena?",
      url: "https://docs.aws.amazon.com/athena/latest/ug/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Athena",
      "query S3 with SQL",
      "serverless query",
      "SQL on S3",
    ],
    relatedTerms: ["SQL", "query", "serverless", "Amazon S3"],
  },
  {
    id: "amazon-emr",
    name: "Amazon EMR",
    shortName: "EMR",
    domain: 3,
    category: "Analytics",
    purpose:
      "A managed big data platform for running open-source frameworks such as Apache Spark and Apache Hadoop to process large datasets.",
    whenToUse:
      "Reach for it when you need to process very large datasets with big data frameworks like Spark or Hadoop without managing the clusters yourself.",
    reference: {
      label: "What is Amazon EMR?",
      url: "https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-what-is-emr.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "EMR",
      "big data",
      "Hadoop",
      "Spark",
      "big data Hadoop Spark",
    ],
    relatedTerms: ["big data", "Hadoop", "Spark", "cluster"],
  },
  {
    id: "aws-glue",
    name: "AWS Glue",
    shortName: "Glue",
    domain: 3,
    category: "Analytics",
    purpose:
      "A serverless data integration service that discovers, prepares, and combines data for analytics, including extract, transform, and load work.",
    whenToUse:
      "Reach for it when you need to catalog your data and run ETL jobs to clean and move it between stores without provisioning servers.",
    reference: {
      label: "What is AWS Glue?",
      url: "https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Glue",
      "ETL",
      "data catalog",
      "data integration",
      "extract transform load",
    ],
    relatedTerms: ["ETL", "data catalog", "data integration", "data pipeline"],
  },
  {
    id: "amazon-kinesis",
    name: "Amazon Kinesis",
    shortName: "Kinesis",
    domain: 3,
    category: "Analytics",
    purpose:
      "A service for collecting, processing, and analyzing streaming data in real time.",
    whenToUse:
      "Reach for it when you need to ingest and process continuous streams of data, such as logs, clickstreams, or telemetry, as they arrive.",
    reference: {
      label: "What is Amazon Kinesis Data Streams?",
      url: "https://docs.aws.amazon.com/streams/latest/dev/introduction.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Kinesis",
      "streaming data",
      "real-time streaming",
      "data streams",
    ],
    relatedTerms: ["streaming", "real time", "ingestion", "data streams"],
  },
  {
    id: "amazon-opensearch-service",
    name: "Amazon OpenSearch Service",
    shortName: "OpenSearch",
    domain: 3,
    category: "Analytics",
    purpose:
      "A managed service to deploy and run OpenSearch for search, log analytics, and observability on your data.",
    whenToUse:
      "Reach for it when you want to search, explore, and visualize logs or other data, such as for application monitoring and troubleshooting.",
    reference: {
      label: "What is Amazon OpenSearch Service?",
      url: "https://docs.aws.amazon.com/opensearch-service/latest/developerguide/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "OpenSearch",
      "search and log analytics",
      "log analytics",
      "search",
    ],
    relatedTerms: ["search", "log analytics", "observability", "logs"],
  },
  {
    id: "amazon-quicksight",
    name: "Amazon QuickSight",
    shortName: "QuickSight",
    domain: 3,
    category: "Analytics",
    purpose:
      "A cloud-scale business intelligence service for building interactive dashboards and visualizations from your data.",
    whenToUse:
      "Reach for it when you want to turn your data into dashboards and reports that people across an organization can explore.",
    reference: {
      label: "What is Amazon QuickSight?",
      url: "https://docs.aws.amazon.com/quicksight/latest/user/welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "QuickSight",
      "BI dashboards",
      "business intelligence",
      "dashboards",
      "data visualization",
    ],
    relatedTerms: [
      "business intelligence",
      "dashboards",
      "visualization",
      "reports",
    ],
  },
  {
    id: "amazon-redshift",
    name: "Amazon Redshift",
    shortName: "Redshift",
    domain: 3,
    category: "Analytics",
    purpose:
      "A fully managed, petabyte-scale cloud data warehouse for running analytics across large amounts of structured data.",
    whenToUse:
      "Reach for it when you need to run complex analytical queries over large volumes of structured data in a data warehouse.",
    reference: {
      label: "What is Amazon Redshift?",
      url: "https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Redshift",
      "data warehouse",
      "warehouse",
      "analytics database",
      "OLAP",
    ],
    relatedTerms: ["data warehouse", "analytics", "OLAP", "structured data"],
  },
];
