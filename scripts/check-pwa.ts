// Structural gate for the installable-offline-updatable build contract. It
// asserts over the BUILT `dist/` (plus two source files) that the app ships a
// valid web manifest with the install-critical icons that actually exist, a
// service worker whose Workbox precache covers every offline surface, and the
// prompt-mode update lifecycle wired end to end (the config choice + the mounted
// reload affordance). It makes NO network call — it reads files and asserts
// structure — so it needs no system CA; but because it reads the built output,
// it runs AFTER `npm run build`.
//
// Unlike the content gates, an EMPTY input here is a FAILURE, not a clean pass:
// the build is this gate's precondition. If `dist/` (or the manifest) is absent,
// the `dist-present` rule fails loudly and tells the runner to build first — a
// missing build can never silently pass.
//
// Rules (each a named hard-failure group; collected, grouped-printed, exit 0/1):
//   dist-present          dist/ exists with an index.html AND a manifest is
//                         found; otherwise fail "run build first" and exit 1.
//   manifest-valid        the manifest parses as JSON (a parse error is a
//                         reported failure, never an uncaught throw) and carries
//                         non-empty name / short_name / start_url / scope /
//                         display / theme_color / background_color + a non-empty
//                         icons array.
//   icons-exist           the icons set includes a 192, a 512, and a maskable,
//                         and EVERY icons[].src resolves to a real file on disk
//                         under dist/ (resolved from the manifest, so it holds
//                         regardless of which icon-generation path the build
//                         took).
//   sw-emitted            dist/sw.js exists AND a dist/workbox-*.js runtime
//                         sibling exists.
//   precache-covers       the precache entry list (the {url,revision} entries in
//                         sw.js / the workbox sibling) references at least one
//                         .html, one .js (an island chunk), one .css, and one
//                         .woff2 — so no named surface is left uncached. A
//                         missing class fails (e.g. no .woff2 -> offline fonts
//                         missing); an undiscoverable list is itself a failure.
//   register-type-prompt  astro.config.mjs declares registerType 'prompt' (NOT
//                         autoUpdate), and the emitted sw.js reflects prompt mode:
//                         it carries the SKIP_WAITING message handshake (client-
//                         triggered activation) and does NOT clientsClaim at
//                         install (autoUpdate's unconditional take-over).
//   cleanup-outdated      astro.config.mjs configures cleanupOutdatedCaches AND
//                         the emitted sw.js calls it (stale precaches are evicted
//                         after a new deploy).
//   island-mounted        src/layouts/BaseLayout.astro imports ReloadPrompt from
//                         "@/components/pwa/ReloadPrompt" AND mounts it with a
//                         client directive, so the prompt-mode reload UX is wired
//                         (the user-facing half of the lifecycle).
//
// Mirrors check-diagrams.ts / check-nav.ts: a self-contained tsx CLI reusing the
// Reporter + the resolveGlob Windows fix. Run via `npm run check:pwa` AFTER
// `npm run build` (sandbox OFF, as a script file — it prints nothing under the
// default sandbox; it makes no network call, so no --use-system-ca).

import { globby } from "globby";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Resolve a path relative to this module into a glob globby accepts on every
// platform (the Windows backslash/drive-letter fix mirrored from content-lib.ts).
function resolveGlob(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url)).replace(/\\/g, "/");
}

const DIST_ROOT = resolveGlob("../dist");
const DIST_INDEX = `${DIST_ROOT}/index.html`;
const SW_PATH = `${DIST_ROOT}/sw.js`;
const WORKBOX_GLOB = `${DIST_ROOT}/workbox-*.js`;
const MANIFEST_WEBMANIFEST_GLOB = `${DIST_ROOT}/*.webmanifest`;
const MANIFEST_JSON = `${DIST_ROOT}/manifest.json`;
const ASTRO_CONFIG = resolveGlob("../astro.config.mjs");
const BASE_LAYOUT = resolveGlob("../src/layouts/BaseLayout.astro");

