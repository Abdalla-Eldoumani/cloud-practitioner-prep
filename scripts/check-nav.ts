// Convention-based, self-discovering gate for the command palette, the
// cross-content search index, and the exam-day citations. It imports the REAL
// NAV_TARGETS / buildLessonIndex / buildServiceIndex / EXAM_DAY_CITATIONS from
// the navigation module (never a reimplementation) and discovers the real
// page-route set by globbing src/pages, so a pass is a guarantee about shipped
// data: every navigable target resolves to a route that exists, the index
// covers every non-draft lesson and every catalog service exactly, and every
// exam-day citation is an allowlisted, non-historical AWS URL.
//
// Why a dedicated gate: the reference link-checker (check-links.ts) scans the
// question bank, the catalog, and the lesson MDX bodies — it does NOT scan
// .astro pages. The exam-day page is .astro, so its AWS citations would rot
// undetected. Keeping the citations as typed data (EXAM_DAY_CITATIONS) and
// asserting them here, reusing the same AWS_HOSTS + HISTORICAL_MARKERS the
// link-checker uses, closes that blind spot.
//
// Rules (each a named hard-failure group; collected, grouped-printed, exit 0/1):
//   routes-resolve       every NAV_TARGETS / lesson / service href resolves to a
//                        real page route (query stripped; a dynamic segment
//                        resolves to its parent base). A missing route is fatal,
//                        EXCEPT a href in PENDING_ROUTES, which emits a notice.
//   registry-wellformed  NAV_TARGETS ids unique + non-empty, hrefs root-relative,
//                        labels non-empty.
//   lesson-coverage      buildLessonIndex over the globbed lessons covers EVERY
//                        non-draft slug and no extra (exact set equality).
//   service-coverage     buildServiceIndex over ALL_SERVICES covers EVERY service
//                        id and no extra (exact set equality).
//   citations-allowlisted  every EXAM_DAY_CITATIONS url parses, is on AWS_HOSTS,
//                        and matches no HISTORICAL_MARKER.
//   exam-day-literals    src/pages/exam-day.astro imports EXAM AND carries no
//                        bare exam-fact number (65/50/700/90) in its body where a
//                        typed EXAM constant exists. This makes "the page sources
//                        EXAM" enforceable: a number that drifts from EXAM by
//                        being re-typed as a literal fails, so the page can only
//                        derive it (EXAM.questionCount / scoredCount /
//                        passingScaledScore / round(timeLimitSeconds/60)).
//
// PENDING_ROUTES: routes planned in a later change. routes-resolve emits a
// notice (not a failure) for a PENDING href whose page file is absent, and each
// entry is removed here when its page lands. It is currently empty: the exam-day
// page now exists, so its route is fully fatal like every other target (the
// mechanism stays for any future planned route). Every NON-pending missing route
// is fatal — the gate stays non-vacuous.
//
// Mirrors check-diagrams.ts / check-mock.ts: a self-contained tsx CLI. Run via
// `npm run check:nav` (sandbox OFF, as a script file — it prints nothing under
// the default sandbox; it makes no network call, so no --use-system-ca).

import { globby } from "globby";
import matter from "gray-matter";
import { basename, extname } from "node:path";
import { readFileSync } from "node:fs";
import {
  AWS_HOSTS,
  HISTORICAL_MARKERS,
  parseUrl,
  resolveGlob,
} from "./content-lib";
import {
  EXAM_DAY_CITATIONS,
  NAV_TARGETS,
  buildLessonIndex,
  buildServiceIndex,
} from "../src/lib/navigation";
import { ALL_SERVICES } from "../src/data/services/index";
import { EXAM } from "../src/lib/constants";
import type { Domain } from "../src/lib/types";

// Routes planned in a later change. A PENDING href whose page is absent is a
// notice, not a failure; remove an entry here when its page lands. Currently
// empty — every navigable route now resolves to a real page.
const PENDING_ROUTES = new Set<string>([]);

const PAGES_GLOB = resolveGlob("../src/pages/**/*.{astro,md,mdx}");
const PAGES_ROOT = resolveGlob("../src/pages");
const LESSONS_GLOB = resolveGlob("../src/content/lessons/**/*.{md,mdx}");
const EXAM_DAY_PAGE = resolveGlob("../src/pages/exam-day.astro");

