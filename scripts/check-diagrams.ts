// Convention-based, self-discovering gate for the interactive lesson diagrams.
// It has NO hand-maintained per-diagram list: it globs the diagram modules and
// reads their exports, so the diagram plans add modules without ever editing
// this file, and it stays green before any diagram exists (the empty glob is a
// clean pass). It tightens automatically as each diagram lands.
//
// The convention each diagram module follows (and which this gate depends on):
// every `src/components/diagrams/<Name>Diagram.tsx` default-exports the React
// component AND exports a named `meta` object:
//
//   export const meta = {
//     lessonSlug: string;          // target lesson basename, e.g. "vpc-networking"
//     check: KnowledgeCheckDatum;  // the module's inline knowledge-check datum
//     serviceIds?: string[];       // only on the core-services map (catalog ids)
//   };
//
// Because the gate dynamically imports each module to read `meta`, the modules
// keep their top-level scope side-effect-free (the component is a function
// declaration; importing it does not render), so a bare import() needs no DOM —
// the same way check-mock imports pure data from modules that also export
// non-pure helpers. `meta` is a plain export for exactly this reason.
//
// Rules (each a named hard-failure group; collected, grouped-printed, exit 0/1):
//   discover              every module exports a meta with lessonSlug + check.
//   embed                 the meta.lessonSlug lesson MDX imports the component
//                         from "@/components/diagrams/<Name>" AND uses it with a
//                         client directive.
//   accessible-name       the module source references DiagramFigure AND carries
//                         an accessible-name token (a title= prop, aria-label, or
//                         an svg <title>).
//   no-raw-hex            no raw hex color literal in the module source.
//   key-consistency       meta.check: correct non-empty, every correct id in
//                         options, option ids unique, and no option-letter /
//                         positional phrasing in any option text or explanation
//                         (the reused lint-content regex).
//   service-labels-resolve  when meta.serviceIds is present, every id resolves to
//                         a real catalog ServiceEntry.
//
// Mirrors check-deck.ts / check-mock.ts: a self-contained tsx CLI. Run via
// `npm run check:diagrams` (sandbox OFF, as a script file — it prints nothing
// under the default sandbox; it makes no network call, so no --use-system-ca).

import { globby } from "globby";
import matter from "gray-matter";
import { basename } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { OPTION_LETTER_RE } from "./content-lib";
import { serviceById } from "../src/data/services/index";
import type { KnowledgeCheckDatum } from "../src/components/diagrams/KnowledgeCheck";

// Resolve a path relative to this module into a glob globby accepts on every
// platform (the Windows backslash/drive-letter fix mirrored from content-lib.ts).
function resolveGlob(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url)).replace(/\\/g, "/");
}

const DIAGRAMS_GLOB = resolveGlob("../src/components/diagrams/*Diagram.tsx");
const LESSONS_DIR = resolveGlob("../src/content/lessons");

// The shape the gate reads off each module. Only meta is required; the default
// export (the component) is not needed for these structural assertions.
interface DiagramMeta {
  lessonSlug?: unknown;
  check?: unknown;
  serviceIds?: unknown;
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
        "\nPASS: every diagram module exports a valid meta, is embedded in its lesson with an accessible name, uses tokens only, and carries an internally consistent knowledge-check.",
      );
      return;
    }
    let total = 0;
    console.error("\nFAIL: diagram contract violations:");
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

// A raw hex color literal: a # followed by exactly 3 or 6 hex digits at a word
// boundary (so #fff and #2a4fcb match, but an id fragment like #callout-1 does
// not). Token utilities / currentColor are the only allowed color source.
const RAW_HEX_RE = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/;

// Validate one meta.check as a KnowledgeCheckDatum, collecting every problem.
function checkKey(report: Reporter, name: string, check: unknown): void {
  if (typeof check !== "object" || check === null) {
    report.fail("key-consistency", `${name}: meta.check is not an object`);
    return;
  }
  const datum = check as Partial<KnowledgeCheckDatum>;
  const options = Array.isArray(datum.options) ? datum.options : [];
  const correct = Array.isArray(datum.correct) ? datum.correct : [];

  if (options.length === 0) {
    report.fail("key-consistency", `${name}: meta.check.options is empty`);
  }
  const ids = options.map((o) => o?.id);
  // Unique option ids.
  if (new Set(ids).size !== ids.length) {
    report.fail("key-consistency", `${name}: duplicate option id in meta.check`);
  }
  // correct non-empty and a subset of the option ids.
  if (correct.length === 0) {
    report.fail("key-consistency", `${name}: meta.check.correct is empty`);
  }
  const idSet = new Set(ids);
  for (const id of correct) {
    if (!idSet.has(id)) {
      report.fail(
        "key-consistency",
        `${name}: correct id "${id}" is not one of the option ids`,
      );
    }
  }
  // No option-letter / positional phrasing in any option text or the explanation
  // (options render shuffled; "option b" / "the second option" desyncs).
  for (const o of options) {
    if (typeof o?.text === "string" && OPTION_LETTER_RE.test(o.text)) {
      report.fail(
        "key-consistency",
        `${name}: option text uses an option-letter/positional reference: "${o.text}"`,
      );
    }
  }
  if (
    typeof datum.explanation === "string" &&
    OPTION_LETTER_RE.test(datum.explanation)
  ) {
    report.fail(
      "key-consistency",
      `${name}: explanation uses an option-letter/positional reference`,
    );
  }
}

