// Reference link-checker (the broken / non-AWS-host / historical-reference
// guard). Collects every reference URL in the question bank plus every link in
// the lesson MDX, dedupes, and checks each distinct URL.
//
// Offline by default: structural checks only, no network. A malformed URL, a
// non-AWS host, or a historical-reference path fails the check. The host
// allowlist is enforced before any fetch, so live mode never reaches a non-AWS
// host.
//
// Live mode (--live): additionally fetches each distinct URL and flags a
// removed-page status (404/410) or a redirect to a different path (a soft-404
// signal). A known AWS host often gatekeeps an automated request (403/405) or
// rate-limits a burst (429), and a 5xx is a transient blip — those are retried
// and then treated as reachable, never reported as a dead reference. Live HTTPS to
// the AWS docs host is unreliable behind an HTTPS-inspecting proxy, so run live
// mode in CI (no proxy) or locally with `NODE_OPTIONS=--use-system-ca`. This
// script never sets NODE_TLS_REJECT_UNAUTHORIZED; disabling TLS verification is
// not an option.

import {
  AWS_HOSTS,
  HISTORICAL_MARKERS,
  catalogRefUrls,
  extractMdxLinks,
  parseUrl,
  questionRefUrls,
} from "./content-lib";

interface Failure {
  url: string;
  reason: string;
}

// Compare two URLs by host + pathname. A redirect whose target path differs
// from the request path is a soft-404 signal: the old URL resolves but the
// cited content has moved, so a naive 200 check would wrongly pass.
function samePath(from: URL, to: URL): boolean {
  const strip = (p: string) => p.replace(/\/+$/, "");
  return from.host === to.host && strip(from.pathname) === strip(to.pathname);
}

async function main(): Promise<void> {
  const live = process.argv.includes("--live");

  const all = [
    ...questionRefUrls(),
    ...catalogRefUrls(),
    ...(await extractMdxLinks()),
  ];
  const distinct = [...new Set(all)].sort();

  const failures: Failure[] = [];

  // Structural checks run for every URL, offline. These also gate which URLs
  // are eligible to be fetched in live mode: only a well-formed, allowlisted,
  // non-historical URL is ever requested.
  const fetchable: URL[] = [];
  for (const raw of distinct) {
    const parsed = parseUrl(raw);
    if (!parsed) {
      failures.push({ url: raw, reason: "malformed URL" });
      continue;
    }
    if (!AWS_HOSTS.has(parsed.host)) {
      failures.push({ url: raw, reason: `non-AWS host: ${parsed.host}` });
      continue;
    }
    if (HISTORICAL_MARKERS.some((re) => re.test(raw))) {
      failures.push({ url: raw, reason: "historical-reference page" });
      continue;
    }
    fetchable.push(parsed);
  }

  // Live checks run only when asked, and only against URLs that passed the
  // structural gate above (so a non-AWS host is never fetched). Only a removed
  // page (404/410) or a soft-404 redirect fails: AWS hosts routinely gatekeep an
  // automated GET (403/405) or rate-limit a burst (429), and a 5xx is a server
  // blip — none mean the page is gone, so they are retried and then treated as
  // reachable rather than flaking the run.
  if (live) {
    const TRANSIENT = new Set([408, 425, 429, 500, 502, 503, 504]);
    const GONE = new Set([404, 410]);
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (const url of fetchable) {
      let res: Response | null = null;
      let netError = "";
      // Up to three attempts with backoff so a transient status or a dropped
      // connection under a burst does not fail a link that is actually live.
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await sleep(400 * attempt);
        try {
          res = await fetch(url.href, { method: "GET", redirect: "manual" });
        } catch (err) {
          res = null;
          netError = err instanceof Error ? err.message : String(err);
          continue;
        }
        if (!TRANSIENT.has(res.status)) break; // settled: good, gone, gated, or a redirect
      }

      if (res === null) {
        failures.push({ url: url.href, reason: `fetch failed: ${netError}` });
        continue;
      }
      if (GONE.has(res.status)) {
        failures.push({ url: url.href, reason: `HTTP ${res.status}` });
        continue;
      }
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        const target = location ? parseUrl(new URL(location, url).href) : null;
        if (!target || !samePath(url, target)) {
          failures.push({
            url: url.href,
            reason: `redirect to a different path (${location ?? "no location"}) — review for a moved page`,
          });
        }
      }
      // Anything else (2xx, a gated 403/405, or a transient status that never
      // settled) means the page is there for our purposes — not a failure.
    }
  }

  // Report.
  const mode = live ? "live" : "offline";
  console.log(
    `Link check (${mode}): ${distinct.length} distinct URLs from ${all.length} references.`,
  );

  if (failures.length === 0) {
    console.log(`PASS: every URL is on an official AWS host and well-formed${live ? " and reachable" : ""}.`);
    process.exit(0);
  }

  // Group failures by reason class for a readable report.
  console.error(`\nFAIL: ${failures.length} link problem(s):\n`);
  for (const f of failures) {
    console.error(`  - ${f.reason}\n      ${f.url}`);
  }
  console.error(`\n${failures.length} link problem(s).`);
  process.exit(1);
}

main().catch((err) => {
  console.error("check-links crashed:", err);
  process.exit(1);
});