// The exam-fact numbers that have a typed EXAM home, so the exam-day page must
// derive each from EXAM rather than re-type it as a bare literal. Drawn from the
// SAME EXAM constant the page imports (never re-hardcoded here): the question
// count, the scored count, the passing scaled score, and the minutes the page
// renders as Math.round(timeLimitSeconds / 60). A bare occurrence of one of
// these as a standalone number in the page body is the drift this rule catches.
const EXAM_FACT_LITERALS = new Set<number>([
  EXAM.questionCount,
  EXAM.scoredCount,
  EXAM.passingScaledScore,
  Math.round(EXAM.timeLimitSeconds / 60),
]);

class Reporter {
  private failures = new Map<string, string[]>();
  private notes: string[] = [];

  fail(rule: string, detail: string): void {
    if (!this.failures.has(rule)) this.failures.set(rule, []);
    this.failures.get(rule)!.push(detail);
  }

  note(detail: string): void {
    this.notes.push(detail);
  }

  hasFailures(): boolean {
    return this.failures.size > 0;
  }

  print(): void {
    if (this.notes.length > 0) {
      console.log("\nNotes (informational, non-blocking):");
      for (const n of this.notes) console.log(`  - ${n}`);
    }

    if (this.failures.size === 0) {
      console.log(
        "\nPASS: every command/lesson/service target resolves to a real route, the index covers every lesson and service exactly, every exam-day citation is allowlisted and non-historical, and the exam-day page sources its fact numbers from EXAM.",
      );
      return;
    }
    let total = 0;
    console.error("\nFAIL: navigation contract violations:");
    for (const [rule, items] of this.failures) {
      total += items.length;
      console.error(`  [${rule}] ${items.length}`);
      for (const d of items) console.error(`      - ${d}`);
    }
    console.error(
      `\n${total} violation(s) across ${this.failures.size} rule(s).`,
    );
  }
}

// Turn one page file path into the route it serves, plus whether that route is
// a DYNAMIC base (a parent that also covers deeper child paths). The path is
// relative to src/pages; strip the extension, then:
//   index            -> the directory it sits in (index.astro -> /, the dir/)
//   [...slug]/[x]    -> the PARENT base, marked dynamic (learn/[...slug] ->
//                       /learn covers /learn AND every /learn/<slug>;
//                       practice/[domain] -> /practice covers /practice/<n>)
//   anything else    -> the file's own path, exact-only (catalog -> /catalog)
// The leading slash is always present; a trailing slash is trimmed (except "/").
function routeForFile(relPath: string): { route: string; dynamic: boolean } {
  const noExt = relPath.slice(0, relPath.length - extname(relPath).length);
  const segments = noExt.split("/").filter((s) => s.length > 0);
  const last = segments[segments.length - 1];

  let dynamic = false;
  // index.astro serves its directory (an exact route).
  if (last === "index") segments.pop();
  // A dynamic segment ([slug], [...slug], [domain]) is served by its parent
  // base, which covers every dynamic child below it, not just the base itself.
  else if (last !== undefined && last.startsWith("[")) {
    segments.pop();
    dynamic = true;
  }

  const raw = "/" + segments.join("/");
  const route = raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw;
  return { route, dynamic };
}

// The route an href maps to for resolution: drop any query string (a service
// deep-links to /catalog?q=..., which resolves to /catalog) and trim a trailing
// slash so "/learn/" and "/learn" compare equal. The root "/" is preserved.
function routeForHref(href: string): string {
  const noQuery = href.split("?")[0] ?? href;
  return noQuery.length > 1 && noQuery.endsWith("/")
    ? noQuery.slice(0, -1)
    : noQuery;
}

// The getCollection-shaped lesson entry assembled from globbed frontmatter, so
// buildLessonIndex can consume it without the Astro content runtime. The schema
// guarantees these fields exist (and validates them at build); the gate reads
// them structurally and treats a missing draft as the schema default (false).
interface ShapedLesson {
  id: string;
  data: { title: string; description: string; domain: Domain; draft: boolean };
}

