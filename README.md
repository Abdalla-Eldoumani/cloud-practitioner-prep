# Cloud Practitioner Prep

[![CI](https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep/actions/workflows/ci.yml/badge.svg)](https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep/actions/workflows/ci.yml)

Free, open-source study site for the AWS Certified Cloud Practitioner exam (CLF-C02):
23 lessons, 911 original practice questions, timed mock exams, and a readiness dashboard.
Everything runs in your browser. Nothing to sign up for.

Built to take someone with no cloud background from zero to exam-ready in about a week.

## Why this exists

Most free CLF-C02 material is either a wall of slides or a pile of leaked questions. This site
is neither. The lessons teach the concepts the exam covers, every AWS fact is checked against
current AWS documentation, and every question is original and links to the doc that backs its
answer.

## What you get

- 23 lessons across the four exam domains, each showing when its facts were last verified
- 911 original questions, drilled by domain, with instant feedback, an explanation, and a
  documentation link on every question
- Timed 65-question mocks weighted like the real exam, with a 90-minute timer that survives a
  reload; repeat sittings prefer questions you have not seen, and your scores form a trend
- An adaptive drill that weights questions toward your weakest domains
- Flashcards over the service catalog and the questions you have missed
- A searchable catalog of every in-scope AWS service, with compare cards for the pairs people
  mix up
- Interactive diagrams with inline knowledge checks
- A spaced-repetition review queue for missed and flagged questions
- A coverage map from every CLF-C02 task statement to the lessons and questions that cover it
- Printable per-domain cheat sheets and an exam-day guide
- A readiness dashboard: raw percent, per-domain breakdown, mock trend, and a conservative
  ready-or-not signal (it is not the AWS scaled score, and the site says so)
- Progress kept in your browser, exportable as a JSON backup
- Installable as a PWA and fully usable offline
- Command palette (Ctrl/Cmd+K), keyboard-friendly quizzes, light and dark themes

No account, no backend, no tracking. Your data never leaves your device.

## The one-week path

The homepage lays out a seven-day plan that front-loads the two heaviest domains and puts timed
mocks on days five and seven. Follow it in order, or jump straight to what you need.

## Exam at a glance

65 questions in 90 minutes; 50 scored, 15 unscored. Domains: Cloud Concepts 24%, Security and
Compliance 30%, Cloud Technology and Services 34%, Billing, Pricing, and Support 12%. Scored
100 to 1000, pass at 700. Confirm the current details on the official AWS certification page
before you book.

## Run it locally

Requires Node 22.12 or newer.

```bash
git clone https://github.com/Abdalla-Eldoumani/cloud-practitioner-prep.git
cd cloud-practitioner-prep
npm install
npm run dev
```

`npm run build` writes the static site to `dist/`, `npm run preview` serves it, and
`npm run check` type-checks. The content has its own gates: `lint:content`,
`lint:distractors`, `lint:coverage`, `lint:catalog`, `lint:links`, `lint:shuffle`, and the
`check:*` engine scripts. CI runs all of them on every push.

Built with [Astro](https://astro.build), [React](https://react.dev) islands,
[Tailwind CSS](https://tailwindcss.com) v4, TypeScript, and MDX lessons.

## Deploy

The build is fully static, so it hosts anywhere that serves files. Set `SITE_URL` to your
origin (it feeds the sitemap and canonical URLs; the default is the project's Vercel URL) and
update the `Sitemap:` origin in `public/robots.txt` to match:

```bash
SITE_URL=https://your-domain.example npm run build
```

Upload `dist/`, or point a static host at the repo with build command `npm run build` and
output directory `dist/`. On [Vercel](https://vercel.com), importing the repo and accepting
the defaults does this.

## Docs and contributing

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md): how the site is built and how to fork it for
  a different exam
- [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md): setup and the content rules, with
  [docs/SECURITY.md](./docs/SECURITY.md) and
  [docs/CODE_OF_CONDUCT.md](./docs/CODE_OF_CONDUCT.md)
- [docs/CHANGELOG.md](./docs/CHANGELOG.md): release history

Contributions are welcome, especially questions, lessons, and corrections. The short version
of the rules: questions are original (never leaked or memorized exam items), every AWS fact
links to current AWS documentation, every question carries an explanation and a reference, and
lesson edits update the verified date. Open an issue first for anything large.

## Disclaimer

An independent study resource, not affiliated with, authorized by, or endorsed by Amazon Web
Services. AWS, Amazon Web Services, and related marks are trademarks of Amazon.com, Inc. or its
affiliates. Always confirm exam details on the official AWS certification site before you
register.

## License

MIT. See [LICENSE](./LICENSE).
