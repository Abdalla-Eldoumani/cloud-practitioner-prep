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

export interface ProgressState {
  version: 1;
  completedLessons: string[]; // lesson slugs marked done
  flaggedQuestions: string[]; // question ids flagged for review
  incorrectQuestions: string[]; // question ids missed at least once
  attempts: AttemptSummary[];
}
