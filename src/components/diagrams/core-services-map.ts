import { serviceById } from "@/data/services/index";
import {
  CATEGORY_COLUMNS,
  type CategoryColumn,
  type ResolvedCategory,
} from "@/components/diagrams/core-services-columns";

// Resolve the core-services map from the verified catalog AT BUILD TIME. The lesson
// calls buildCoreServicesGroups() in its (server-rendered) body and passes the plain
// result to the catalog-free <CoreServicesDiagram> island as a prop — so every name
// + category is catalog-sourced (a label can never drift from or invent beyond the
// catalog), a non-resolving id or a mixed-category column throws here and fails the
// build, and the ~113-entry service catalog is NEVER bundled to the browser (only
// the ten resolved { id, name, note } reach the client as serialized props).

function resolveEntry(id: string) {
  const entry = serviceById(id);
  if (entry === undefined) {
    throw new Error(
      `core-services map: service id "${id}" does not resolve to a catalog entry; every label must come from the verified catalog.`,
    );
  }
  return entry;
}

function resolveGroup(ids: CategoryColumn): ResolvedCategory {
  const entries = ids.map(resolveEntry);
  const category = entries[0].category;
  for (const entry of entries) {
    if (entry.category !== category) {
      throw new Error(
        `core-services map: column [${ids.join(", ")}] mixes catalog categories ("${entry.category}" vs "${category}"); every service in a column must share one verified category.`,
      );
    }
  }
  // The note names the SAME catalog category shown in the header, so the callout and
  // the column header can never disagree.
  return {
    category,
    services: entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      note: `${entry.category}: ${entry.purpose}`,
    })),
  };
}

// The resolved category columns. Call this in the lesson body and pass the result to
// <CoreServicesDiagram groups={...} />. Build-time only — never imported by the island.
export function buildCoreServicesGroups(): ResolvedCategory[] {
  return CATEGORY_COLUMNS.map(resolveGroup);
}
