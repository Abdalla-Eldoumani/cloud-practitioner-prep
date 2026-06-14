import type { Domain, Question } from "./types";
import { DOMAINS, EXAM } from "./constants";

// Fisher-Yates shuffle on a copy. Caller's array is not mutated.
export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function byDomain(pool: readonly Question[]): Map<Domain, Question[]> {
  const map = new Map<Domain, Question[]>();
  for (const d of DOMAINS) map.set(d.id, []);
  for (const q of pool) map.get(q.domain)?.push(q);
  return map;
}

// Translate the domain weightings into integer question counts that sum to total.
// Largest-remainder rounding keeps the split faithful to the real exam mix.
export function domainTargets(total: number): Record<Domain, number> {
  const raw = DOMAINS.map((d) => ({ id: d.id, exact: (d.weight / 100) * total }));
  const floored = raw.map((r) => ({ ...r, n: Math.floor(r.exact), rem: r.exact - Math.floor(r.exact) }));
  let assigned = floored.reduce((s, r) => s + r.n, 0);
  floored.sort((a, b) => b.rem - a.rem);
  let i = 0;
  while (assigned < total) {
    floored[i % floored.length].n += 1;
    assigned += 1;
    i += 1;
  }
  const result = {} as Record<Domain, number>;
  for (const r of floored) result[r.id] = r.n;
  return result;
}

// Build a full mock that mirrors the real exam: questionCount items distributed
// across domains by weight, drawn at random, then shuffled into one sequence.
// When a domain pool is short, all of its questions are used.
export function buildMockExam(pool: readonly Question[], total: number = EXAM.questionCount): Question[] {
  const targets = domainTargets(total);
  const buckets = byDomain(pool);
  const picked: Question[] = [];
  for (const d of DOMAINS) {
    const available = shuffle(buckets.get(d.id) ?? []);
    picked.push(...available.slice(0, targets[d.id]));
  }
  return shuffle(picked);
}

// Build a focused quiz for one domain.
export function buildDomainQuiz(
  pool: readonly Question[],
  domain: Domain,
  count: number,
): Question[] {
  const inDomain = pool.filter((q) => q.domain === domain);
  return shuffle(inDomain).slice(0, count);
}

// Build a review set from a list of question ids (flagged or previously missed).
export function buildReviewSet(pool: readonly Question[], ids: readonly string[]): Question[] {
  const wanted = new Set(ids);
  return pool.filter((q) => wanted.has(q.id));
}
