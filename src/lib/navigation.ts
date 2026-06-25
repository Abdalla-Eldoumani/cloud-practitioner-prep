// The command-registry and search contract for the keyboard command palette.
// Pure TypeScript: no React, no Astro, no store. Every export is
// JSON-serializable so the layout can hand the registry, the lesson index, and
// the service index to the palette island as plain props, and the build-time
// gate can import the SAME symbols (never a reimplementation) to assert every
// target resolves to a real route and the index covers every lesson and service.
//
// Why it lives here: keeping the registry, the mappers, and the one match path
// in the pure layer means the island and the gate share a single source of
// truth. The island maps a chosen entry to a plain navigation; it never receives
// a function in props.

import type { Domain, ServiceEntry } from "./types";

// A primary navigation destination. `href` is root-relative and is asserted by
// the gate to resolve to a real page route. `keywords` are extra search terms so
// a plain query ("mock", "glossary") finds the target even when the label does
// not contain the word.
export interface NavTarget {
  id: string;
  label: string;
  href: string;
  group: "navigate";
  keywords?: string[];
}

// One non-draft lesson in the search index. `slug` is the lesson id (the route
// slug); `href` is its page. Built from frontmatter only (title + description) —
// the lesson MDX body is code + prose, so indexing it would surface import paths
// and component names; the curated frontmatter is the high-signal text.
export interface LessonIndexEntry {
  slug: string;
  title: string;
  description: string;
  domain: Domain;
  href: string;
  group: "lesson";
}

// One catalog service in the search index. `keywords` is the pre-lowercased,
// joined haystack so the matcher only runs a substring test per keystroke.
// `href` deep-links to the catalog pre-seeded with the service name via a query
// param, because the catalog is one page with a client-side filter (no
// per-service anchor); the gate strips the query before matching, so the route
// it checks is `/catalog`.
export interface ServiceIndexEntry {
  id: string;
  name: string;
  href: string;
  group: "service";
  keywords: string;
}

// The union the matcher ranks/filters over. The `group` discriminant lets the
// island render grouped sections (Go to / Lessons / Services).
export type CommandItem = NavTarget | LessonIndexEntry | ServiceIndexEntry;

// The hand-authored primary destinations. A superset of the visible header nav:
// it also covers the practice modes, the coverage map, the cheat sheets, the
// progress dashboard, and the exam-day checklist — the palette's "go to" set.
// Ids are stable kebab-case so a future "recent commands" feature can persist
// them. Every href is root-relative and must resolve to a real page (the gate
// enforces this); /exam-day is the one destination whose page lands in a later
// change, tracked as the single pending route in the gate.
export const NAV_TARGETS: NavTarget[] = [
  { id: "go-home", label: "Home", href: "/", group: "navigate", keywords: ["home", "start"] },
  { id: "go-learn", label: "Lessons", href: "/learn", group: "navigate", keywords: ["lessons", "study", "learn"] },
  { id: "go-practice", label: "Practice", href: "/practice", group: "navigate", keywords: ["practice", "quiz"] },
  { id: "go-exam", label: "Full mock exam", href: "/practice/exam", group: "navigate", keywords: ["mock", "test", "timed"] },
  { id: "go-review", label: "Review queue", href: "/practice/review", group: "navigate", keywords: ["review", "missed", "flagged"] },
  { id: "go-drill", label: "Weak-area drill", href: "/practice/drill", group: "navigate", keywords: ["drill", "weak", "adaptive"] },
  { id: "go-flashcards", label: "Flashcards", href: "/practice/flashcards", group: "navigate", keywords: ["cards", "recall", "flashcards"] },
  { id: "go-catalog", label: "Service catalog", href: "/catalog", group: "navigate", keywords: ["services", "glossary", "catalog"] },
  { id: "go-coverage", label: "Exam coverage map", href: "/coverage", group: "navigate", keywords: ["coverage", "blueprint", "domains"] },
  { id: "go-cheat-sheet", label: "Cheat sheets", href: "/cheat-sheet", group: "navigate", keywords: ["cheatsheet", "summary", "cheat sheet"] },
  { id: "go-progress", label: "Your progress", href: "/progress", group: "navigate", keywords: ["progress", "readiness", "score"] },
  { id: "go-exam-day", label: "Exam-day checklist", href: "/exam-day", group: "navigate", keywords: ["exam day", "format", "scaled score"] },
  { id: "go-about", label: "About", href: "/about", group: "navigate", keywords: ["about", "sources"] },
];

