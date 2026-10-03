import type { Question } from "../../lib/types";

// Domain 2: Security and Compliance. Original practice questions.
export const domain2: Question[] = [
  {
    id: "d2-shared-responsibility-01",
    domain: 2,
    type: "single",
    topic: "Shared Responsibility Model",
    difficulty: "medium",
    stem: "A company runs an application on Amazon EC2 instances. Under the AWS Shared Responsibility Model, which task is the company's responsibility?",
    options: [
      { id: "a", text: "Maintaining the physical security of the data centers" },
      { id: "b", text: "Patching the hypervisor on the EC2 host" },
      { id: "c", text: "Patching the guest operating system on its instances" },
      { id: "d", text: "Replacing failed physical hardware" },
    ],
    correct: ["c"],
    explanation:
      "AWS is responsible for security of the cloud (facilities, hardware, and the virtualization layer). The customer is responsible for security in the cloud, which for EC2 includes the guest OS, including its patches, plus applications, data, and access control. Physical data center security, replacing failed hardware, and patching the hypervisor on the EC2 host all stay with AWS, so they are not the company's responsibility.",
    reference: {
      label: "AWS Shared Responsibility Model",
      url: "https://aws.amazon.com/compliance/shared-responsibility-model/",
    },
    lastVerified: "2026-07-29",
    services: ["EC2"],
  },
  {
    id: "d2-guardduty-01",
    domain: 2,
    type: "single",
    topic: "Threat detection",
    difficulty: "medium",
    stem: "A security team wants continuous, intelligent threat detection that analyzes VPC flow logs, DNS logs, and AWS CloudTrail events to flag unusual or malicious activity. Which service is purpose-built for this?",
    options: [
      { id: "a", text: "Amazon GuardDuty" },
      { id: "b", text: "Amazon Inspector" },
      { id: "c", text: "AWS Trusted Advisor" },
      { id: "d", text: "AWS Config" },
    ],
    correct: ["a"],
    explanation:
      "GuardDuty continuously analyzes those exact data sources for threats. Inspector assesses workloads for software vulnerabilities, Trusted Advisor checks best practices, and Config records and evaluates resource configurations.",
    reference: {
      label: "What is Amazon GuardDuty?",
      url: "https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html",
    },
    lastVerified: "2026-07-29",
    services: ["GuardDuty"],
  },
  {
    id: "d2-iam-bestpractice-multi-01",
    domain: 2,
    type: "multi",
    topic: "Identity and access management",
    difficulty: "medium",
    stem: "Which TWO actions follow AWS access-management best practices for a new account? (Choose two.)",
    options: [
      { id: "a", text: "Enable multi-factor authentication on the root user." },
      { id: "b", text: "Use the root user for all daily administrative work." },
      { id: "c", text: "Grant IAM identities only the permissions they need for their tasks." },
      { id: "d", text: "Create access keys for the root user and rotate them regularly." },
      { id: "e", text: "Give every developer an IAM user with permanent access keys." },
    ],
    correct: ["a", "c"],
    explanation:
      "Protecting the root user with MFA and applying least privilege are core best practices. The root user should not be used for daily work, AWS recommends not creating access keys for the root user at all rather than creating them and planning to rotate them, and human users should use federation with temporary credentials instead of IAM users with permanent access keys.",
    reference: {
      label: "Security best practices in IAM",
      url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html",
    },
    lastVerified: "2026-10-03",
    services: ["IAM"],
  },
];
