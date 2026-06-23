// One-shot, idempotent codemod that stamps a last-verified date on every
// question that lacks one. Each question object carries a `reference: { ... }`
// block; this inserts `lastVerified: "<DATE>"` on its own line immediately
// after that block, at the reference key's indentation, preserving the file's
// trailing-comma style. Run once to backfill the bank; re-running is a no-op
// because objects that already have the key are skipped.
//
// Why a bounded structured edit and not a whole-file regex: the transform must
// touch exactly one line per object and nothing else, so it walks each topic
// file brace-by-brace, isolates each question object, and edits only the object
// that is missing the field. That keeps every other character byte-identical and
// makes the change trivially reviewable per file.
//
// Usage: NODE_OPTIONS=--use-system-ca npx tsx scripts/stamp-last-verified.ts

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { globby } from "globby";

// The date stamped on every backfilled question: the day the bank is verified.
const STAMP_DATE = "2026-06-23";

// Resolve a module-relative glob to an absolute, forward-slash pattern so fast-glob
// matches on Windows (a bare file URL pathname carries a leading-slash drive letter).
function resolveGlob(relative: string): string {
  const abs = fileURLToPath(new URL(relative, import.meta.url));
  return abs.split(path.sep).join("/");
}

// Walk the source from the object's opening brace and return the index of the
// line holding that object's matching close brace. Brace counting ignores braces
// inside string literals so option text or URLs containing "{" never miscount.
function findObjectCloseLine(lines: string[], openLine: number): number {
  let depth = 0;
  let started = false;
  for (let i = openLine; i < lines.length; i++) {
    const line = lines[i];
    let inString = false;
    let quote = "";
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (inString) {
        if (ch === "\\") {
          c++; // skip the escaped character
        } else if (ch === quote) {
          inString = false;
        }
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inString = true;
        quote = ch;
        continue;
      }
      if (ch === "{") {
        depth++;
        started = true;
      } else if (ch === "}") {
        depth--;
        if (started && depth === 0) {
          return i;
        }
      }
    }
  }
  return -1;
}

type FileResult = { file: string; stamped: number; alreadyStamped: number };

function stampFile(absPath: string): FileResult {
  const original = readFileSync(absPath, "utf8");
  const lines = original.split("\n");
  const display = absPath.split("/").slice(-1)[0];

  let stamped = 0;
  let alreadyStamped = 0;

  // Each top-level question object begins with an `id:` property line. Anchor on
  // that, find the object's close, and decide whether the object needs the field.
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*id:\s*["'`]/.test(lines[i])) continue;

    // The object opens on the line above the id property ("{" on its own line).
    let openLine = i;
    while (openLine > 0 && !/{\s*$/.test(lines[openLine])) openLine--;

    const closeLine = findObjectCloseLine(lines, openLine);
    if (closeLine < 0) continue;

    // Idempotency: if this object already declares lastVerified, leave it alone.
    let hasField = false;
    for (let j = openLine; j <= closeLine; j++) {
      if (/^\s*lastVerified\s*:/.test(lines[j])) {
        hasField = true;
        break;
      }
    }
    if (hasField) {
      alreadyStamped++;
      i = closeLine; // advance past this object
      continue;
    }

    // Find this object's `reference:` key line and the close of its block, so the
    // new line lands immediately after `reference: { ... }` at the same indent.
    let refLine = -1;
    for (let j = openLine; j <= closeLine; j++) {
      if (/^\s*reference\s*:\s*{/.test(lines[j])) {
        refLine = j;
        break;
      }
    }
    if (refLine < 0) {
      // No reference block (should not happen for a well-formed question): skip
      // rather than guess an insertion point.
      i = closeLine;
      continue;
    }

    const refCloseLine = findObjectCloseLine(lines, refLine);
    if (refCloseLine < 0 || refCloseLine > closeLine) {
      i = closeLine;
      continue;
    }

    const indent = (lines[refLine].match(/^\s*/) ?? [""])[0];
    lines.splice(refCloseLine + 1, 0, `${indent}lastVerified: "${STAMP_DATE}",`);

    stamped++;
    i = closeLine + 1; // account for the inserted line, then continue past object
  }

  if (stamped > 0) {
    writeFileSync(absPath, lines.join("\n"));
  }
  return { file: display, stamped, alreadyStamped };
}

async function main(): Promise<void> {
  const pattern = resolveGlob("../src/data/questions/domain-*.ts");
  const files = (await globby(pattern)).sort();
  if (files.length === 0) {
    throw new Error(`no question files matched: ${pattern}`);
  }

  let changedFiles = 0;
  let totalStamped = 0;
  let totalAlready = 0;

  for (const file of files) {
    const result = stampFile(file);
    totalStamped += result.stamped;
    totalAlready += result.alreadyStamped;
    if (result.stamped > 0) {
      changedFiles++;
      console.log(`  stamped ${result.stamped} in ${result.file}`);
    }
  }

  console.log("");
  console.log(
    `Done. ${totalStamped} stamped across ${changedFiles} file(s); ` +
      `${totalAlready} already carried the date (left unchanged).`,
  );
  if (totalStamped === 0) {
    console.log("No-op: every question already has lastVerified.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
