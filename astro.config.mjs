// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import AstroPWA from "@vite-pwa/astro";
import tailwindcss from "@tailwindcss/vite";

// Set this to the deployed origin before launch. Sitemap and canonical URLs read from it.
const SITE = process.env.SITE_URL ?? "https://cloud-practitioner-prep.vercel.app";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // Static output: the whole site is prerendered. Quiz state lives in the browser,
  // so no server runtime is needed and the site hosts anywhere static.
  output: "static",
  integrations: [
    react(),
    mdx(),
    sitemap({
      // The app links, the canonical tags, and the service worker precache all
      // use slashless page URLs; the sitemap publishes the same form so search
      // engines send visitors to the exact paths the app serves offline.
      serialize(item) {
        const url = new URL(item.url);
        if (url.pathname.length > 1) {
          item.url = item.url.replace(/\/+$/, "");
        }
        return item;
      },
    }),
    AstroPWA({
      // prompt, not autoUpdate: a new version never reloads a learner out of an
      // in-progress timed exam. The reload offer is surfaced; the user decides.
      registerType: "prompt",
      manifest: {
        name: "Cloud Practitioner Prep",
        short_name: "CCP Prep",
        description:
          "Learn AWS and prepare for the Certified Cloud Practitioner exam with free lessons, practice questions, and full timed mock exams.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        // A manifest holds one static color, so it uses the light theme: the
        // brand for the theme color, the light surface for the background.
        theme_color: "#2a4fcb",
        background_color: "#fbfaf7",
      },
      // Wires pwa-assets.config.ts: the icon set is generated from favicon.svg.
      pwaAssets: { config: true },
      workbox: {
        // The whole static build is precached. Every offline surface ships its
        // data baked into this JS (the bank, the catalog, the diagrams never
        // fetch at runtime), so precaching the build covers them all. Source
        // maps and the sitemap are deliberately left out.
        globPatterns: ["**/*.{html,js,css,svg,woff2}"],
        // Supplying manifestTransforms replaces the integration's default
        // transform (the one that turns raw x/index.html paths into clean
        // URLs), so this transform does both jobs itself: each built page is
        // precached under the slashless URL every internal link uses AND under
        // the trailing-slash spelling a bookmark or older external link may
        // carry. A navigation that misses the precache falls back to the
        // shell, which would serve the wrong page, so both spellings must hit.
        manifestTransforms: [
          (entries) => {
            const manifest = entries.flatMap((e) => {
              if (e.url === "index.html") return [{ ...e, url: "/" }];
              if (e.url.endsWith("/index.html")) {
                const base = e.url.slice(0, -"/index.html".length);
                return [{ ...e, url: base }, { ...e, url: `${base}/` }];
              }
              if (e.url.endsWith(".html")) {
                const base = e.url.slice(0, -".html".length);
                return [{ ...e, url: base }, { ...e, url: `${base}/` }];
              }
              return [e];
            });
            return { manifest };
          },
        ],
        // Offline navigations fall back to the precached shell.
        navigateFallback: "/",
        // A new deploy revisions the precache; this evicts the prior one so a
        // returning user is never served a stale build.
        cleanupOutdatedCaches: true,
      },
      // Dev runs without the service worker; build + preview exercises the real
      // one. Keeps the SW from caching stale assets during development.
      devOptions: { enabled: false },
    }),
  ],
  vite: {
    // Tailwind v4 is wired through its official Vite plugin. The deprecated
    // @astrojs/tailwind integration is intentionally not used.
    // The cast bridges two Vite type trees: @tailwindcss/vite resolves Vite's
    // Plugin from its own copy, while Astro 6 type-checks against its bundled
    // rolldown-vite. The plugin is structurally compatible at runtime.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      wrap: true,
    },
  },
});
