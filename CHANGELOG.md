# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

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

[2.0.0]: https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep/releases/tag/v2.0.0
[1.0.0]: https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep/releases/tag/v1.0
