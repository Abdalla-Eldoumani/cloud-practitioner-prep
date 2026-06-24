// Core types shared by the quiz engine, scoring, and progress tracking.

export type Domain = 1 | 2 | 3 | 4;

export type QuestionType = "single" | "multi";

export type Difficulty = "easy" | "medium" | "hard";

export interface Option {
  id: string; // stable within a question, e.g. "a", "b", "c"
  text: string;
}

export interface DocReference {
  label: string;
  url: string; // canonical AWS documentation URL backing the explanation
}

export interface Question {
  id: string; // globally unique, e.g. "d2-shared-responsibility-01"
  domain: Domain;
  type: QuestionType;
  topic: string; // short subject tag, e.g. "Shared Responsibility Model"
  difficulty: Difficulty;
  stem: string; // the question text
  options: Option[];
  // Option ids that are correct. Length 1 for single, 2+ for multi.
  correct: string[];
  explanation: string; // why the answer is right, and why distractors are wrong
  reference: DocReference;
  // ISO date (YYYY-MM-DD) the facts were last checked against AWS docs, so a
  // reader can judge the content's age and a lint can flag unverified questions.
  // Required: the whole bank is stamped, so the compiler refuses any question
  // that ships without a verification date.
  lastVerified: string;
  // Sourced reason each wrong option is wrong, keyed by the incorrect option id.
  // Keyed by id, never position, so it survives the render-time option shuffle.
  distractorRationales?: Record<string, string>;
  services?: string[];
}

// ---- Service catalog (the AWS service reference + glossary) ----

// One AWS service entry in the catalog. Mirrors Question's verification
// contract: a `reference` to an official AWS doc and a required `lastVerified`
// date, so the same link-checker and freshness lint treat services like
// questions. Reuses Domain and DocReference rather than forking either.
export interface ServiceEntry {
  id: string; // stable slug, globally unique, e.g. "amazon-ec2", "aws-kms"
  name: string; // canonical exam name, e.g. "Amazon EC2"
  shortName?: string; // common short form for search/compare, e.g. "EC2", "KMS"
  domain: Domain; // primary exam domain 1-4 (lint enforces 1..4)
  category: string; // the AWS appendix category, e.g. "Compute"
  purpose: string; // one-line "what it is" (CAT-01)
  whenToUse: string; // the "reach for this when..." note (CAT-01)
  reference: DocReference; // official AWS doc URL backing the entry (CAT-04)
  // ISO date (YYYY-MM-DD), required, so the compiler refuses an entry that ships
  // without a verification date, exactly as Question does.
  lastVerified: string;
  aliases?: string[]; // alternate names/acronyms so search + glossary find it
  relatedTerms?: string[]; // glossary cross-references / plain-English concepts
  relatedServices?: string[]; // ids of related services (powers "see also")
}

// One row of a compare group: a distinguishing axis and a short value per
// compared service.
export interface CompareRow {
  axis: string; // the question the row answers, e.g. "What it is"
  // Keyed by ServiceEntry id, never column position, so a responsive reorder or
  // a stacked mobile layout cannot desync a cell from its service.
  cells: Record<string, string>;
}

// A side-by-side disambiguation card for a commonly-confused group. Compare
// groups are content too, so each carries a required lastVerified and is
// lint-checked.
export interface CompareGroup {
  id: string; // slug, e.g. "ec2-vs-lambda-vs-fargate"
  title: string; // e.g. "EC2 vs Lambda vs Fargate"
  framing: string; // one-line "the quick way to tell them apart"
  serviceIds: string[]; // the ServiceEntry ids being compared (column order)
  rows: CompareRow[]; // distinguishing axes
  reference?: DocReference; // optional doc that contrasts them; else each entry's
  lastVerified: string; // ISO date (YYYY-MM-DD), required
}

// One answer the user submitted for one question.
export interface AttemptAnswer {
  questionId: string;
  selected: string[]; // option ids the user chose
  flagged: boolean;
}

export interface DomainScore {
  domain: Domain;
  total: number;
  correct: number;
  percent: number; // 0-100, rounded
}

// Readiness is an honest study signal derived from raw percent.
// It is not the AWS scaled score and never claims to be.
export type Readiness = "not-ready" | "building" | "on-track" | "exam-ready";

export interface AttemptResult {
  total: number;
  correct: number;
  percent: number; // 0-100, rounded
  byDomain: DomainScore[];
  readiness: Readiness;
  mode: QuizMode;
  finishedAt: number; // epoch ms
  durationSeconds: number;
}

export type QuizMode = "practice" | "exam" | "review";

// ---- Progress (persisted in the browser) ----

export interface AttemptSummary {
  id: string;
  mode: QuizMode;
  domain: Domain | "all";
  percent: number;
  total: number;
  finishedAt: number;
  durationSeconds: number;
}

// How sure the learner was before seeing the answer. Captured pre-reveal so it
// is an honest signal; later consumed by the review schedule.
export type Confidence = "guessing" | "unsure" | "confident";

// Rolling per-topic accuracy, keyed by Question.topic. Topic is finer than
// domain, so an adaptive drill can target real weak spots, and the same map
// backs per-topic readiness later. `seen`/`correct` accumulate across attempts.
export interface TopicStat {
  topic: string;
  seen: number;
  correct: number;
  lastSeen?: number; // epoch ms of the most recent answer in this topic
}

// version 2: adds per-topic stats, a flashcard known/learning slice, and an
// optional per-question confidence map. The existing arrays are unchanged so a
// stored v1 blob upgrades by seeding the new fields (see progress.ts).
export interface ProgressState {
  version: 2;
  completedLessons: string[]; // lesson slugs marked done
  flaggedQuestions: string[]; // question ids flagged for review
  incorrectQuestions: string[]; // question ids missed at least once
  attempts: AttemptSummary[];
  // Per-topic rolling accuracy, keyed by Question.topic. Populated by the
  // attempt-recording path; read by the adaptive drill builder.
  topicStats: Record<string, TopicStat>;
  // Self-graded flashcard recall: card ids the learner marked known vs still
  // learning, with an optional last-seen map for later scheduling.
  flashcards: {
    known: string[];
    learning: string[];
    lastSeen?: Record<string, number>;
  };
  // Most recent pre-reveal confidence per question id. Optional and additive so
  // a v1 upgrade and any older v2 blob without it both load cleanly.
  confidenceByQuestion?: Record<string, Confidence>;
}
