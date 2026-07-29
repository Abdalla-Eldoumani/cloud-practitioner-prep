import type { ServiceEntry } from "../../lib/types";

// AWS category: Containers. In-scope set: Amazon ECR, Amazon ECS, Amazon EKS.
// Authored against the official in-scope appendix; each entry carries a sourced
// reference and a lastVerified date. Expected ids: see expected-manifest.ts.
export const containers: ServiceEntry[] = [
  {
    id: "amazon-ecr",
    name: "Amazon ECR",
    shortName: "ECR",
    domain: 3,
    category: "Containers",
    purpose:
      "A fully managed registry for storing, sharing, and deploying your container images.",
    whenToUse:
      "Reach for it when you need a private, managed place to push and pull the container images your services run from.",
    reference: {
      label: "What is Amazon Elastic Container Registry?",
      url: "https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "ECR",
      "Elastic Container Registry",
      "container registry",
      "image registry",
    ],
    relatedTerms: ["container image", "Docker image", "registry"],
  },
  {
    id: "amazon-ecs",
    name: "Amazon ECS",
    shortName: "ECS",
    domain: 3,
    category: "Containers",
    purpose:
      "A fully managed container orchestration service that runs, scales, and manages your containerized applications.",
    whenToUse:
      "Reach for it when you want to run containers on AWS with a simple, deeply integrated orchestrator and without operating your own control plane.",
    reference: {
      label: "What is Amazon Elastic Container Service?",
      url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "ECS",
      "Elastic Container Service",
      "container orchestration",
      "containers",
    ],
    relatedTerms: ["container", "task", "cluster", "orchestration"],
  },
  {
    id: "amazon-eks",
    name: "Amazon EKS",
    shortName: "EKS",
    domain: 3,
    category: "Containers",
    purpose:
      "A managed Kubernetes service that runs the Kubernetes control plane for you so you can operate containers with Kubernetes on AWS.",
    whenToUse:
      "Reach for it when your team has standardized on Kubernetes and wants AWS to manage the cluster control plane.",
    reference: {
      label: "What is Amazon EKS?",
      url: "https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "EKS",
      "Elastic Kubernetes Service",
      "Kubernetes",
      "managed Kubernetes",
    ],
    relatedTerms: ["Kubernetes", "container", "cluster", "control plane"],
  },
];
