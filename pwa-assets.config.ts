import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Generate the full installable icon set from the single brand mark. The
// minimal-2023 preset emits the transparent 64/192/512 icons, a maskable 512
// (its own safe-zone padding), an apple-touch 180, and the favicon, so the
// manifest and the home-screen presentation derive from one source image.
export default defineConfig({
  preset: minimal2023Preset,
  images: ["public/favicon.svg"],
});
