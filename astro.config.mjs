// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Set this to the deployed origin before launch. Sitemap and canonical URLs read from it.
const SITE = "https://cloud-practitioner-prep.example";

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
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      wrap: true,
    },
  },
});
