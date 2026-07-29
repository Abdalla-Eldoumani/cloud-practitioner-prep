import type { ServiceEntry } from "../../lib/types";

// AWS category: Developer Tools. In-scope set: AWS CLI, AWS CodeBuild, AWS
// CodePipeline, AWS X-Ray (the CLI is an access tool but is exam-named, so it is
// kept as an entry). Authored against the official in-scope appendix; each entry
// carries a sourced reference and a lastVerified date. Expected ids: see
// expected-manifest.ts.
export const developerTools: ServiceEntry[] = [
  {
    id: "aws-cli",
    name: "AWS CLI",
    shortName: "CLI",
    domain: 3,
    category: "Developer Tools",
    purpose:
      "A unified command line tool for managing AWS services and resources from a terminal or script.",
    whenToUse:
      "Reach for it when you want to control AWS from a terminal or automate tasks in scripts instead of clicking through the console.",
    reference: {
      label: "What is the AWS Command Line Interface?",
      url: "https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "CLI",
      "command line interface",
      "AWS Command Line Interface",
      "command line",
    ],
    relatedTerms: ["command line", "terminal", "scripting", "automation"],
  },
  {
    id: "aws-codebuild",
    name: "AWS CodeBuild",
    shortName: "CodeBuild",
    domain: 3,
    category: "Developer Tools",
    purpose:
      "A fully managed continuous integration service that compiles source code, runs tests, and produces deployable software packages.",
    whenToUse:
      "Reach for it when you need to build and test your code automatically without provisioning and managing your own build servers.",
    reference: {
      label: "What is AWS CodeBuild?",
      url: "https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "CodeBuild",
      "build service",
      "continuous integration",
      "CI",
    ],
    relatedTerms: ["build", "continuous integration", "compile", "test"],
  },
  {
    id: "aws-codepipeline",
    name: "AWS CodePipeline",
    shortName: "CodePipeline",
    domain: 3,
    category: "Developer Tools",
    purpose:
      "A fully managed continuous delivery service that automates the build, test, and deploy phases of a release pipeline.",
    whenToUse:
      "Reach for it when you want to automate your release process so every code change flows through build, test, and deployment stages on its own.",
    reference: {
      label: "What is AWS CodePipeline?",
      url: "https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "CodePipeline",
      "release pipeline",
      "continuous delivery",
      "CI/CD",
    ],
    relatedTerms: ["pipeline", "continuous delivery", "release", "automation"],
  },
  {
    id: "aws-x-ray",
    name: "AWS X-Ray",
    shortName: "X-Ray",
    domain: 3,
    category: "Developer Tools",
    purpose:
      "A service that helps developers analyze and debug applications by tracing requests as they travel across services.",
    whenToUse:
      "Reach for it when you need to see how a request moves through a distributed application and find where errors or slowdowns happen.",
    reference: {
      label: "What is AWS X-Ray?",
      url: "https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "X-Ray",
      "tracing",
      "distributed tracing",
      "request tracing",
    ],
    relatedTerms: ["tracing", "debugging", "distributed", "performance"],
  },
];
