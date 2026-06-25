// Catalog content lint over the typed service catalog and the compare groups.
// Imports the typed data directly (never parses .ts source) and reuses the
// content-lib host allowlist, historical-reference markers, and URL parser so
// services are validated by the same machinery as questions. Every rule below is
// a hard failure: the script collects all of them, prints a grouped report, and
// exits 1 if any fired, else 0. Live reachability of the reference URLs is
// check-links.ts's job; this lint does the structural (offline) checks only.
//
// Per-entry rules (ServiceEntry):
//   purpose          non-empty                                              (CAT-01)
//   whenToUse        non-empty                                              (CAT-01)
//   domain           in {1,2,3,4}                                           (CAT-01)
//   reference.url    present, parses, host in AWS_HOSTS, not historical     (CAT-04)
//   lastVerified     non-empty string                                       (CAT-04)
//   id unique        no two entries share an id
//   name unique      no two entries share a name (catch duplicate/aliased)
//   relatedServices  every referenced id resolves to a real entry           (integrity)
//
// Completeness rule (CAT-01 mechanical guard, modelled on DOMAIN_QUESTION_FLOORS):
//   ALL_SERVICES must exactly match EXPECTED_IDS from the manifest — every
//   expected id present AND no unexpected id. EXCEPTION: while ALL_SERVICES is
//   empty (the initial scaffolding) the rule is informational only, so the lint
//   stays green; it becomes load-bearing the moment any content exists.
//
// Compare-group rules (CompareGroup):
//   serviceIds       non-empty, every id resolves to a real entry           (integrity)
//   cells            every row covers every serviceId (no missing column)
//   lastVerified     non-empty string

import {
  AWS_HOSTS,
  HISTORICAL_MARKERS,
  loadServices,
  parseUrl,
} from "./content-lib";
import { COMPARE_GROUPS } from "../src/data/services/compare";
import { EXPECTED_IDS } from "../src/data/services/expected-manifest";
import { serviceById } from "../src/data/services/index";

const VALID_DOMAINS: ReadonlySet<number> = new Set([1, 2, 3, 4]);

// Collects hard failures (set the exit code) and soft notes (informational).
// Mirrors lint-content.ts's Reporter so the report shape is identical.
class Reporter {
  private failures = new Map<string, string[]>();
  private notes: string[] = [];

  fail(rule: string, detail: string): void {
    if (!this.failures.has(rule)) this.failures.set(rule, []);
    this.failures.get(rule)!.push(detail);
  }

  note(detail: string): void {
    this.notes.push(detail);
  }

  hasFailures(): boolean {
    return this.failures.size > 0;
  }

  print(): void {
    const full = !!process.env.LINT_FULL;

    if (this.notes.length > 0) {
      console.log("\nNotes (informational, non-blocking):");
      for (const n of this.notes) console.log(`  - ${n}`);
    }

    if (this.failures.size === 0) {
      console.log("\nPASS: every hard catalog rule holds.");
      return;
    }

    let total = 0;
    console.error("\nFAIL: hard catalog rule violations:");
    for (const [rule, items] of this.failures) {
      total += items.length;
      console.error(`  [${rule}] ${items.length}`);
      const cap = full ? items.length : 50;
      for (const d of items.slice(0, cap)) console.error(`      - ${d}`);
      if (items.length > cap)
        console.error(`      ... and ${items.length - cap} more`);
    }
    console.error(
      `\n${total} hard violation(s) across ${this.failures.size} rule(s).`,
    );
  }
}

