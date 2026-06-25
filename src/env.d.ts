/// <reference path="../.astro/types.d.ts" />
/// <reference types="vite-plugin-pwa/react" />

// Variable font packages are imported for their side effects (the @font-face CSS).
// They ship no type declarations, so declare them as ambient modules.
declare module "@fontsource-variable/inter";
declare module "@fontsource-variable/source-serif-4";