// The manifest fields an installable PWA must carry, each non-empty. name +
// icons drive the install prompt; start_url/scope/display make it launch as an
// app; the colors theme the splash + OS chrome.
const REQUIRED_MANIFEST_FIELDS = [
  "name",
  "short_name",
  "start_url",
  "scope",
  "display",
  "theme_color",
  "background_color",
] as const;

interface ManifestIcon {
  src?: unknown;
  sizes?: unknown;
  purpose?: unknown;
}

interface Manifest {
  [key: string]: unknown;
  icons?: unknown;
}

class Reporter {
  private failures = new Map<string, string[]>();

  fail(rule: string, detail: string): void {
    if (!this.failures.has(rule)) this.failures.set(rule, []);
    this.failures.get(rule)!.push(detail);
  }

  hasFailures(): boolean {
    return this.failures.size > 0;
  }

  print(): void {
    if (this.failures.size === 0) {
      console.log(
        "\nPASS: the build is installable (valid manifest + icons on disk), offline-capable (the service worker precache covers the HTML, the island JS, the CSS, and the fonts), and prompt-mode updatable (the lifecycle config + the mounted reload prompt).",
      );
      return;
    }
    let total = 0;
    console.error("\nFAIL: PWA build-contract violations:");
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

// Pull the precached URL list out of the service worker (and any workbox
// sibling). vite-plugin-pwa injects the precache as `precacheAndRoute([{ url,
// revision }, ...])` inlined in sw.js; read both files and collect every `url:`
// string literal across them, so the assertion holds whether the list is in
// sw.js or a sibling chunk. Returns the raw url strings (some are extensionless
// routes served via directoryIndex; the class check below only needs the
// extensioned assets to be present).
function precacheUrls(sources: string[]): string[] {
  const urls: string[] = [];
  const re = /url\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  for (const source of sources) {
    for (const m of source.matchAll(re)) {
      if (typeof m[1] === "string") urls.push(m[1]);
    }
  }
  return urls;
}

async function main(): Promise<void> {
  const report = new Reporter();

  // ---- dist-present: the non-silent-pass guard ----
  // Locate the manifest robustly: the integration default is a .webmanifest, but
  // a manifest.json is the other legal name. Glob the former, fall back to the
  // latter.
  const webmanifests = await globby(MANIFEST_WEBMANIFEST_GLOB);
  let manifestPath: string | undefined = webmanifests[0];
  if (!manifestPath && existsSync(MANIFEST_JSON)) manifestPath = MANIFEST_JSON;

  if (!existsSync(DIST_INDEX) || !manifestPath) {
    report.fail(
      "dist-present",
      "dist/ not found or empty — run `npm run build` before `npm run check:pwa` (this gate asserts over the built output)",
    );
    report.print();
    process.exit(1);
  }

  // ---- manifest-valid: parses + required fields non-empty ----
  let manifest: Manifest | undefined;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  } catch (err) {
    report.fail(
      "manifest-valid",
      `${manifestPath}: not valid JSON (${(err as Error).message})`,
    );
  }

  let icons: ManifestIcon[] = [];
  let manifestName = "(unparsed)";
  if (manifest) {
    for (const field of REQUIRED_MANIFEST_FIELDS) {
      const value = manifest[field];
      if (typeof value !== "string" || value.trim() === "") {
        report.fail(
          "manifest-valid",
          `manifest field "${field}" is missing or empty`,
        );
      }
    }
    if (typeof manifest.name === "string") manifestName = manifest.name;
    if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      report.fail("manifest-valid", "manifest icons[] is missing or empty");
    } else {
      icons = manifest.icons as ManifestIcon[];
    }
  }