function main(): void {
  const services = loadServices();
  const report = new Reporter();

  const ids = new Set<string>();
  const idSeen = new Map<string, true>();
  const nameSeen = new Map<string, string>();

  for (const s of services) {
    const where = s.id || s.name || "(unnamed entry)";

    // CAT-01: purpose and whenToUse are non-empty prose.
    if (!s.purpose || s.purpose.trim() === "") {
      report.fail("purpose", `${where}: missing purpose`);
    }
    if (!s.whenToUse || s.whenToUse.trim() === "") {
      report.fail("whenToUse", `${where}: missing whenToUse`);
    }

    // CAT-01: domain in {1,2,3,4}.
    if (!VALID_DOMAINS.has(s.domain)) {
      report.fail("domain", `${where}: domain ${s.domain} not in {1,2,3,4}`);
    }

    // CAT-04: reference.url present, well-formed, on an AWS host, not historical.
    const url = s.reference?.url;
    if (!url || url.trim() === "") {
      report.fail("reference", `${where}: missing reference.url`);
    } else {
      const parsed = parseUrl(url);
      if (!parsed) {
        report.fail("reference", `${where}: malformed reference.url (${url})`);
      } else if (!AWS_HOSTS.has(parsed.host)) {
        report.fail("reference", `${where}: non-AWS host ${parsed.host} (${url})`);
      } else if (HISTORICAL_MARKERS.some((re) => re.test(url))) {
        report.fail("reference", `${where}: historical-reference page (${url})`);
      }
    }

    // CAT-04: lastVerified present.
    if (!s.lastVerified || s.lastVerified.trim() === "") {
      report.fail("lastVerified", `${where}: missing lastVerified`);
    }

    // Uniqueness: id and name across the whole catalog.
    if (idSeen.has(s.id)) {
      report.fail("id-unique", `duplicate service id: ${s.id}`);
    } else {
      idSeen.set(s.id, true);
    }
    ids.add(s.id);

    if (nameSeen.has(s.name)) {
      report.fail(
        "name-unique",
        `duplicate service name: "${s.name}" (${s.id} and ${nameSeen.get(s.name)})`,
      );
    } else {
      nameSeen.set(s.name, s.id);
    }
  }

  // Referential integrity: every relatedServices id resolves to a real entry.
  // Done in a second pass so a forward reference to a later entry still resolves.
  for (const s of services) {
    for (const ref of s.relatedServices ?? []) {
      if (!serviceById(ref)) {
        report.fail(
          "related-services",
          `${s.id}: relatedServices references unknown id "${ref}"`,
        );
      }
    }
  }

  // CAT-01 completeness against the expected manifest, in two halves:
  //  - An "unexpected id not in manifest" is ALWAYS a hard failure: every valid
  //    in-scope id is in the manifest, so an off-list id is a typo caught the
  //    moment it is authored.
  //  - A "missing in-scope service" is a hard failure only under CATALOG_COMPLETE=1
  //    (the closing completeness gate). During incremental authoring it is
  //    informational, so a content batch that fills its own slice does not fail on
  //    the services other batches still owe.
  const expected = new Set(EXPECTED_IDS);
  const enforceComplete = !!process.env.CATALOG_COMPLETE;
  for (const id of ids) {
    if (!expected.has(id)) {
      report.fail(
        "completeness",
        `unexpected service id not in manifest: ${id}`,
      );
    }
  }
  const missing = EXPECTED_IDS.filter((id) => !ids.has(id));
  if (missing.length > 0) {
    if (enforceComplete) {
      for (const id of missing) {
        report.fail("completeness", `missing in-scope service: ${id}`);
      }
    } else {
      report.note(
        `completeness: ${services.length}/${expected.size} expected services authored, ${missing.length} not yet present (informational; set CATALOG_COMPLETE=1 to enforce — the closing plan does).`,
      );
    }
  }

  // Compare-group rules.
  for (const g of COMPARE_GROUPS) {
    const where = g.id || g.title || "(untitled group)";

    if (!g.serviceIds || g.serviceIds.length === 0) {
      report.fail("compare", `${where}: serviceIds is empty`);
    }
    for (const sid of g.serviceIds ?? []) {
      if (!serviceById(sid)) {
        report.fail(
          "compare",
          `${where}: serviceIds references unknown id "${sid}"`,
        );
      }
    }
    // Every row must carry a cell for every compared service id.
    for (const row of g.rows ?? []) {
      for (const sid of g.serviceIds ?? []) {
        const cell = row.cells?.[sid];
        if (cell === undefined || cell.trim() === "") {
          report.fail(
            "compare",
            `${where}: row "${row.axis}" is missing a cell for "${sid}"`,
          );
        }
      }
    }
    if (!g.lastVerified || g.lastVerified.trim() === "") {
      report.fail("compare", `${where}: missing lastVerified`);
    }
  }

  // Summary header before the detail report.
  console.log(
    `Catalog lint: ${services.length} services, ${expected.size} expected (manifest), ${COMPARE_GROUPS.length} compare groups.`,
  );

  report.print();
  process.exit(report.hasFailures() ? 1 : 0);
}

main();
