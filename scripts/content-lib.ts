// Shared helpers for the content-integrity scripts. Both check-links.ts and
// lint-content.ts import from here so the host allowlist, the regexes, the bank
// loader, and the per-distractor token heuristic live in exactly one place.
//
// Convention: the question bank is already typed TypeScript, so it is imported
// directly. Nothing here parses .ts source. Only lesson frontmatter is parsed,
// and only where a script needs it.

import { globby } from "globby";
import matter from "gray-matter";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ALL_QUESTIONS } from "../src/data/questions/index";
import { COMPARE_GROUPS } from "../src/data/services/compare";
import { ALL_SERVICES } from "../src/data/services/index";
import type { Question, ServiceEntry } from "../src/lib/types";

// Resolve a path relative to this module into a glob pattern globby accepts on
// every platform. new URL().pathname yields a leading-slash, drive-letter form
// (/C:/...) that fast-glob does not match on Windows; fileURLToPath gives native
// separators, so normalize the backslashes to forward slashes for globby.
export function resolveGlob(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url)).replace(/\\/g, "/");
}

// The only hosts a reference URL may use. Mirrors the content-accuracy rule:
// official AWS documentation, the AWS marketing/site host, and the pricing
// calculator. Community-authored hosts are deliberately absent — a re:Post
// thread is not official documentation, so it can never back a fact. Enforced
// before any network call so live mode never reaches a non-AWS host.
export const AWS_HOSTS = new Set<string>([
  "docs.aws.amazon.com",
  "aws.amazon.com",
  "calculator.aws",
]);

// Glob roots, resolved relative to this file so the scripts run from any cwd.
const LESSONS_GLOB = resolveGlob("../src/content/lessons/*.mdx");

// AWS marks superseded pages "for historical reference only". A reference must
// not point at one. These match the URL forms AWS uses for retired/archived doc
// trees; extend this list as new historical-path shapes are found.
export const HISTORICAL_MARKERS: RegExp[] = [
  /historical[-_]?reference/i,
  /\/archive(?:d)?\//i,
  /\/previous(?:-version)?\//i,
  /for-historical-reference/i,
  // The "How AWS Pricing Works" whitepaper was archived in place: the path never
  // changed, so only naming it catches the citation. Its pricing-principles pages
  // now carry the historical-reference banner, and pricing facts must come from
  // the current pricing pages instead.
  /\/how-aws-pricing-works\//i,
];

// Option-letter / ordinal references to answer positions are banned in
// explanations: options shuffle at render time, so "option b" or "the second
// option" desyncs. This pattern is tighter than the loose skill pattern
// (/option [a-f]|first option|second option|third option|last option/i):
// it requires word boundaries around the letter ("\boption [a-f]\b") and
// around the ordinal phrase, so legitimate noun uses ("On-Demand option",
// "the cheaper option", "purchase option") do not match. The bank is also
// reworded so even the loose skill pattern runs clean (done in a later content
// pass), but this strict pattern is the one the lint enforces.
export const OPTION_LETTER_RE =
  /\boption [a-f]\b|\b(first|second|third|fourth|fifth|last) option\b/i;

// Load the typed question bank. A thin wrapper so callers do not each import the
// data path, and so a future loader change touches one spot.
export function loadQuestions(): Question[] {
  return ALL_QUESTIONS;
}

// Every reference URL in the bank, one per question (duplicates included; the
// link-checker dedupes). Length equals the question count.
export function questionRefUrls(): string[] {
  return loadQuestions().map((q) => q.reference.url);
}

// Load the typed service catalog. A thin wrapper mirroring loadQuestions so the
// catalog data path lives in one spot.
export function loadServices(): ServiceEntry[] {
  return ALL_SERVICES;
}

// Every catalog reference URL: one per service, plus any reference URL a compare
// group carries (compare groups can cite a doc that contrasts the services).
// Feeds the link-checker so catalog doc links get the same AWS-host allowlist
// and live reachability check as questions. Duplicates included; the
// link-checker dedupes.
export function catalogRefUrls(): string[] {
  const serviceUrls = loadServices().map((s) => s.reference.url);
  const compareUrls = COMPARE_GROUPS.flatMap((g) =>
    g.reference ? [g.reference.url] : [],
  );
  return [...serviceUrls, ...compareUrls];
}

// Count questions per domain id, e.g. { 1: 223, 2: 262, 3: 303, 4: 98 }.
export function countByDomain(
  questions: Question[] = loadQuestions(),
): Record<number, number> {
  return questions.reduce<Record<number, number>>((acc, q) => {
    acc[q.domain] = (acc[q.domain] ?? 0) + 1;
    return acc;
  }, {});
}