  // ---- icons-exist: 192 + 512 + maskable, every src present on disk ----
  if (icons.length > 0) {
    const sizesSet = new Set<string>();
    let hasMaskable = false;
    for (const icon of icons) {
      if (typeof icon.sizes === "string") sizesSet.add(icon.sizes);
      if (
        typeof icon.purpose === "string" &&
        icon.purpose.split(/\s+/).includes("maskable")
      ) {
        hasMaskable = true;
      }
      // Every referenced src must resolve to a real file under dist/. Resolving
      // from the manifest (the source of truth) makes this robust to whichever
      // icon-generation path the build took.
      if (typeof icon.src !== "string" || icon.src.trim() === "") {
        report.fail("icons-exist", "an icon entry has no src");
        continue;
      }
      const rel = icon.src.replace(/^\//, "");
      if (!existsSync(`${DIST_ROOT}/${rel}`)) {
        report.fail(
          "icons-exist",
          `manifest icon "${icon.src}" does not exist on disk under dist/`,
        );
      }
    }
    const has = (target: string): boolean =>
      [...sizesSet].some((s) => s.split(/\s+/).includes(target));
    if (!has("192x192")) {
      report.fail("icons-exist", "no 192x192 icon (install-critical)");
    }
    if (!has("512x512")) {
      report.fail("icons-exist", "no 512x512 icon (install-critical)");
    }
    if (!hasMaskable) {
      report.fail(
        "icons-exist",
        "no icon with purpose maskable (the adaptive-shape install icon)",
      );
    }
  }

  // ---- sw-emitted: the generated worker + its runtime sibling ----
  const swExists = existsSync(SW_PATH);
  if (!swExists) {
    report.fail("sw-emitted", "dist/sw.js was not emitted");
  }
  const workboxFiles = await globby(WORKBOX_GLOB);
  if (workboxFiles.length === 0) {
    report.fail("sw-emitted", "no dist/workbox-*.js runtime sibling was emitted");
  }

  // ---- precache-covers: every offline surface class is precached ----
  const swSource = swExists ? readFileSync(SW_PATH, "utf8") : "";
  const workboxSource = workboxFiles
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  const urls = precacheUrls([swSource, workboxSource]);
  const precacheCount = urls.length;
  if (urls.length === 0) {
    report.fail(
      "precache-covers",
      "no precache entry list found in sw.js or the workbox sibling (the precache must be discoverable)",
    );
  } else {
    // The four classes a fully-offline lesson page needs: the page itself, the
    // island JS that carries the baked-in bank/catalog/diagram data, the
    // stylesheet, and the fonts. A glob regression that drops a class would
    // leave that surface broken offline, so each is asserted.
    //
    // Hashed assets (js/css/woff2) carry their extension in the precache URL, so
    // a suffix match finds them. HTML is the exception: Workbox precaches each
    // route as an EXTENSIONLESS url ("/", "about", "cheat-sheet/4") and resolves
    // it to the page via a `directoryIndex` of index.html — so a literal
    // "...html" url need not appear even though every page is precached. The
    // HTML surface is therefore covered when either a "...html" url is present
    // OR the SW declares an index.html directoryIndex (which only an HTML-route
    // precache emits) alongside the root entry. Grounding the HTML check in this
    // real emitted shape keeps it from a false failure on a fully-precached build.
    const assetClasses: Array<[string, RegExp]> = [
      [".js", /\.js$/],
      [".css", /\.css$/],
      [".woff2", /\.woff2$/],
    ];
    for (const [label, re] of assetClasses) {
      if (!urls.some((u) => re.test(u))) {
        report.fail(
          "precache-covers",
          `precache references no ${label} — that offline surface would be missing`,
        );
      }
    }
    const htmlByExtension = urls.some((u) => /\.html$/.test(u));
    const htmlByDirectoryIndex =
      /directoryIndex\s*:\s*"[^"]*\.html"/.test(swSource) &&
      urls.some((u) => u === "/" || !/\.[a-z0-9]+$/i.test(u));
    if (!htmlByExtension && !htmlByDirectoryIndex) {
      report.fail(
        "precache-covers",
        "precache references no HTML page (no .html url and no index.html directoryIndex over the route entries) — pages would be missing offline",
      );
    }
  }

