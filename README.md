# Cloud Practitioner Prep

A free, open-source study site for the AWS Certified Cloud Practitioner exam (CLF-C02). Read the
lessons, drill by domain, take full timed mock exams, and track your readiness, all in the browser
with nothing to sign up for.

The goal is simple: give someone with no prior cloud background a clear one-week path to
understanding AWS fundamentals and walking into the exam prepared.

## Why this exists

Most free CLF-C02 material is either a wall of slides or a pile of leaked exam questions. This site
is neither. The lessons are written to teach the concepts the exam covers, and every AWS fact is
checked against current AWS documentation. The practice questions are original and test
understanding; they are not copied exam items. Each question links to the AWS doc that backs its
answer so you can read further.

## What it does

- **Lessons** grouped by the four exam domains, written as focused reading with the must-know points
  and common traps called out. Each lesson shows when its facts were last verified against AWS docs.
- **Practice by domain** with immediate feedback, an explanation, and a documentation link on every
  question.
- **Full mock exam**: 65 questions weighted to match the real domain split, a 90-minute timer that
  survives a page reload, a question grid for jumping around, and flagging for review.
- **Honest scoring**: your result is a raw percent, a per-domain breakdown, and a readiness band. It
  is not the AWS scaled score, and the site says so plainly.
- **Progress tracking** kept in your browser: completed lessons, attempt history, your best mock, and
  a review queue of the questions you missed or flagged. Clear it any time.
- **Light and dark themes**, keyboard-friendly quizzes, and a layout that holds from phone to
  desktop.

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
npm run check     # type-check and validate content
```

## Deploy

The site builds to static files, so it hosts anywhere that serves static content. On
[Vercel](https://vercel.com), import the repository and accept the defaults; the build command is
`npm run build` and the output is `dist/`. No environment variables are required.

## Contributing

Contributions are welcome, especially new lessons, more practice questions, and corrections.

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