// Pull http(s) links out of one MDX body: markdown links [text](url), bare
// autolinks <url>, and raw URLs in prose. Frontmatter is stripped first with
// gray-matter so a date or a services array is never mistaken for a link.
function linksFromMdx(body: string): string[] {
  const out: string[] = [];
  const patterns = [
    /\]\((https?:\/\/[^)\s]+)\)/gi, // [label](url)
    /<(https?:\/\/[^>\s]+)>/gi, //     <url> autolink
    /(?<![("<])\bhttps?:\/\/[^\s)<>"']+/gi, // bare url not already captured
  ];
  for (const re of patterns) {
    for (const m of body.matchAll(re)) {
      out.push(m[1] ?? m[0]);
    }
  }
  return out;
}

// Every http(s) URL found across the lesson MDX bodies. Async because it globs
// and reads files. Used by the link-checker so lesson links are validated too,
// not only question references.
export async function extractMdxLinks(): Promise<string[]> {
  const files = await globby(LESSONS_GLOB);
  const urls: string[] = [];
  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    const { content } = matter(raw);
    urls.push(...linksFromMdx(content));
  }
  return urls;
}

// Parse a URL, returning null instead of throwing on a malformed string so a
// caller can report it as a failure rather than crash. Wraps new URL() per the
// input-validation rule.
export function parseUrl(raw: string): URL | null {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

// Words that carry no distinguishing signal, so they are dropped before a
// distractor's tokens are compared against the explanation.
const STOPWORDS = new Set<string>([
  "the", "a", "an", "and", "or", "but", "for", "to", "of", "in", "on", "at",
  "by", "with", "from", "as", "is", "are", "was", "were", "be", "been", "being",
  "it", "its", "this", "that", "these", "those", "you", "your", "they", "them",
  "their", "can", "will", "would", "should", "could", "may", "might", "must",
  "not", "no", "only", "all", "any", "each", "every", "into", "than", "then",
  "so", "if", "when", "which", "who", "whom", "whose", "what", "where", "while",
  "use", "uses", "used", "using", "provide", "provides", "provided", "service",
  "services", "aws", "amazon", "option", "options", "feature", "features",
  "resource", "resources", "data", "across", "within", "between", "over",
  "such", "set", "sets", "one", "two", "more", "most", "some", "other",
]);

// Normalize a token for case-insensitive comparison.
function norm(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9+]/gi, "");
}

// Distinguishing tokens drawn from one option's text. Prefers multi-word
// capitalized phrases (service names like "Elastic Beanstalk", "Network ACL")
// and otherwise keeps content words longer than three characters that are not
// stopwords. Returns lowercase tokens for case-insensitive matching.
function tokensFromText(text: string): string[] {
  const tokens = new Set<string>();

  // Capitalized multi-word phrases: a run of Capitalized words, optionally
  // joined by a lowercase connector, e.g. "Amazon Elastic Block Store".
  for (const m of text.matchAll(/\b([A-Z][A-Za-z0-9]+(?:[\s-][A-Z0-9][A-Za-z0-9]+)+)/g)) {
    const phrase = m[1].trim();
    const n = norm(phrase.replace(/[\s-]+/g, " "));
    if (n.length > 3) tokens.add(phrase.toLowerCase().replace(/[\s-]+/g, " "));
  }

  // Single content words.
  for (const raw of text.split(/[^A-Za-z0-9+]+/)) {
    const word = raw.trim();
    if (word.length <= 3) continue;
    const n = norm(word);
    if (n.length <= 3) continue;
    if (STOPWORDS.has(n)) continue;
    tokens.add(n);
  }

  return [...tokens];
}

// For each incorrect option (an option id not in `correct`), the set of
// distinguishing tokens the explanation should name if it addresses why that
// option is wrong. Tokens that also appear in a correct option are dropped:
// a token shared with the right answer is not distinguishing, so requiring it
// would be meaningless. This is the Pattern 3 token-overlap heuristic the
// whole-bank ACC-04 coverage gate consumes; an explanation "covers" a distractor
// when at least one of its tokens appears (case-insensitively) in the prose.
export function incorrectOptionTokens(
  question: Question,
): Record<string, string[]> {
  const correctIds = new Set(question.correct);

  // Tokens that belong to a correct option; these are not distinguishing.
  const correctTokens = new Set<string>();
  for (const opt of question.options) {
    if (correctIds.has(opt.id)) {
      for (const t of tokensFromText(opt.text)) correctTokens.add(t);
    }
  }

  const result: Record<string, string[]> = {};
  for (const opt of question.options) {
    if (correctIds.has(opt.id)) continue;
    const distinguishing = tokensFromText(opt.text).filter(
      (t) => !correctTokens.has(t),
    );
    result[opt.id] = distinguishing;
  }
  return result;
}
