// The machine-readable in-scope manifest: the exact slug-id set the catalog is
// expected to contain, grouped by AWS category. This is the single source of
// truth the content plans author against and the catalog lint asserts
// completeness against (the CAT-01 mechanical guard, analogous to the question
// bank's DOMAIN_QUESTION_FLOORS). A missing in-scope id AND an unexpected/extra
// id both hard-fail the lint once content exists.
//
// Derived from the official CLF-C02 in-scope-services appendix (19 categories,
// 115 listed services/features), with these collapsing decisions applied
// uniformly (also documented in this directory's CLAUDE.md):
//   - The VPN trio (AWS VPN + AWS Site-to-Site VPN + AWS Client VPN) collapses
//     to one entry, "aws-vpn", which covers the Site-to-Site and Client variants.
//   - AWS Management Console and AWS CLI are access tools, not services, but are
//     exam-named, so each is kept as an entry.
//   - Amazon S3 and Amazon S3 Glacier are distinct entries; both are kept.
//
// Slug convention: the natural lowercase id form the content plans author
// (provider prefix + hyphenated name), e.g. "amazon-ec2", "aws-lambda",
// "amazon-s3", "amazon-s3-glacier". The manifest and the authored ids must match
// exactly.

export const EXPECTED_SERVICE_IDS: Record<string, string[]> = {
  Analytics: [
    "amazon-athena",
    "amazon-emr",
    "aws-glue",
    "amazon-kinesis",
    "amazon-opensearch-service",
    "amazon-quicksight",
    "amazon-redshift",
  ],
  "Application Integration": [
    "amazon-eventbridge",
    "amazon-sns",
    "amazon-sqs",
    "aws-step-functions",
  ],
  "Business Applications": ["amazon-connect", "amazon-ses"],
  "Cloud Financial Management": [
    "aws-budgets",
    "aws-cost-and-usage-report",
    "aws-cost-explorer",
    "aws-marketplace",
  ],
  Compute: [
    "aws-batch",
    "amazon-ec2",
    "aws-elastic-beanstalk",
    "amazon-lightsail",
    "aws-outposts",
  ],
  Containers: ["amazon-ecr", "amazon-ecs", "amazon-eks"],
  "Customer Enablement": ["aws-support"],
  Database: [
    "amazon-aurora",
    "amazon-documentdb",
    "amazon-dynamodb",
    "amazon-elasticache",
    "amazon-neptune",
    "amazon-rds",
  ],
  "Developer Tools": [
    "aws-cli",
    "aws-codebuild",
    "aws-codepipeline",
    "aws-x-ray",
  ],
  "End User Computing": [
    "amazon-appstream-2-0",
    "amazon-workspaces",
    "amazon-workspaces-secure-browser",
  ],
  "Frontend Web and Mobile": ["aws-amplify", "aws-appsync"],
  "Internet of Things": ["aws-iot-core"],
  "Machine Learning": [
    "amazon-comprehend",
    "amazon-kendra",
    "amazon-lex",
    "amazon-polly",
    "amazon-q",
    "amazon-rekognition",
    "amazon-sagemaker-ai",
    "amazon-textract",
    "amazon-transcribe",
    "amazon-translate",
  ],
  "Management and Governance": [
    "aws-auto-scaling",
    "aws-cloudformation",
    "aws-cloudtrail",
    "amazon-cloudwatch",
    "aws-compute-optimizer",
    "aws-config",
    "aws-control-tower",
    "aws-health-dashboard",
    "aws-license-manager",
    "aws-management-console",
    "aws-organizations",
    "aws-service-catalog",
    "service-quotas",
    "aws-systems-manager",
    "aws-trusted-advisor",
    "aws-well-architected-tool",
  ],
  "Migration and Transfer": [
    "aws-application-discovery-service",
    "aws-application-migration-service",
    "aws-dms",
    "migration-evaluator",
    "aws-migration-hub",
    "aws-schema-conversion-tool",
    "aws-snow-family",
  ],
  "Networking and Content Delivery": [
    "amazon-api-gateway",
    "amazon-cloudfront",
    "aws-direct-connect",
    "aws-global-accelerator",
    "aws-privatelink",
    "amazon-route-53",
    "aws-transit-gateway",
    "amazon-vpc",
    "aws-vpn",
  ],
  "Security, Identity, and Compliance": [
    "aws-artifact",
    "aws-audit-manager",
    "aws-certificate-manager",
    "aws-cloudhsm",
    "amazon-cognito",
    "amazon-detective",
    "aws-directory-service",
    "aws-firewall-manager",
    "amazon-guardduty",
    "aws-iam",
    "aws-iam-identity-center",
    "amazon-inspector",
    "aws-kms",
    "amazon-macie",
    "aws-ram",
    "aws-secrets-manager",
    "aws-security-hub",
    "aws-shield",
    "aws-waf",
  ],
  Serverless: ["aws-fargate", "aws-lambda"],
  Storage: [
    "aws-backup",
    "amazon-ebs",
    "amazon-efs",
    "aws-elastic-disaster-recovery",
    "amazon-fsx",
    "amazon-s3",
    "amazon-s3-glacier",
    "aws-storage-gateway",
  ],
};

// The flat concatenation of every expected id, for convenient set comparison in
// the lint (every id present in ALL_SERVICES, and no id outside this set).
export const EXPECTED_IDS: string[] = Object.values(EXPECTED_SERVICE_IDS).flat();
