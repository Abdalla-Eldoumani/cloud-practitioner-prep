// Leitner-box-lite spaced repetition for the review queue. This is ORDERING, not
// a daily-due-card system: each question in the review union (flagged + missed)
// carries a small integer box; a correct review promotes it to a longer interval,
// a wrong one resets it to box 0 (resurfaces fastest), and the queue is sorted
// soonest-due first. Honest and explainable for a one-week exam sprint — no SM-2
// ease factors or long-horizon retention model this tool cannot justify.
//
// Store-free and React-free (mirrors topics.ts / the exam.ts shuffle): the clock
// is a `now` parameter, never Date.now() inside the math, so the behavior is
// fully deterministic and the tsx check can pin a fixed clock.

import type { ReviewEntry } from "./types";

// Fixed interval table, in ms, indexed by box. Box 0 is due immediately (a
// just-missed item), growing to about a week. The table length sets MAX_BOX, so
// the box can never index past it.
export const REVIEW_INTERVALS_MS = [
  0, // box 0: due now (just missed / reset)
  1 * 24 * 60 * 60 * 1000, // box 1: ~1 day
  3 * 24 * 60 * 60 * 1000, // box 2: ~3 days
  7 * 24 * 60 * 60 * 1000, // box 3: ~1 week
] as const;

// Highest box. A correct answer caps here rather than running off the table.
export const MAX_BOX = REVIEW_INTERVALS_MS.length - 1;

// Compute the next schedule entry from the previous one and the grade. Correct
// promotes one box (capped at MAX_BOX); wrong drops to box 0 so it resurfaces
// fastest. `due` is `now` plus the box's interval; `lastReviewed` stamps `now`.
// An undefined `prev` (a never-scheduled question being graded for the first
// time) starts from box 0, so a first correct answer lands at box 1.
export function nextEntry(
  prev: ReviewEntry | undefined,
  correct: boolean,
  now = Date.now(),
): ReviewEntry {
  const box = correct ? Math.min((prev?.box ?? 0) + 1, MAX_BOX) : 0;
  return { box, due: now + REVIEW_INTERVALS_MS[box], lastReviewed: now };
}

// Order the review union. Returns a PERMUTATION of `ids` (same length, same
// members — never drops or duplicates an id), so a flagged/missed question is
// always served even before it has been reviewed once. A missing entry sorts as
// the weakest, most-overdue item: due 0, box 0, lastReviewed 0. Ties break by
// lowest box (weakest), then oldest lastReviewed (least recently touched).
// `now` is accepted for a fixed-clock test and a future "due now" filter; the
// pure ordering itself does not read it.
export function orderReviewQueue(
  ids: readonly string[],
  schedule: Record<string, ReviewEntry>,
  now = Date.now(),
): string[] {
  void now;
  return [...ids].sort((a, b) => {
    const ea = schedule[a];
    const eb = schedule[b];
    const da = ea?.due ?? 0;
    const db = eb?.due ?? 0;
    if (da !== db) return da - db; // soonest / most overdue first
    const ba = ea?.box ?? 0;
    const bb = eb?.box ?? 0;
    if (ba !== bb) return ba - bb; // lowest box (weakest) first
    return (ea?.lastReviewed ?? 0) - (eb?.lastReviewed ?? 0); // oldest touch first
  });
}