async function loadLessons(): Promise<ShapedLesson[]> {
  // Exclude uppercase-named files, mirroring src/content.config.ts, so a stray
  // doc file in the lessons directory never counts as a lesson.
  const files = await globby([LESSONS_GLOB, "!" + resolveGlob("../src/content/lessons/**/[A-Z]*")]);
  const lessons: ShapedLesson[] = [];
  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    const fm = matter(raw).data as Record<string, unknown>;
    lessons.push({
      id: basename(file, extname(file)),
      data: {
        title: typeof fm.title === "string" ? fm.title : "",
        description: typeof fm.description === "string" ? fm.description : "",
        domain: (fm.domain as Domain) ?? 1,
        draft: fm.draft === true,
      },
    });
  }
  return lessons;
}

async function main(): Promise<void> {
  const report = new Reporter();

  // ---- discover the real page-route set ----
  // exactRoutes: routes that match a href verbatim (static pages + index dirs).
  // dynamicBases: parent bases of a dynamic segment, each covering itself AND
  // any deeper child path (so /learn covers every /learn/<slug>).
  const pageFiles = await globby(PAGES_GLOB);
  const exactRoutes = new Set<string>();
  const dynamicBases = new Set<string>();
  for (const file of pageFiles) {
    // Path relative to src/pages, forward-slashed (resolveGlob already
    // normalized the glob; the matched paths are forward-slashed too).
    const rel = file.startsWith(`${PAGES_ROOT}/`)
      ? file.slice(PAGES_ROOT.length + 1)
      : file;
    const { route, dynamic } = routeForFile(rel);
    exactRoutes.add(route);
    if (dynamic) dynamicBases.add(route);
  }
  // A route resolves if it is an exact route, or it sits under a dynamic base
  // (the base itself, or any deeper path beneath it).
  const routeExists = (route: string): boolean => {
    if (exactRoutes.has(route)) return true;
    for (const base of dynamicBases) {
      if (route === base || route.startsWith(`${base}/`)) return true;
    }
    return false;
  };
  const routeCount = exactRoutes.size;

  // A shared resolver: a href resolves if its route exists in the discovered
  // set. A miss is fatal unless the (post-strip) route is a documented pending
  // one, in which case it is a notice.
  const resolveOrReport = (id: string, href: string): void => {
    const route = routeForHref(href);
    if (routeExists(route)) return;
    if (PENDING_ROUTES.has(route)) {
      report.note(
        `routes-resolve: "${id}" -> ${href} is a pending route (${route}); its page lands in a later change.`,
      );
      return;
    }
    report.fail(
      "routes-resolve",
      `"${id}" -> ${href} resolves to ${route}, which matches no page route`,
    );
  };

  // ---- registry-wellformed + routes-resolve over NAV_TARGETS ----
  const seenIds = new Set<string>();
  for (const t of NAV_TARGETS) {
    if (!t.id || t.id.trim() === "") {
      report.fail("registry-wellformed", `a NAV_TARGETS entry has an empty id`);
    } else if (seenIds.has(t.id)) {
      report.fail("registry-wellformed", `duplicate NAV_TARGETS id: ${t.id}`);
    } else {
      seenIds.add(t.id);
    }
    if (!t.label || t.label.trim() === "") {
      report.fail("registry-wellformed", `${t.id || "(no id)"}: empty label`);
    }
    if (!t.href.startsWith("/")) {
      report.fail(
        "registry-wellformed",
        `${t.id}: href "${t.href}" is not root-relative`,
      );
    }
    resolveOrReport(t.id, t.href);
  }

  // ---- lesson-coverage: exact set equality vs the globbed non-draft slugs ----
  const lessons = await loadLessons();
  const expectedLessonSlugs = new Set(
    lessons.filter((l) => !l.data.draft).map((l) => l.id),
  );
  const lessonIndex = buildLessonIndex(lessons);
  const indexedLessonSlugs = new Set(lessonIndex.map((e) => e.slug));
  for (const slug of expectedLessonSlugs) {
    if (!indexedLessonSlugs.has(slug)) {
      report.fail(
        "lesson-coverage",
        `non-draft lesson "${slug}" is missing from the built index`,
      );
    }
  }
  for (const slug of indexedLessonSlugs) {
    if (!expectedLessonSlugs.has(slug)) {
      report.fail(
        "lesson-coverage",
        `index has an extra lesson "${slug}" not among the non-draft lessons`,
      );
    }
  }
  // routes-resolve over each built lesson href.
  for (const e of lessonIndex) resolveOrReport(e.slug, e.href);

  // ---- service-coverage: exact set equality vs ALL_SERVICES ids ----
  const expectedServiceIds = new Set(ALL_SERVICES.map((s) => s.id));
  const serviceIndex = buildServiceIndex(ALL_SERVICES);
  const indexedServiceIds = new Set(serviceIndex.map((e) => e.id));
  for (const id of expectedServiceIds) {
    if (!indexedServiceIds.has(id)) {
      report.fail(
        "service-coverage",
        `catalog service "${id}" is missing from the built index`,
      );
    }
  }
  for (const id of indexedServiceIds) {
    if (!expectedServiceIds.has(id)) {
      report.fail(
        "service-coverage",
        `index has an extra service "${id}" not in the catalog`,
      );
    }
  }
  // routes-resolve over each built service href (post-strip -> /catalog).
  for (const e of serviceIndex) resolveOrReport(e.id, e.href);

  // ---- citations-allowlisted: each url parses, allowlisted, non-historical ----
  for (const c of EXAM_DAY_CITATIONS) {
    const parsed = parseUrl(c.url);
    if (!parsed) {
      report.fail(
        "citations-allowlisted",
        `${c.id}: malformed URL "${c.url}"`,
      );
      continue;
    }
    if (!AWS_HOSTS.has(parsed.host)) {
      report.fail(
        "citations-allowlisted",
        `${c.id}: non-AWS host "${parsed.host}" (${c.url})`,
      );
    }
    if (HISTORICAL_MARKERS.some((re) => re.test(c.url))) {
      report.fail(
        "citations-allowlisted",
        `${c.id}: historical-reference URL "${c.url}"`,
      );
    }
  }

  // ---- exam-day-literals: the page sources EXAM, no re-typed fact number ----
  // The page renders the verified exam-format numbers; they must come from the
  // typed EXAM constant, not be re-typed as bare literals (a re-typed number can
  // drift from EXAM and ship uncaught — the link-checker does not scan .astro,
  // and routes-resolve only proves the page exists, not that its facts match
  // EXAM). This rule makes "facts come from EXAM" enforceable. It (a) requires an
  // EXAM import/reference in the frontmatter, then (b) strips every {...} JSX
  // expression from the body (those are the legitimate EXAM-derived insertions,
  // e.g. {EXAM.passingScaledScore} / {minutes}) and fails on any standalone
  // EXAM-fact number (65/50/700/90) left in the literal markup text.
  let examDaySource = "";
  try {
    examDaySource = readFileSync(EXAM_DAY_PAGE, "utf8");
  } catch {
    report.fail(
      "exam-day-literals",
      `cannot read ${EXAM_DAY_PAGE} (the exam-day page must exist and source EXAM)`,
    );
  }
  if (examDaySource) {
    // Split the frontmatter (the first --- fenced block) from the body markup.
    const fmMatch = examDaySource.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const frontmatter = fmMatch ? fmMatch[1] : "";
    const body = fmMatch
      ? examDaySource.slice(fmMatch[0].length)
      : examDaySource;

    if (!/\bEXAM\b/.test(frontmatter)) {
      report.fail(
        "exam-day-literals",
        "exam-day.astro frontmatter does not reference EXAM — every exam-fact number must come from the typed EXAM constant",
      );
    }

    // Drop every {...} JSX expression: those are the EXAM-derived interpolations
    // (and any other computed value). What remains is the literal text the page
    // hard-codes — a fact number there is the re-typed drift this rule forbids.
    const literalText = body.replace(/\{[^{}]*\}/g, " ");
    for (const m of literalText.matchAll(/(?<![\d.,])\d+(?![\d.,])/g)) {
      const value = Number(m[0]);
      if (EXAM_FACT_LITERALS.has(value)) {
        report.fail(
          "exam-day-literals",
          `exam-day.astro hard-codes the exam-fact number ${value} as a bare literal; derive it from EXAM (e.g. EXAM.questionCount / EXAM.scoredCount / EXAM.passingScaledScore / Math.round(EXAM.timeLimitSeconds / 60))`,
        );
      }
    }
  }

  console.log(
    `nav check: ${routeCount} routes, ${expectedLessonSlugs.size} lessons, ${ALL_SERVICES.length} services, ${EXAM_DAY_CITATIONS.length} citations.`,
  );
  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