  // ---- register-type-prompt + cleanup-outdated: the config source ----
  // The config is the source of truth for the lifecycle choice; the emitted SW
  // corroborates it. Keep the source assertions tolerant of quoting/spacing.
  let configSource = "";
  try {
    configSource = readFileSync(ASTRO_CONFIG, "utf8");
  } catch {
    report.fail(
      "register-type-prompt",
      `cannot read ${ASTRO_CONFIG} (the lifecycle config is asserted from source)`,
    );
  }
  if (configSource) {
    if (!/registerType:\s*['"]prompt['"]/.test(configSource)) {
      report.fail(
        "register-type-prompt",
        "astro.config.mjs does not set registerType: 'prompt'",
      );
    }
    if (/registerType:\s*['"]autoUpdate['"]/.test(configSource)) {
      report.fail(
        "register-type-prompt",
        "astro.config.mjs sets registerType: 'autoUpdate' — a new deploy would reload a learner out of an in-progress timed exam",
      );
    }
    if (!/cleanupOutdatedCaches/.test(configSource)) {
      report.fail(
        "cleanup-outdated",
        "astro.config.mjs does not configure cleanupOutdatedCaches (stale precaches would not be evicted)",
      );
    }
  }
  // The emitted SW must reflect prompt mode: a SKIP_WAITING message handshake
  // (the worker activates only when the client posts SKIP_WAITING, i.e. when the
  // reload prompt is accepted) and NOT a clientsClaim (autoUpdate's install-time
  // unconditional take-over). Grounding this in the real sw.js makes the rule
  // bite a build that silently flipped to autoUpdate even if the config text
  // looked right.
  if (swSource) {
    if (!/SKIP_WAITING/.test(swSource)) {
      report.fail(
        "register-type-prompt",
        "dist/sw.js carries no SKIP_WAITING message handshake (the prompt-mode client-triggered activation)",
      );
    }
    if (/clientsClaim/.test(swSource)) {
      report.fail(
        "register-type-prompt",
        "dist/sw.js calls clientsClaim — that is autoUpdate's install-time take-over, not prompt mode",
      );
    }
    if (!/cleanupOutdatedCaches/.test(swSource)) {
      report.fail(
        "cleanup-outdated",
        "dist/sw.js does not call cleanupOutdatedCaches (the configured eviction did not reach the emitted worker)",
      );
    }
  }

  // ---- island-mounted: BaseLayout imports + mounts ReloadPrompt ----
  let layoutSource = "";
  try {
    layoutSource = readFileSync(BASE_LAYOUT, "utf8");
  } catch {
    report.fail(
      "island-mounted",
      `cannot read ${BASE_LAYOUT} (the layout must mount the reload prompt)`,
    );
  }
  if (layoutSource) {
    // The import binds ReloadPrompt from the pwa component path (tolerant of a
    // .tsx suffix on the specifier).
    const importRe =
      /import\s+ReloadPrompt\b[^;]*from\s+["']@\/components\/pwa\/ReloadPrompt(?:\.tsx)?["']/;
    if (!importRe.test(layoutSource)) {
      report.fail(
        "island-mounted",
        'BaseLayout.astro does not import ReloadPrompt from "@/components/pwa/ReloadPrompt"',
      );
    }
    // The mount with a client directive (client:idle / client:load / ...).
    if (!/<ReloadPrompt\b[^>]*\bclient:/.test(layoutSource)) {
      report.fail(
        "island-mounted",
        "BaseLayout.astro does not mount <ReloadPrompt ... client:...> (the prompt UX would never hydrate)",
      );
    }
  }

  console.log(
    `pwa check: manifest "${manifestName}", ${icons.length} icon(s), precache ${precacheCount} entries, registerType prompt, island mounted.`,
  );
  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
