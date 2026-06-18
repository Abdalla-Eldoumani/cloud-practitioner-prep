// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Set this to the deployed origin before launch. Sitemap and canonical URLs read from it.
const SITE = process.env.SITE_URL ?? "https://cloud-practitioner-prep.vercel.app";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // Static output: the whole site is prerendered. Quiz state lives in the browser,
  // so no server runtime is needed and the site hosts anywhere static.
  output: "static",
  integrations: [react(), mdx(), sitemap()],
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
