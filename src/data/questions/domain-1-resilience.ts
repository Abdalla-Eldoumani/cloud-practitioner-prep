import type { Question } from "../../lib/types";

// Domain 1: Cloud Concepts, resilience cluster. Original practice questions that
// test high availability, fault tolerance, disaster recovery basics, and
// designing for failure, at the CLF-C02 concepts level. The Multi-AZ database,
// durability, and decoupling questions the exam guide files under Domain 3 live
// with their services in the Domain 3 files. These are not real exam items.
// Every fact is verified against current AWS documentation; each question cites
// the page backing its answer.
//
// Ids keep their historical d1-resil- prefixes deliberately: an id is a stable
// key in a learner's saved progress, so it survives a move between files and
// stays put when a question is retagged to another domain.
export const domain1Resilience: Question[] = [
  {
    id: "d1-resil-03",
    domain: 1,
    type: "single",
    topic: "Fault tolerance",
    difficulty: "medium",
    stem: "A workload is described as fault tolerant. Which statement captures what that means?",
    options: [
      { id: "a", text: "The workload keeps working through the failure of one of its components." },
      { id: "b", text: "The workload adds capacity automatically when demand rises." },
      { id: "c", text: "The workload can be restored from backups after a component fails." },
      { id: "d", text: "The workload is restarted within an agreed recovery time after an outage." },
    ],
    correct: ["a"],
    explanation:
      "Fault tolerance is the ability to keep operating through the failure of a component, which AWS enables by spreading work across redundant resources such as multiple Availability Zones. Adding capacity as demand rises describes elasticity, and restoring from backups or restarting within an agreed recovery time describes recovery after an interruption, whereas a fault-tolerant workload keeps working without that interruption.",
    reference: {
      label: "Reliability Pillar: deploy the workload to multiple locations",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_fault_isolation_multiaz_region_system.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-resil-05",
    domain: 1,
    type: "single",
    topic: "Resiliency",
    difficulty: "medium",
    stem: "In the AWS Well-Architected Framework, resiliency is described as the ability of a workload to do which of the following?",
    options: [
      { id: "a", text: "Recover from infrastructure or service disruptions and dynamically acquire resources to meet demand." },
      { id: "b", text: "Protect data, systems, and assets by applying cloud security technologies." },
      { id: "c", text: "Deliver business value at the lowest possible price point." },
      { id: "d", text: "Build software correctly while consistently delivering a great customer experience." },
    ],
    correct: ["a"],
    explanation:
      "AWS defines resiliency as the ability of a workload to recover from infrastructure or service disruptions, dynamically acquire computing resources to meet demand, and mitigate disruptions. Protecting data, systems, and assets describes the Security pillar, delivering business value at the lowest price point describes Cost Optimization, and building software correctly while delivering a great customer experience describes Operational Excellence.",
    reference: {
      label: "Reliability Pillar: resiliency and the components of reliability",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/resiliency-and-the-components-of-reliability.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-resil-06",
    domain: 1,
    type: "single",
    topic: "Reliability pillar",
    difficulty: "medium",
    stem: "The Reliability pillar of the AWS Well-Architected Framework is centered on which capability of a workload?",
    options: [
      { id: "a", text: "Performing its intended function correctly and consistently when it is expected to." },
      { id: "b", text: "Protecting data, systems, and assets using cloud security technologies." },
      { id: "c", text: "Running systems to deliver business value at the lowest price point." },
      { id: "d", text: "Using cloud resources efficiently as demand and technologies change." },
    ],
    correct: ["a"],
    explanation:
      "AWS states the Reliability pillar encompasses the ability of a workload to perform its intended function correctly and consistently when it is expected to, including operating and testing it through its lifecycle. Protecting data, systems, and assets is the Security pillar, delivering business value at the lowest price point is Cost Optimization, and using cloud resources efficiently as demand changes is Performance Efficiency.",
    reference: {
      label: "AWS Well-Architected Framework: Reliability pillar",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/reliability.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-resil-07",
    domain: 1,
    type: "single",
    topic: "Designing for failure",
    difficulty: "medium",
    stem: "An architecture review encourages teams to assume that any component can fail at some point. Which design principle from the Reliability pillar most directly reflects this mindset?",
    options: [
      { id: "a", text: "Automatically recover from failure using monitoring and automation." },
      { id: "b", text: "Stop guessing capacity by monitoring demand and utilization." },
      { id: "c", text: "Manage change through automation, tracking every infrastructure change." },
      { id: "d", text: "Implement a strong identity foundation using least privilege." },
    ],
    correct: ["a"],
    explanation:
      "AWS lists automatically recover from failure as a reliability design principle: monitor key indicators and run automation to work around or repair failures, ideally before they affect users. Stop guessing capacity is about matching resources to demand, manage change through automation is about how changes reach the infrastructure, and a strong identity foundation is a Security pillar principle built on least privilege.",
    reference: {
      label: "Reliability Pillar: design principles",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-resil-08",
    domain: 1,
    type: "single",
    topic: "Designing for failure",
    difficulty: "medium",
    stem: "A team has a disaster recovery plan written down but has never tried it. Which Reliability pillar design principle tells them what to do, and why the cloud makes it practical?",
    options: [
      { id: "a", text: "Test recovery by simulating failures in the cloud." },
      { id: "b", text: "Stop guessing capacity, since cloud resources can be added on demand." },
      { id: "c", text: "Manage change through automation, so every change is tracked and reviewed." },
      { id: "d", text: "Automatically recover from failure, using monitoring to trigger repairs." },
    ],
    correct: ["a"],
    explanation:
      "AWS calls out test recovery procedures as a design principle: the cloud lets you simulate different failures and validate recovery paths, exposing and fixing problems before a real failure. Stop guessing capacity addresses resource saturation, manage change through automation covers how changes are tracked and reviewed, and automatically recover from failure relies on monitoring to trigger repairs; none of them tells the team to exercise an untested plan.",
    reference: {
      label: "Reliability Pillar: design principles",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-resil-09",
    domain: 1,
    type: "single",
    topic: "Designing for failure",
    difficulty: "hard",
    stem: "AWS advises replacing one large resource with multiple smaller resources and spreading requests across them. Which reliability design principle is this, and what is the benefit?",
    options: [
      { id: "a", text: "Scale horizontally to increase aggregate availability, avoiding a shared point of failure." },
      { id: "b", text: "Automatically recover from failure, which repairs failures by running automation on alerts." },
      { id: "c", text: "Stop guessing capacity, which is about right-sizing rather than splitting resources." },
      { id: "d", text: "Manage change through automation, which is about deployment process rather than resource count." },
    ],
    correct: ["a"],
    explanation:
      "Scale horizontally to increase aggregate workload availability means replacing one large resource with multiple small ones and distributing requests so they do not share a common point of failure. Automatically recover from failure is about running automation when monitoring detects a problem, while stop guessing capacity and manage change through automation are separate principles addressing right-sizing and deployment.",
    reference: {
      label: "Reliability Pillar: design principles",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-resil-10",
    domain: 1,
    type: "multi",
    topic: "Designing for failure",
    difficulty: "hard",
    stem: "Which TWO of the following are design principles for reliability in the AWS Well-Architected Framework? (Choose two.)",
    options: [
      { id: "a", text: "Stop guessing capacity" },
      { id: "b", text: "Manage change through automation" },
      { id: "c", text: "Implement a strong identity foundation" },
      { id: "d", text: "Adopt a consumption model" },
      { id: "e", text: "Go global in minutes" },
    ],
    correct: ["a", "b"],
    explanation:
      "Stop guessing capacity and manage change through automation are two of the reliability design principles AWS lists, alongside automatic recovery, testing recovery, and horizontal scaling. Implement a strong identity foundation is a Security principle, adopt a consumption model is a Cost Optimization principle, and go global in minutes is a Performance Efficiency principle.",
    reference: {
      label: "Reliability Pillar: design principles",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-resil-30",
    domain: 1,
    type: "single",
    topic: "Decoupling for resilience",
    difficulty: "medium",
    stem: "AWS recommends loosely coupling the components of an application. From a resilience standpoint, what is the main benefit of loose coupling?",
    options: [
      { id: "a", text: "A failure in one component does not cascade to others." },
      { id: "b", text: "Data passed between components is encrypted automatically." },
      { id: "c", text: "The whole application can be deployed and versioned as one unit." },
      { id: "d", text: "All components must respond synchronously to every request." },
    ],
    correct: ["a"],
    explanation:
      "AWS states that loose coupling isolates the behavior of a component from the others that depend on it, so a failure in one is isolated from others and resilience improves. Loose coupling does not by itself encrypt data passed between components, deploying the whole application as one unit describes a monolith, and requiring all components to respond synchronously to every request reintroduces tight coupling and shared failure.",
    reference: {
      label: "Reliability Pillar: implement loosely coupled dependencies",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_loosely_coupled_system.html",
    },
    lastVerified: "2026-10-03",
  },
  {
    id: "d1-resil-32",
    domain: 1,
    type: "multi",
    topic: "Decoupling for resilience",
    difficulty: "hard",
    stem: "An architect is moving from a tightly coupled monolith toward loosely coupled components for better resilience. Which TWO patterns does AWS associate with loose coupling? (Choose two.)",
    options: [
      { id: "a", text: "Use an Amazon SQS queue as an intermediate layer between components." },
      { id: "b", text: "Make interactions asynchronous where an immediate response is not required." },
      { id: "c", text: "Have components share one database schema so they read the same data." },
      { id: "d", text: "Have each tier call the next one synchronously and wait for a reply." },
      { id: "e", text: "Scale each component vertically onto a larger instance as load grows." },
    ],
    correct: ["a", "b"],
    explanation:
      "AWS describes loose coupling using intermediate durable layers such as an Amazon SQS queue and making interactions asynchronous when an immediate response is not needed, so components are isolated from one another. A shared database schema and synchronous calls that wait on the next tier are tightly coupled patterns, and scaling a component vertically changes its instance size without decoupling anything.",
    reference: {
      label: "Reliability Pillar: implement loosely coupled dependencies",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_loosely_coupled_system.html",
    },
    lastVerified: "2026-10-03",
    services: ["SQS"],
  },
  {
    id: "d1-resil-39",
    domain: 1,
    type: "single",
    topic: "Reliability design principles",
    difficulty: "hard",
    stem: "A team stops editing infrastructure by hand and applies every change through automation instead, treating edits to the automation itself as changes to be tracked and reviewed. Which Reliability design principle does this follow?",
    options: [
      { id: "a", text: "Manage change through automation" },
      { id: "b", text: "Test recovery procedures" },
      { id: "c", text: "Scale horizontally to increase aggregate workload availability" },
      { id: "d", text: "Automatically recover from failure" },
    ],
    correct: ["a"],
    distractorRationales: {
      b: "That principle is about simulating failures to validate the recovery path, not about how changes reach the infrastructure.",
      c: "That principle is about replacing one large resource with several small ones so a single failure has less impact.",
      d: "That principle is about monitoring key indicators and starting automation when a threshold is breached.",
    },
    explanation:
      "AWS states the reliability design principle manage change through automation as: changes to your infrastructure should be made using automation, and the changes that must be managed include changes to the automation, which can then be tracked and reviewed. Test recovery procedures is about simulating failures in the cloud to validate the recovery path before a real event. Scale horizontally replaces one large resource with multiple small resources so a single failure affects less of the workload. Automatically recover from failure is about monitoring key performance indicators and starting automation when a threshold is breached.",
    reference: {
      label: "Reliability Pillar: design principles",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/rel-dp.html",
    },
    lastVerified: "2026-07-29",
  },
];
