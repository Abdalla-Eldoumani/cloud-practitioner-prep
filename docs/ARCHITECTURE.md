# Architecture

This document explains how Cloud Practitioner Prep is built, so you can read the
codebase quickly, change it safely, or fork it into your own study site for a
different exam.

## The shape of it

It is a static site. Astro renders every page to plain HTML at build time, and a
few small React components ("islands") hydrate in the browser only where a page
needs interactivity, the quiz engine, the catalog filter, the diagrams. There is
no backend, no database, no accounts, and no tracking. All learner state, which
lessons are done, attempt history, the review queue, lives in the browser's
local storage and never leaves the device.

That choice drives most of the design: anything dynamic either runs at build
time (turning typed data into pages) or runs entirely in the visitor's browser.

## Stack

- **Astro** (static output) renders pages and owns the content collections.
- **React** islands provide the interactive pieces, hydrated lazily.
- **Tailwind CSS v4** (via `@tailwindcss/vite`) handles styling through design
  tokens; there is no raw hex in components.
- **nanostores** holds the small amount of shared client state (progress, theme).
- **TypeScript** throughout, including the question bank and the study data.
- **MDX** authors the lessons.
- **`@vite-pwa/astro`** (Workbox) makes the site installable and offline-capable.
- Fonts are self-hosted with Fontsource (Archivo for UI, Literata for lesson
  prose, Sometype Mono for figures and labels), so nothing loads from a
  third-party origin at runtime.

## Directory map

```
src/
  pages/         routes (see below); everything here is rendered by Astro
  layouts/       BaseLayout (the shell, head, nav, footer) and LessonLayout
  components/    presentational .astro components and React islands (.tsx)
    catalog/     the service-catalog browser island and its cards
    diagrams/    interactive lesson diagrams + the shared accessible-SVG shell
    quiz/        the practice/exam/review engine, flashcards, results
    navigation/  the command palette island
    pwa/         the update-available reload prompt island
  content/
    lessons/     the MDX lessons (a content collection)
  content.config.ts   the lesson frontmatter schema
  data/          the typed source of truth: questions, services, study plan,
                 and the exam blueprint (task statements)
  lib/           types, constants, scoring, exam building, progress, the
                 nanostores store, navigation index, and the review scheduler
  styles/        global.css: the Tailwind import and the design tokens
scripts/         the verification gate (one tsx check per concern)
docs/            this guide plus contributing, security, code of conduct, changelog
public/          static assets served as-is: favicon, robots.txt, _headers, og.png
astro.config.mjs the site origin and the integrations (React, MDX, sitemap, PWA)
vercel.json      the production security and caching headers
```

The project documentation lives in `docs/`, not at the repository root, so the
root holds only `README.md` and `LICENSE`. GitHub looks for the community health
files in `.github/`, then the root, then `docs/`, and uses the first copy it
finds, so a single copy in `docs/` still backs the issue, pull request, and
security surfaces. Keep exactly one copy of each: a file re-added at the root
silently shadows the one here.

## Routes

Pages live in `src/pages/` and map directly to URLs:

- `/` the home page and the seven-day plan.
- `/learn` the lesson index; `/learn/<slug>` a single lesson (from MDX).
- `/practice` the hub; `/practice/<domain>` per-domain drills; `/practice/exam`
  the timed mock; `/practice/review` the review queue; `/practice/drill` the
  adaptive weak-area drill; `/practice/flashcards` the flashcard deck.
- `/catalog` the AWS service catalog browser.
- `/coverage` the exam blueprint mapped to lessons and question counts.
- `/cheat-sheet` and `/cheat-sheet/<domain>` the printable per-domain summaries.
- `/exam-day` the zero-JavaScript exam-day facts page.
- `/progress` the readiness dashboard and progress import/export.
- `/about`, and a `404`.

## Data is the source of truth

Content is typed data, not prose scattered through components. Questions live in
`src/data/questions/` as per-domain topic files, each exporting an array that is
collected once in `index.ts` into `ALL_QUESTIONS`. Services live in
`src/data/services/`, the study plan in `src/data/study-plan`, and the exam
blueprint (the official task statements) in `src/data/blueprint`. Pages read this
data at build time and pass only what a page needs to its islands as plain
JSON-serializable props, so an island never imports the whole catalog or question
bank into the browser bundle.

The constants that describe the exam itself, question count, scored split, time
limit, passing scaled score, domain weights, live once in `src/lib/constants`
(`EXAM`, `DOMAINS`). Pages and the exam builder read them; no page re-hardcodes a
number. Change a fact there and it updates everywhere, including the structured
data.

## How questions are filed and tagged

A question's `domain` is the domain the official CLF-C02 exam guide places its
task statement in. The bank does not depart from the guide anywhere: the guide
files global infrastructure under Domain 3 and migration under Domain 1, so that
is how those questions are tagged, and nothing downstream is written to
compensate for a question sitting in the wrong domain.

The file a question lives in follows from its domain. Every question sits in a
`domain-N-*.ts` file whose `N` equals its `domain` field, split by subject within
the domain (`domain-3-ec2.ts`, `domain-3-storage.ts`, `domain-4-pricing.ts`), and
a new subject just gets a new file wired through `index.ts`. Retagging a question
and relocating it are therefore the same change, and the content lint fails on any
mismatch between a file name and the domains inside it. That rule is why
`domain-1-global.ts` became `domain-3-global.ts`, and why the migration and
monitoring clusters moved into `domain-1-migration-caf.ts` and
`domain-2-monitoring-audit.ts`.

