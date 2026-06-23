import type { ServiceEntry } from "../../lib/types";

// AWS category: Database. In-scope set: Amazon Aurora, Amazon DocumentDB, Amazon
// DynamoDB, Amazon ElastiCache, Amazon Neptune, Amazon RDS. Authored against the
// official in-scope appendix; each entry carries a sourced reference and a
// lastVerified date. Expected ids: see expected-manifest.ts.
export const database: ServiceEntry[] = [
  {
    id: "amazon-aurora",
    name: "Amazon Aurora",
    shortName: "Aurora",
    domain: 3,
    category: "Database",
    purpose:
      "A fully managed relational database compatible with MySQL and PostgreSQL, built for the cloud for high performance and availability.",
    whenToUse:
      "Reach for it when you want a MySQL- or PostgreSQL-compatible relational database with more performance and resilience than a standard engine, fully managed.",
    reference: {
      label: "What is Amazon Aurora?",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "Aurora",
      "relational database",
      "MySQL compatible",
      "PostgreSQL compatible",
    ],
    relatedTerms: ["relational", "MySQL", "PostgreSQL", "managed database"],
  },
  {
    id: "amazon-documentdb",
    name: "Amazon DocumentDB",
    shortName: "DocumentDB",
    domain: 3,
    category: "Database",
    purpose:
      "A fully managed document database service that is compatible with MongoDB for storing and querying JSON-like documents.",
    whenToUse:
      "Reach for it when your application stores data as documents and you want a managed, MongoDB-compatible database to run it.",
    reference: {
      label: "What is Amazon DocumentDB?",
      url: "https://docs.aws.amazon.com/documentdb/latest/devguide/what-is.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "DocumentDB",
      "document database",
      "MongoDB compatible",
      "JSON database",
    ],
    relatedTerms: ["document database", "MongoDB", "documents", "NoSQL"],
  },
  {
    id: "amazon-dynamodb",
    name: "Amazon DynamoDB",
    shortName: "DynamoDB",
    domain: 3,
    category: "Database",
    purpose:
      "A fully managed NoSQL key-value and document database that delivers fast, consistent performance at any scale.",
    whenToUse:
      "Reach for it when you need a serverless NoSQL database with predictable low-latency access and no servers to manage.",
    reference: {
      label: "What is Amazon DynamoDB?",
      url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "DynamoDB",
      "NoSQL",
      "key-value",
      "key-value database",
      "NoSQL key-value",
    ],
    relatedTerms: ["NoSQL", "key-value", "document", "serverless database"],
    relatedServices: ["amazon-rds"],
  },
  {
    id: "amazon-elasticache",
    name: "Amazon ElastiCache",
    shortName: "ElastiCache",
    domain: 3,
    category: "Database",
    purpose:
      "A fully managed in-memory caching service compatible with Redis and Memcached for fast data access.",
    whenToUse:
      "Reach for it when you want to cache frequently accessed data in memory to speed up an application and reduce load on a database.",
    reference: {
      label: "What is Amazon ElastiCache?",
      url: "https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "ElastiCache",
      "in-memory cache",
      "caching",
      "Redis",
      "Memcached",
    ],
    relatedTerms: ["cache", "in-memory", "Redis", "Memcached", "low latency"],
  },
  {
    id: "amazon-neptune",
    name: "Amazon Neptune",
    shortName: "Neptune",
    domain: 3,
    category: "Database",
    purpose:
      "A fully managed graph database service for building applications that work with highly connected data.",
    whenToUse:
      "Reach for it when your data is a network of relationships, such as social connections, recommendations, or fraud graphs, and you query those connections.",
    reference: {
      label: "What is Amazon Neptune?",
      url: "https://docs.aws.amazon.com/neptune/latest/userguide/intro.html",
    },
    lastVerified: "2026-06-24",
    aliases: ["Neptune", "graph database", "connected data"],
    relatedTerms: ["graph database", "relationships", "graph", "connected data"],
  },
  {
    id: "amazon-rds",
    name: "Amazon RDS",
    shortName: "RDS",
    domain: 3,
    category: "Database",
    purpose:
      "A managed relational database service that runs engines such as MySQL, PostgreSQL, MariaDB, Oracle, and SQL Server and handles the administration for you.",
    whenToUse:
      "Reach for it when you need a traditional relational database and want AWS to handle provisioning, patching, and backups instead of running it yourself.",
    reference: {
      label: "What is Amazon RDS?",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html",
    },
    lastVerified: "2026-06-24",
    aliases: [
      "RDS",
      "Relational Database Service",
      "relational database",
      "SQL database",
      "managed database",
    ],
    relatedTerms: ["relational", "SQL", "managed database", "database engine"],
    relatedServices: ["amazon-dynamodb"],
  },
];
