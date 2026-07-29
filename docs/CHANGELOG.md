# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-07-29

A full content audit against current AWS documentation and the official CLF-C02
exam guide. Every question and every lesson was re-read against the live source
and corrected where AWS had moved on.

### Added

- A governance and compliance lesson covering AWS Artifact, compliance programs
  and third-party attestation, AWS Organizations with organizational units and
  service control policies, AWS Control Tower, and the account as an isolation
  boundary.
- Twenty-five new Domain 1 questions, and nine replacements for questions on
  subjects the exam guide does not cover. The bank is now 911 questions.
- Lesson coverage for subjects the questions tested but no lesson taught:
  machine images and the EC2 instance lifecycle, the full set of EC2 purchase
  options, S3 Lifecycle and S3 security, EBS snapshots and instance store,
  Multi-AZ deployments and read replicas, VPC CIDR blocks and endpoints, Route 53
  routing policies, launch templates, the cloud deployment models, disaster
  recovery, and the Well-Architected design principles.

### Changed

- Every question re-verified against current AWS documentation, with its
  reference updated where the page it cited had been archived or replaced.
- Domain tags realigned to the exam guide's own task statements. Global
  infrastructure questions now sit in Domain 3 and migration questions in Domain
  1, matching where the guide files those statements. Saved progress is keyed by
  question id, which never changes, so nothing is lost.
- Service catalog and cheat sheets refreshed for AWS renames and retirements,
  including Amazon SageMaker AI, the AWS Health Dashboard, AWS Security Hub CSPM,
  and the ElastiCache engine list.
- Support plan pages updated for the announced AWS support plan transition, with
  the end-of-support date stated alongside the tiers the exam still names.
- Exam-day identification requirements corrected: two forms of ID at a test
  center, one primary ID for an online proctored exam.
- The retake wait after a failed exam corrected to 14 days.
- Stricter content checks: the coverage map now fails when a question is
  unreachable from it or when a lesson is credited outside its domain, the
  option-letter guard covers distractor rationales as well as explanations, the
  link checker flags archived AWS pages, and community forum posts are no longer
  an acceptable reference.

## [2.1.0] - 2026-07-17

The Marked Ground redesign: the whole site restyled around a surveyor's
field-notes language, with measured grounds, ink-on-paper contrast, and
instrument-styled controls.

### Added

- A resume banner on the home and practice pages that returns you to an
  in-progress mock exam with its remaining time intact.
- A mark sheet in the exam room: the full question grid with flag pennants,
  presented as a bottom sheet on small screens.

### Changed

- New type system: Archivo for interface text, Literata for lesson prose, and
  Sometype Mono for figures and labels.
- Every surface rebuilt on one shared token set: the home study traverse, the
  learn index stations, the lesson layout, the exam room, the results ceremony
  and its missed-first review list, the progress dashboard, the catalog, and
  the cheat sheets.
- The exam room consolidates its timer, progress, and flag controls into a
  single bar, with keyboard shortcuts for flagging and for opening the grid.

## [2.0.0] - 2026-06-25

A major expansion from a lessons-and-quiz site into a complete CLF-C02 study
tool, with a hardening and discoverability pass on top.

### Added

- Service catalog: every AWS service the exam can ask about, searchable and
  filterable by domain, with compare cards for the easily confused pairs.
- Interactive lesson diagrams, each with an inline knowledge check.
- Adaptive weak-area drill that weights questions toward your weakest domains.
- Flashcards: self-graded recall over the catalog and the questions you missed.
- Spaced-repetition review queue that schedules missed and flagged questions.
- Exam coverage map linking every CLF-C02 task statement to its lessons and
  questions.
- Printable per-domain cheat sheets and an exam-day guide.
- Readiness dashboard with per-domain scores and a mock-score trend.
- Replayable, domain-weighted mock exams whose repeat sittings prefer unseen
  questions.
- Progress export and import as a JSON backup.
- Command palette (Cmd/Ctrl+K) and keyboard shortcuts.
- Installable progressive web app with offline support.
- Structured data and per-page metadata for search discoverability.
- Project documentation: an architecture guide alongside the contributing,
  security, and code-of-conduct files.

### Changed

- Every AWS fact re-verified against current AWS documentation.
- Every question carries an explanation of why each distractor is wrong.
- Hardened the production security headers (Content-Security-Policy, HSTS, a
  cross-origin opener policy, and a restrictive permissions policy).
- Continuous integration gates every change on a full type-check, content
  validation, and behavioral checks.

## [1.0.0] - 2026-06-23

### Added

- Initial release: lessons across the four exam domains, original practice
  questions with explanations and documentation links, a full timed mock exam, a
  review queue, progress tracking in the browser, and light and dark themes.

[2.2.0]: https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep/releases/tag/v2.2.0
[2.1.0]: https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep/releases/tag/v2.1.0
[2.0.0]: https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep/releases/tag/v2.0.0
[1.0.0]: https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep/releases/tag/v1.0
