// Reference link-checker (the broken / non-AWS-host / historical-reference
// guard). Collects every reference URL in the question bank plus every link in
// the lesson MDX, dedupes, and checks each distinct URL.
//
// Offline by default: structural checks only, no network. A malformed URL, a
// non-AWS host, or a historical-reference path fails the check. The host
// allowlist is enforced before any fetch, so live mode never reaches a non-AWS
// host.
//
// Live mode (--live): additionally fetches each distinct URL and flags an error
// status or a redirect to a different path (a soft-404 signal). Live HTTPS to
// the AWS docs host is unreliable behind an HTTPS-inspecting proxy, so run live
// mode in CI (no proxy) or locally with `NODE_OPTIONS=--use-system-ca`. This
// script never sets NODE_TLS_REJECT_UNAUTHORIZED; disabling TLS verification is
// not an option.

import {
  AWS_HOSTS,
  HISTORICAL_MARKERS,
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

  const all = [...questionRefUrls(), ...(await extractMdxLinks())];
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
  // structural gate above (so a non-AWS host is never fetched).
  if (live) {
    for (const url of fetchable) {
      try {
        const res = await fetch(url.href, {
          method: "GET",
          redirect: "manual",
        });
        if (res.status >= 400) {
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
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        failures.push({ url: url.href, reason: `fetch failed: ${message}` });
      }
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
