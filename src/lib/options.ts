import type { Option, Question } from "./types";
import { shuffle } from "./exam";

// The single option-order path. Every place options render goes through this so
// per-instance shuffle is centralized, not reimplemented per mode.
//
// Returns a fresh permutation of question.options on each call, reusing the
// Fisher-Yates shuffle from exam.ts (Don't-Hand-Roll: no second randomizer). The
// authoring convention puts the correct option first; shuffling at render time
// neutralizes that, and check-shuffle-uniformity.ts is the guarantee that the
// correct option's rendered position is fair across the bank.
//
// Stability while a question is on screen is the CALLER's responsibility: a
// caller computes the order once when a question enters its working set and
// holds the result (QuizEngine keeps a per-question id-order in island state and
// in SavedExam). This helper itself is stateless and pure over Question — it
// reads neither the store nor the DOM and never mutates question.options. The
// instanceKey parameter documents that per-instance contract for readers; it is
// intentionally not used to seed the permutation, because order persistence is
// handled by caching the result, not by re-deriving it from a seed.
export function orderedOptions(
  question: Question,
  // Underscore marks this intentionally unused: it documents the per-instance
  // caching contract for callers (see note above) without seeding the shuffle.
  _instanceKey?: string,
): Option[] {
  return shuffle(question.options);
}