async function main(): Promise<void> {
  const report = new Reporter();

  const moduleFiles = await globby(DIAGRAMS_GLOB);

  // No diagram modules yet (the foundation state). Every downstream rule is
  // vacuous, so the gate announces the empty discovery and exits clean.
  if (moduleFiles.length === 0) {
    console.log(
      "Diagram contract: no diagram modules yet (glob src/components/diagrams/*Diagram.tsx is empty); every rule is vacuous.",
    );
    report.print();
    process.exit(0);
  }

  for (const file of moduleFiles) {
    // The component name is the filename without extension (e.g. VpcDiagram),
    // which is also the import binding and the JSX tag the lesson uses.
    const name = basename(file, ".tsx");
    const source = readFileSync(file, "utf8");

    // ---- no-raw-hex: token utilities / currentColor only ----
    if (RAW_HEX_RE.test(source)) {
      const hit = source.match(RAW_HEX_RE)?.[0] ?? "(hex)";
      report.fail("no-raw-hex", `${name}: raw hex color literal ${hit}`);
    }

    // ---- accessible-name: inherits the DiagramFigure shell + a name token ----
    const usesFigure = /\bDiagramFigure\b/.test(source);
    if (!usesFigure) {
      report.fail(
        "accessible-name",
        `${name}: does not reference DiagramFigure (the shared accessibility shell)`,
      );
    }
    // A name token: a title= prop (literal OR expression), an aria-label, or an
    // svg <title>. Tolerant by design — the embed passes title={expr}, not only
    // a string literal — but not so broad that a nameless figure passes.
    const hasNameToken =
      /\btitle\s*=\s*[{"']/.test(source) ||
      /\baria-label\s*=/.test(source) ||
      /<title[\s>]/.test(source);
    if (!hasNameToken) {
      report.fail(
        "accessible-name",
        `${name}: no accessible-name token (a title= prop, aria-label, or <title>)`,
      );
    }

    // ---- discover: import the module and read its meta export ----
    let meta: DiagramMeta | undefined;
    try {
      const mod = await import(pathToFileURL(file).href);
      meta = mod.meta as DiagramMeta | undefined;
    } catch (err) {
      report.fail(
        "discover",
        `${name}: failed to import module (${(err as Error).message})`,
      );
      continue;
    }
    if (!meta || typeof meta !== "object") {
      report.fail("discover", `${name}: missing a named meta export`);
      continue;
    }
    const lessonSlug =
      typeof meta.lessonSlug === "string" ? meta.lessonSlug : undefined;
    if (!lessonSlug) {
      report.fail("discover", `${name}: meta.lessonSlug is missing or not a string`);
    }
    if (meta.check === undefined) {
      report.fail("discover", `${name}: meta.check is missing`);
    }

    // ---- key-consistency: validate the knowledge-check datum ----
    if (meta.check !== undefined) {
      checkKey(report, name, meta.check);
    }

    // ---- embed: the lesson MDX imports + uses the component ----
    if (lessonSlug) {
      const lessonPath = `${LESSONS_DIR}/${lessonSlug}.mdx`;
      let body: string;
      try {
        const raw = readFileSync(lessonPath, "utf8");
        body = matter(raw).content; // frontmatter off
      } catch {
        report.fail(
          "embed",
          `${name}: target lesson "${lessonSlug}.mdx" not found`,
        );
        body = "";
      }
      if (body) {
        // The import line. Tolerant of a `{ meta as X }` clause: match an import
        // that binds `name` (the default) from the diagram module path, with any
        // additional named bindings after it.
        const importRe = new RegExp(
          `import\\s+${name}\\b[^;]*from\\s+["']@/components/diagrams/${name}["']`,
        );
        if (!importRe.test(body)) {
          report.fail(
            "embed",
            `${name}: lesson "${lessonSlug}.mdx" does not import ${name} from "@/components/diagrams/${name}"`,
          );
        }
        // The JSX usage with a client directive (client:visible / client:load /
        // client:only etc.). `<Name ... client:` on the same opening tag.
        const usageRe = new RegExp(`<${name}\\b[^>]*\\bclient:`);
        if (!usageRe.test(body)) {
          report.fail(
            "embed",
            `${name}: lesson "${lessonSlug}.mdx" does not use <${name} ... client:...>`,
          );
        }
      }
    }

    // ---- service-labels-resolve: catalog ids must resolve (core-services map) ----
    if (meta.serviceIds !== undefined) {
      if (!Array.isArray(meta.serviceIds)) {
        report.fail(
          "service-labels-resolve",
          `${name}: meta.serviceIds is present but not an array`,
        );
      } else {
        for (const id of meta.serviceIds) {
          if (typeof id !== "string" || serviceById(id) === undefined) {
            report.fail(
              "service-labels-resolve",
              `${name}: serviceId "${String(id)}" does not resolve to a catalog service`,
            );
          }
        }
      }
    }
  }

  console.log(
    `Diagram contract: discovered ${moduleFiles.length} diagram module(s); asserted discover / embed / accessible-name / no-raw-hex / key-consistency / service-labels-resolve.`,
  );
  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
