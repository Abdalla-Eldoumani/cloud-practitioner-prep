import type { ServiceEntry } from "../../lib/types";

// AWS category: Storage. In-scope set: AWS Backup, Amazon EBS, Amazon EFS, AWS
// Elastic Disaster Recovery, Amazon FSx, Amazon S3, Amazon S3 Glacier, AWS
// Storage Gateway (S3 and S3 Glacier both kept as distinct entries). Authored
// against the official in-scope appendix; each entry carries a sourced reference
// and a lastVerified date. Expected ids: see expected-manifest.ts.
export const storage: ServiceEntry[] = [
  {
    id: "aws-backup",
    name: "AWS Backup",
    shortName: "Backup",
    domain: 3,
    category: "Storage",
    purpose:
      "A fully managed service that centralizes and automates backups across AWS services from one place.",
    whenToUse:
      "Reach for it when you want to define backup policies once and apply them consistently across your AWS resources rather than per service.",
    reference: {
      label: "What is AWS Backup?",
      url: "https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html",
    },
    lastVerified: "2026-07-29",
    aliases: ["Backup", "centralized backup", "backup policy"],
    relatedTerms: ["backup", "restore", "data protection", "retention"],
  },
  {
    id: "amazon-ebs",
    name: "Amazon EBS",
    shortName: "EBS",
    domain: 3,
    category: "Storage",
    purpose:
      "Block storage volumes you attach to EC2 instances, behaving like a disk for one instance at a time (Multi-Attach io1 and io2 volumes are the exception).",
    whenToUse:
      "Reach for it when an EC2 instance needs persistent disk storage for a boot volume, a database, or any application that expects a block device.",
    reference: {
      label: "What is Amazon EBS?",
      url: "https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "EBS",
      "Elastic Block Store",
      "block storage",
      "volumes",
      "disk storage",
    ],
    relatedTerms: ["block storage", "volume", "snapshot", "persistent disk"],
    relatedServices: ["amazon-efs", "amazon-s3"],
  },
  {
    id: "amazon-efs",
    name: "Amazon EFS",
    shortName: "EFS",
    domain: 3,
    category: "Storage",
    purpose:
      "A fully managed, elastic file system that many compute instances can mount and share at the same time.",
    whenToUse:
      "Reach for it when multiple instances need shared file storage that grows and shrinks automatically as files are added and removed.",
    reference: {
      label: "What is Amazon Elastic File System?",
      url: "https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "EFS",
      "Elastic File System",
      "file storage",
      "shared file system",
      "NFS",
    ],
    relatedTerms: ["file storage", "shared storage", "mount", "elastic"],
    relatedServices: ["amazon-ebs", "amazon-s3"],
  },
  {
    id: "aws-elastic-disaster-recovery",
    name: "AWS Elastic Disaster Recovery",
    shortName: "AWS DRS",
    domain: 3,
    category: "Storage",
    purpose:
      "A service that replicates your servers into AWS so you can recover applications quickly after an outage or disaster.",
    whenToUse:
      "Reach for it when you need a disaster recovery plan that keeps a low-cost standby in AWS and fails over when your primary site goes down.",
    reference: {
      label: "What is AWS Elastic Disaster Recovery?",
      url: "https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "Elastic Disaster Recovery",
      "AWS DRS",
      "DRS",
      "disaster recovery",
      "failover",
    ],
    relatedTerms: ["disaster recovery", "replication", "failover", "recovery"],
  },
  {
    id: "amazon-fsx",
    name: "Amazon FSx",
    shortName: "FSx",
    domain: 3,
    category: "Storage",
    purpose:
      "Fully managed file storage built on widely used file systems such as Windows File Server, Lustre, NetApp ONTAP, and OpenZFS.",
    whenToUse:
      "Reach for it when you need a managed file system with the features and compatibility of a specific third-party file system.",
    reference: {
      label: "Amazon FSx",
      url: "https://aws.amazon.com/fsx/",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "FSx",
      "managed file system",
      "Windows File Server",
      "Lustre",
      "file storage",
    ],
    relatedTerms: ["file storage", "Windows", "Lustre", "ONTAP", "OpenZFS"],
  },
  {
    id: "amazon-s3",
    name: "Amazon S3",
    shortName: "S3",
    domain: 3,
    category: "Storage",
    purpose:
      "Object storage that holds any amount of data as objects in buckets, reachable over the web.",
    whenToUse:
      "Reach for it when you need durable, scalable storage for files, backups, data lakes, static website assets, or any object you retrieve by key.",
    reference: {
      label: "What is Amazon S3?",
      url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "S3",
      "Simple Storage Service",
      "object storage",
      "buckets",
      "blob storage",
    ],
    relatedTerms: ["object storage", "bucket", "object", "durability"],
    relatedServices: ["amazon-ebs", "amazon-efs"],
  },
  {
    id: "amazon-s3-glacier",
    name: "Amazon S3 Glacier",
    shortName: "S3 Glacier",
    domain: 3,
    category: "Storage",
    purpose:
      "Low-cost Amazon S3 storage classes built for long-term data archiving where retrieval can take longer.",
    whenToUse:
      "Reach for it when you need to keep data for the long term at the lowest storage cost and can accept slower retrieval.",
    reference: {
      label: "Understanding S3 Glacier storage classes for long-term data storage",
      url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/glacier-storage-classes.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "S3 Glacier",
      "Glacier",
      "archive storage",
      "cold storage",
      "long-term archive",
    ],
    relatedTerms: ["archive", "cold storage", "retrieval", "storage class"],
  },
  {
    id: "aws-storage-gateway",
    name: "AWS Storage Gateway",
    shortName: "Storage Gateway",
    domain: 3,
    category: "Storage",
    purpose:
      "A hybrid service that gives on-premises applications access to cloud storage through a local gateway.",
    whenToUse:
      "Reach for it when on-premises systems need to use AWS storage while keeping a local cache for low-latency access.",
    reference: {
      label: "What is AWS Storage Gateway?",
      url: "https://aws.amazon.com/storagegateway/",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "Storage Gateway",
      "hybrid storage",
      "on-premises storage gateway",
    ],
    relatedTerms: ["hybrid", "on-premises", "cache", "cloud storage"],
  },
];