Question ids do not follow. An id is the key a learner's saved progress, review
queue, and attempt history are stored under, so it never changes, not on a retag
and not on a move. `domain-3-global.ts` holds `d1-global-` ids and
`domain-1-migration-caf.ts` holds `d4-supportmig-` ids: a prefix records where a
question was first written, each such file says so in its header, and the lint
deliberately does not read prefixes. Never renumber ids to tidy this up.

`topic` is the join key to the exam blueprint. `src/data/blueprint.ts` lists, for
each of the 19 task statements, the lesson slugs and question topics that cover
it. The coverage page resolves that join at build time, matching questions on
domain plus normalized topic and lessons on slug. The join is total in both
directions: every statement resolves to at least one lesson and one question, and
every question resolves to at least one statement. The count in the page footer
is derived from the join rather than from the size of the bank, so it reports
what the page actually maps.

## The islands and shared state

Islands take plain props and hydrate with the lightest correct strategy:
`client:visible` for things below the fold (diagrams, the lesson-complete
button), `client:idle` for the always-present site-wide pieces (the command
palette, the reload prompt), and `client:load` only where interaction can happen
immediately. Shared client state, the progress object and the theme, goes
through the nanostores atoms in `src/lib/store.ts`; components subscribe rather
than duplicating state. Progress is read from and written to local storage with a
versioned key, and a migration runs on load so an older saved shape upgrades
cleanly instead of breaking.

## The quiz engine

`src/components/quiz/QuizEngine.tsx` runs practice, exam, and review modes. A few
rules are load-bearing:

- Answer options shuffle per question instance, and scoring compares option ids,
  never positions or letters. A resumed exam restores the exact saved option
  order so the screen matches what the learner left.
- The exam timer derives remaining time from a stored start timestamp and
  persists across a reload, so refreshing does not reset the clock.
- Review mode orders the union of flagged and missed questions by a spaced
  repetition schedule (`src/lib/review.ts`, a Leitner-box scheduler) and records
  each grade on reveal.

Scoring (`src/lib/scoring`) reports a raw percent, a per-domain breakdown, and a
conservative readiness band. It is deliberately never presented as the AWS scaled
score; the two are kept separate everywhere.

## Content accuracy

Every AWS fact in a lesson, question, or explanation traces to an official AWS
documentation URL and is verified against it before it ships. Lessons carry an
`updated` date that records when their facts were last checked. The practice
questions are original and test understanding; they are not copied exam items.
This is the project's core promise, and the gate enforces parts of it
mechanically (see below).

## SEO and structured data

`BaseLayout` owns the head: a unique title and description per page, canonical
and Open Graph and Twitter tags resolved against the configured site origin, and
JSON-LD. A site-wide graph (a `WebSite` with a catalog search action and the
publishing `Organization`) renders on every page; pages pass page-specific
JSON-LD through a `jsonLd` prop, the lessons emit `LearningResource` and
`BreadcrumbList`, the lesson index a `Course`, and the exam-day page an
`FAQPage`. Every fact in the structured data is built from the same typed
constants as the visible page, so the two cannot drift.

## Progressive web app

`@vite-pwa/astro` precaches the built HTML, JS, CSS, SVG, and fonts with Workbox
and serves a same-origin service worker. Updates are opt-in: a new version
surfaces a reload prompt rather than reloading automatically, so it never
interrupts an in-progress timed exam. The manifest, theme color, and touch icon
are declared explicitly in the head.

## Security posture

The site is static, so the attack surface is small by design. There is no
server-side code and no data collection. All untrusted input, the catalog search
query, an imported progress file, renders as text and is never evaluated as HTML.
Production responses carry a strict Content-Security-Policy, HSTS, `nosniff`,
`frame-ancestors 'none'`, a cross-origin opener policy, and a restrictive
permissions policy (in `vercel.json`, mirrored in `public/_headers` for other
hosts). See [SECURITY.md](./SECURITY.md).

## The verification gate

`scripts/` holds a focused check per concern, wired as npm scripts and run in CI:
content and catalog lints, the diagram and navigation contracts, the PWA head
check, the question shuffle uniformity check, and behavioral checks for the
drill, mock, deck, review schedule, readiness, progress migration, and progress
import/export. `npm run build` runs the type check and a full build; the link
checker validates the documentation references. Run these before sending a change;
see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Making your own version

Because the content is typed data and the origin is configurable, forking this
into a study site for a different exam is mostly a content exercise:

1. Set `SITE_URL` (or the `site` value in `astro.config.mjs`) to your origin, and
   update the `Sitemap:` line in `public/robots.txt` to match.
2. Replace the questions in `src/data/questions/`, the services in
   `src/data/services/`, the blueprint in `src/data/blueprint`, and the lessons
   in `src/content/lessons/`.
3. Update the exam facts in `src/lib/constants` (`EXAM`, `DOMAINS`).
4. Keep the content-integrity rules: original questions, every fact sourced, and
   run the gate.

The engine, scoring, progress, diagrams, and PWA carry over unchanged.
