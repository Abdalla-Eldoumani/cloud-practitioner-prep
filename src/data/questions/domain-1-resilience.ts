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
      { id: "a", text: "The workload keeps operating, possibly at reduced capacity, even when one of its components fails." },
      { id: "b", text: "The workload can never experience any fault under any circumstances." },
      { id: "c", text: "The workload runs on a single component that is guaranteed never to break." },
      { id: "d", text: "The workload only works when every component is healthy at the same time." },
    ],
    correct: ["a"],
    explanation:
      "Fault tolerance is the ability to keep operating through the failure of a component, which AWS enables by spreading work across redundant resources such as multiple Availability Zones. It does not mean faults are impossible, and a design that depends on a single component or on every component being healthy is the opposite of fault tolerant.",
    reference: {
      label: "Reliability Pillar: deploy the workload to multiple locations",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_fault_isolation_multiaz_region_system.html",
    },
    lastVerified: "2026-07-29",
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
      { id: "b", text: "Run forever without ever needing any recovery, because failures are impossible." },
      { id: "c", text: "Guarantee the lowest possible cost regardless of design." },
      { id: "d", text: "Encrypt all data so that no outage can ever occur." },
    ],
    correct: ["a"],
    explanation:
      "AWS defines resiliency as the ability of a workload to recover from infrastructure or service disruptions, dynamically acquire computing resources to meet demand, and mitigate disruptions. It is not a promise that failures never happen, a cost guarantee, or a claim that encryption prevents outages.",
    reference: {
      label: "Reliability Pillar: resiliency and the components of reliability",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/resiliency-and-the-components-of-reliability.html",
    },
    lastVerified: "2026-07-29",
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
      { id: "b", text: "Producing the most visually appealing user interface." },
      { id: "c", text: "Using the fewest possible AWS services regardless of the requirement." },
      { id: "d", text: "Storing data in as many file formats as possible." },
    ],
    correct: ["a"],
    explanation:
      "AWS states the Reliability pillar encompasses the ability of a workload to perform its intended function correctly and consistently when it is expected to, including operating and testing it through its lifecycle. A visually appealing user interface, using the fewest possible services regardless of the requirement, and storing data in as many file formats as possible are unrelated to that definition.",
    reference: {
      label: "AWS Well-Architected Framework: Reliability pillar",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/reliability.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-resil-07",
    domain: 1,
    type: "single",
    topic: "Designing for failure",
    difficulty: "medium",
    stem: "An architecture review encourages teams to assume that any component can fail at some point. Which design principle from the Reliability pillar most directly reflects this mindset?",
    options: [
      { id: "a", text: "Automatically recover from failure by monitoring the workload and triggering automated responses." },
      { id: "b", text: "Manually restart servers only after a customer reports an outage." },
      { id: "c", text: "Buy a single very large server so that nothing ever needs to fail over." },
      { id: "d", text: "Avoid monitoring so that alerts do not create noise." },
    ],
    correct: ["a"],
    explanation:
      "AWS lists automatically recover from failure as a reliability design principle: monitor key indicators and run automation to work around or repair failures, ideally before they affect users. Waiting for customer reports, relying on one big server, and avoiding monitoring all run counter to designing for failure.",
    reference: {
      label: "Reliability Pillar: design principles",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-resil-08",
    domain: 1,
    type: "single",
    topic: "Designing for failure",
    difficulty: "medium",
    stem: "A team has a disaster recovery plan written down but has never tried it. Which Reliability pillar design principle tells them what to do, and why the cloud makes it practical?",
    options: [
      { id: "a", text: "Test recovery procedures, because in the cloud you can simulate failures and validate how the workload recovers before a real event." },
      { id: "b", text: "Never test recovery, because testing always causes outages." },
      { id: "c", text: "Assume the written plan is correct because it was reviewed once." },
      { id: "d", text: "Test only the parts that are cheapest to test and skip the rest." },
    ],
    correct: ["a"],
    explanation:
      "AWS calls out test recovery procedures as a design principle: the cloud lets you simulate different failures and validate recovery paths, exposing and fixing problems before a real failure. A written but untested plan is a common anti-pattern, and selective or skipped testing leaves recovery unproven.",
    reference: {
      label: "Reliability Pillar: design principles",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-resil-09",
    domain: 1,
    type: "single",
    topic: "Designing for failure",
    difficulty: "hard",
    stem: "AWS advises replacing one large resource with multiple smaller resources and spreading requests across them. Which reliability design principle is this, and what is the benefit?",
    options: [
      { id: "a", text: "Scale horizontally to increase aggregate workload availability, because no single resource becomes a shared point of failure." },
      { id: "b", text: "Scale vertically only, because one large resource is always more reliable than several small ones." },
      { id: "c", text: "Stop guessing capacity, which is about right-sizing rather than splitting resources." },
      { id: "d", text: "Manage change through automation, which is about deployment process rather than resource count." },
    ],
    correct: ["a"],
    explanation:
      "Scale horizontally to increase aggregate workload availability means replacing one large resource with multiple small ones and distributing requests so they do not share a common point of failure. Vertical scaling concentrates risk, while stop guessing capacity and manage change through automation are separate principles addressing right-sizing and deployment.",
    reference: {
      label: "Reliability Pillar: design principles",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html",
    },
    lastVerified: "2026-07-29",
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
      { id: "c", text: "Always pay the full amount upfront" },
      { id: "d", text: "Store all data in a single Availability Zone" },
      { id: "e", text: "Avoid testing in production-like conditions" },
    ],
    correct: ["a", "b"],
    explanation:
      "Stop guessing capacity and manage change through automation are two of the reliability design principles AWS lists, alongside automatic recovery, testing recovery, and horizontal scaling. Paying upfront is a billing choice, single-zone storage reduces resilience, and avoiding realistic testing contradicts the principle to test recovery procedures.",
    reference: {
      label: "Reliability Pillar: design principles",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-resil-30",
    domain: 1,
    type: "single",
    topic: "Decoupling for resilience",
    difficulty: "medium",
    stem: "AWS recommends loosely coupling the components of an application. From a resilience standpoint, what is the main benefit of loose coupling?",
    options: [
      { id: "a", text: "A failure in one component is isolated so it does not cascade to the components that depend on it." },
      { id: "b", text: "Every component must run on the same server to stay in sync." },
      { id: "c", text: "Components share one database directly so they always fail together." },
      { id: "d", text: "All components must respond synchronously to every request." },
    ],
    correct: ["a"],
    explanation:
      "AWS states that loose coupling isolates the behavior of a component from the others that depend on it, so a failure in one is isolated from others and resilience improves. Forcing components onto one server, sharing a single database directly, or requiring all components to respond synchronously to every request reintroduces tight coupling and shared failure.",
    reference: {
      label: "Reliability Pillar: implement loosely coupled dependencies",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_loosely_coupled_system.html",
    },
    lastVerified: "2026-07-29",
  },
  {
    id: "d1-resil-32",
    domain: 1,
    type: "multi",
    topic: "Decoupling for resilience",
    difficulty: "hard",
    stem: "An architect is moving from a tightly coupled monolith toward loosely coupled components for better resilience. Which TWO patterns does AWS associate with loose coupling? (Choose two.)",
    options: [
      { id: "a", text: "Use a queue such as Amazon SQS as an intermediate layer between components." },
      { id: "b", text: "Make interactions asynchronous where an immediate response is not required." },
      { id: "c", text: "Have components share a single database to stay tightly synchronized." },
      { id: "d", text: "Invoke APIs directly between tiers with no failover or buffering." },
      { id: "e", text: "Deploy the whole application as one monolith so nothing can decouple." },
    ],
    correct: ["a", "b"],
    explanation:
      "AWS describes loose coupling using intermediate durable layers such as an Amazon SQS queue and making interactions asynchronous when an immediate response is not needed, so components are isolated from one another. Sharing one database, direct API calls with no failover, and deploying a monolith are the tightly coupled anti-patterns AWS warns against.",
    reference: {
      label: "Reliability Pillar: implement loosely coupled dependencies",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_loosely_coupled_system.html",
    },
    lastVerified: "2026-07-29",
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
