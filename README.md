# Cloud Practitioner Prep

[![CI](https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep/actions/workflows/ci.yml/badge.svg)](https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep/actions/workflows/ci.yml)

A free, open-source study site for the AWS Certified Cloud Practitioner exam (CLF-C02). Read 23
lessons, drill 911 original practice questions by domain, take full timed mock exams, and track your
readiness, all in the browser with nothing to sign up for.

The goal is simple: give someone with no prior cloud background a clear one-week path to
understanding AWS fundamentals and walking into the exam prepared.

## Why this exists

Most free CLF-C02 material is either a wall of slides or a pile of leaked exam questions. This site
is neither. The lessons are written to teach the concepts the exam covers, and every AWS fact is
checked against current AWS documentation. The practice questions are original and test
understanding; they are not copied exam items. Each question links to the AWS doc that backs its
answer so you can read further.

## What it does

- **23 lessons** grouped by the four exam domains, written as focused reading with the must-know
  points and common traps called out. Each lesson shows when its facts were last verified against AWS
  docs.
- **911 practice questions**, drilled by domain with immediate feedback, an explanation, and a
  documentation link on every question.
- **Timed mock exams**: 65 questions weighted to match the real domain split, a 90-minute timer that
  survives a page reload, a question grid for jumping around, and flagging for review. Sit it more
  than once; repeat sittings prefer questions you have not seen, and your scores form a trend.
- **Adaptive weak-area drill** that weights questions toward the domains you are weakest in, so each
  round targets what you most need.
- **Flashcards**: self-graded recall over the service catalog and the questions you have missed.
- **Service catalog**: every AWS service the exam can ask about, searchable and filterable by domain,
  with compare cards that pull apart the easily confused pairs.
- **Interactive diagrams** embedded in lessons, each with an inline knowledge check.
- **Review queue**: every question you missed or flagged, scheduled with spaced repetition so you
  revisit it at the right time.
- **Exam coverage map**: every CLF-C02 task statement from the AWS exam guide mapped to the lessons
  and practice questions that cover it, so nothing is missed.
- **Printable cheat sheets**, one per exam domain, for last-minute review.
- **Exam-day guide**: the format, timing, and how AWS's scaled score works.
- **Readiness dashboard**: a raw percent, a per-domain breakdown, a mock-score trend, and a
  conservative ready or not-yet signal. It is not the AWS scaled score, and the site says so plainly.
- **Progress in your browser**: completed lessons, attempt history, and your best mock, which you can
  export and import as a JSON backup or clear at any time.
- **Installable and offline**: a progressive web app you can install and keep using without a
  connection.
- **Command palette** (Cmd/Ctrl+K), keyboard-friendly quizzes, light and dark themes, and a layout
  that holds from phone to desktop.

Everything runs client-side. There is no account, no backend, and no tracking. Your progress lives
in your browser's local storage and never leaves your device.

## The one-week path

The homepage lays out a seven-day plan that front-loads the two heaviest domains (Security and
Compliance at 30 percent, Cloud Technology and Services at 34 percent) and adds timed mock exams on
days five and seven to build stamina. Follow it in order, or jump straight to the lessons and
practice that you need.

## Exam at a glance

The CLF-C02 exam has 65 questions in 90 minutes across four domains: Cloud Concepts (24 percent),
Security and Compliance (30 percent), Cloud Technology and Services (34 percent), and Billing,
Pricing, and Support (12 percent). Of the 65 questions, 50 are scored and 15 are unscored and not
identified. The score is reported on a 100 to 1000 scale, and 700 is the passing line. Confirm the
current details on the official AWS certification page before you book.

## Tech stack

- [Astro](https://astro.build) for the static site and content collections
- [React](https://react.dev) islands for the interactive quiz engine and dashboard
- [Tailwind CSS](https://tailwindcss.com) v4 for styling
- TypeScript throughout
- Lessons authored in MDX

The build is fully static and deploys to any static host.

## Run it locally

Requires Node 22.12 or newer.

```bash
git clone https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep.git
cd cloud-practitioner-prep
npm install
npm run dev
```

Open the URL the dev server prints. Useful scripts:

```bash
npm run dev       # start the dev server
npm run build     # build the static site to dist/
npm run preview   # preview the production build
npm run check     # type-check the project
```

Content is validated by its own checks, each behind an npm script: `lint:content` and
`lint:coverage` over the question bank and the exam blueprint, `lint:catalog` over the service
catalog, `lint:links` over every AWS reference, `lint:shuffle` over answer-option fairness, and the
`check:*` scripts over the quiz engine, diagrams, navigation, and the built PWA. Continuous
integration runs all of them on every push.

## Deploy

The site builds to static files in `dist/`, so it hosts anywhere that serves static content, with no
backend or database. Setting one environment variable is optional but recommended (see below).

Before you build for production, point the site at your real origin. The `site` value in
`astro.config.mjs` defaults to `https://cloud-practitioner-prep.vercel.app`, and the sitemap and the
canonical and Open Graph URLs are all generated from it. To deploy somewhere else, set the `SITE_URL`
environment variable to your origin (it overrides that default at build time), or edit the `site`
value directly. Also update the `Sitemap:` origin in `public/robots.txt` to match.

```bash
SITE_URL=https://your-domain.example npm run build
```

Then build and check the output locally:

```bash
npm run build     # writes dist/, including sitemap-index.xml
npm run preview   # serve dist/ to verify before you ship
```

Upload `dist/` to your host, or point a static host at the repository with build command
`npm run build` and output directory `dist/`. On [Vercel](https://vercel.com), importing the
repository and accepting the defaults does this.

## Documentation

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) explains how the site is built, the stack, the
  data-as-source-of-truth model, the quiz engine, and how to fork it for a different exam.
- [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md), [docs/SECURITY.md](./docs/SECURITY.md), and
  [docs/CODE_OF_CONDUCT.md](./docs/CODE_OF_CONDUCT.md) cover local setup, the content-integrity
  rules, the security posture, and how we work together.
- [docs/CHANGELOG.md](./docs/CHANGELOG.md) is the release history.

## Contributing

Contributions are welcome, especially new lessons, more practice questions, and corrections. See
[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for setup and the full rules; the essentials:

- Practice questions must be original and must test a concept. Do not submit leaked or memorized
  exam items.
- Every AWS fact must be backed by a link to current AWS documentation.
- Each question needs an explanation and at least one documentation reference.
- Keep lessons accurate and update the verified date when you change their facts.

Open an issue to discuss a larger change before you start, or send a pull request for a focused fix.

## Disclaimer

This is an independent study resource and is not affiliated with, authorized by, or endorsed by
Amazon Web Services. AWS, Amazon Web Services, and related marks are trademarks of Amazon.com, Inc.
or its affiliates. Always confirm exam details on the official AWS certification site before you
register.

## License

MIT. See [LICENSE](./LICENSE).