// The getCollection("lessons") entry shape this mapper consumes. Declared
// locally (not imported from astro:content) so the build-time gate can call the
// mapper with the same shape assembled from globbed frontmatter, without the
// Astro content runtime.
interface LessonCollectionEntry {
  id: string;
  data: {
    title: string;
    description: string;
    domain: Domain;
    draft: boolean;
  };
}

// Map the lesson collection to the search index, dropping drafts (the shipped
// non-draft filter). The page calls getCollection and passes the entries; this
// stays pure so the gate can map the same set and compare slugs exactly.
export function buildLessonIndex(
  lessons: LessonCollectionEntry[],
): LessonIndexEntry[] {
  return lessons
    .filter((l) => !l.data.draft)
    .map((l) => ({
      slug: l.id,
      title: l.data.title,
      description: l.data.description,
      domain: l.data.domain,
      href: `/learn/${l.id}`,
      group: "lesson" as const,
    }));
}

// The pinned searchable field set for a service, kept verbatim in lockstep with
// CatalogBrowser: name, shortName, aliases, category, relatedTerms. purpose is
// intentionally excluded — it makes matches noisy and is not needed for the
// glossary role; aliases and relatedTerms are included so plain-concept queries
// resolve (e.g. "object storage" finds Amazon S3). Lowercased once here so the
// matcher only runs .includes per keystroke.
function serviceKeywords(s: ServiceEntry): string {
  return [
    s.name,
    s.shortName ?? "",
    ...(s.aliases ?? []),
    s.category,
    ...(s.relatedTerms ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

// Map the typed catalog to the search index. href deep-links to /catalog
// pre-seeded with the service name (?q=) because the catalog is one filtered
// page with no per-service anchor; the route still resolves to /catalog, which
// is what the gate checks (it strips the query string first).
export function buildServiceIndex(
  services: ServiceEntry[],
): ServiceIndexEntry[] {
  return services.map((s) => ({
    id: s.id,
    name: s.name,
    href: `/catalog?q=${encodeURIComponent(s.name)}`,
    group: "service" as const,
    keywords: serviceKeywords(s),
  }));
}

// The lowercased searchable text for any command item. A service entry already
// carries its lowercased haystack; a nav target joins its label and keywords; a
// lesson joins its title and description. The island precomputes this once at
// index build; the matcher just runs .includes.
export function haystack(item: CommandItem): string {
  switch (item.group) {
    case "navigate":
      return [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase();
    case "lesson":
      return [item.title, item.description].join(" ").toLowerCase();
    case "service":
      return item.keywords;
  }
}

// The ONE match path the island and the gate share. Trim + lowercase the query;
// an empty query returns the items unchanged; otherwise return the items whose
// haystack includes the needle. Input order is preserved (deterministic, stable)
// so the island's active-index roving is predictable.
export function filterCommands<T extends CommandItem>(
  query: string,
  items: T[],
): T[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") return items;
  return items.filter((item) => haystack(item).includes(needle));
}

// The verified exam-day source links the exam-day page renders. Every fact on
// that page is quoted from the official AWS exam guide; these four URLs are the
// only safe homes for the citations: each is on the AWS-host allowlist AND
// returns 200 directly. The canonical exam-guide .html deep link 302-redirects
// to a different path (the live link-checker flags a moved page) and the guide
// PDF is on an off-allowlist host, so NEITHER is cited here — they would fail
// the gate / the link-checker by design. The gate asserts each url parses, is
// allowlisted, and matches no historical-reference marker, because the
// link-checker does not scan .astro pages and so cannot guard these otherwise.
export const EXAM_DAY_CITATIONS: { id: string; url: string; label: string }[] = [
  {
    id: "cert-landing",
    url: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
    label: "AWS Certification — Cloud Practitioner",
  },
  {
    id: "cert-faqs",
    url: "https://aws.amazon.com/certification/faqs/",
    label: "AWS Certification — FAQs",
  },
  {
    id: "cert-policies",
    url: "https://aws.amazon.com/certification/policies/",
    label: "AWS Certification — Policies",
  },
  {
    id: "exam-guides",
    url: "https://docs.aws.amazon.com/aws-certification/latest/examguides/",
    label: "AWS Certification — Exam Guides",
  },
];
