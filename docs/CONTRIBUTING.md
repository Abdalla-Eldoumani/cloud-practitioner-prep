# Contributing

Thanks for helping improve Cloud Practitioner Prep. The most useful contributions
are new lessons, more practice questions, and corrections to anything that no
longer matches current AWS documentation.

This is a client-side static site. There is no backend, no database, and no
accounts. Everything runs in the browser and progress lives in local storage.

## Before you start

For anything larger than a small fix, open an issue first so we can agree on the
approach. For a focused correction or a few questions, a pull request is fine on
its own.

## Local setup

Requires Node 22.12 or newer.

```bash
git clone https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep.git
cd cloud-practitioner-prep
npm install
npm run dev
```

Useful scripts:

```bash
npm run dev       # start the dev server
npm run build     # type-check and build to dist/
npm run preview   # preview the production build
npm run check     # type-check only
npm run sync      # regenerate content types after a schema change
```

Content is validated separately, by one check per concern:

```bash
npm run lint:content    # the question bank: floors, duplicate stems, option wording
npm run lint:coverage   # the exam blueprint join, in both directions
npm run lint:catalog    # the service catalog
npm run lint:links      # every AWS reference URL (add --live to fetch each one)
npm run lint:shuffle    # answer-option position fairness
```

Run `npm run check` and the lint that covers what you touched before opening a
pull request, and fix anything they report. Continuous integration runs the full
set, including the diagram, navigation, engine, and built-PWA checks, on every
push, so a check skipped locally surfaces there instead.

## Content integrity rules

These rules are not optional. They are what makes this resource trustworthy.

- Questions must be original. Write them to test the concepts in the published
  exam guide. Never copy, paraphrase, or reconstruct real exam items, and never
  use leaked or shared exam content.
- Every AWS fact must trace to current AWS documentation. When you state a fact
  in a lesson or back an answer in a question, the source must be the official
  AWS docs, checked at the time you write it.
- Every question needs an explanation that says why the correct answer is right
  and why the distractors are wrong, plus at least one reference link to the AWS
  doc that supports it.
- Keep scoring honest. Results are a raw percent, a per-domain breakdown, and a
  readiness band. Do not present anything as the AWS scaled score.
- Use AWS trademarks only to describe the exam this material prepares for. Do not
  imply affiliation, sponsorship, or endorsement.

## Adding a question

Questions are plain typed TypeScript under `src/data/questions/`, split into
per-domain topic files (for example `domain-3-storage.ts`).

1. Add your question to the matching topic file, or create a new topic file for
   a new cluster.
2. If you created a new file, export its array and add it to `ALL_QUESTIONS` in
   `src/data/questions/index.ts`. That is the one place the files connect.
3. Give the question a unique, stable `id` (for example
   `d2-shared-responsibility-37`).
4. Set `type` to `single` (one correct option) or `multi` (two or more). The
   length of `correct` must match: 1 for single, 2 or more for multi.
5. Write the `explanation` and at least one `reference` URL into current AWS
   docs.
6. Run `npm run check`.

## Adding a lesson

Lessons are MDX in `src/content/lessons/`.

1. Add a new `.mdx` file. The file name without the extension is the lesson
   slug.
2. Fill the frontmatter to match the schema in `src/content.config.ts`: tag it
   to a domain and a study-plan day, and set `updated` to the date you verified
   its facts against AWS docs.
3. Run `npm run sync` so the content types regenerate, then `npm run check`.

When you change a lesson's facts, update its `updated` date in the same change.

## Commit and pull request style

- Atomic commits. One logical change per commit. Brief, lowercase, imperative
  messages.
- No emoji in code, comments, docs, or commit messages. Plain, direct prose.
  Comments explain why, not what.
- Keep changes surgical. Do not bundle unrelated edits or drive-by refactors
  into the same pull request.
- Describe what changed and, for content, link the AWS documentation that backs
  it.

## Reporting a problem

Open an issue. If a claim no longer matches the AWS documentation, include the
lesson or question and a link to the current AWS doc so it can be fixed quickly.
