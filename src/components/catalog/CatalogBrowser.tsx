import { useEffect, useMemo, useState } from "react";
import type { Domain, ServiceEntry } from "@/lib/types";
import { DOMAINS, domainName } from "@/lib/constants";
import ServiceCard from "./ServiceCard";

interface CatalogBrowserProps {
  // The full catalog, serialized from the data layer by the Astro page.
  services: ServiceEntry[];
}

type DomainFilter = Domain | "all";

// The pinned searchable field set (the single source of truth, mirrored in the
// design contract): a service is searched over its name, shortName, aliases,
// category, and relatedTerms. purpose is intentionally excluded — it makes
// matches noisy and is not needed for the glossary role. aliases and
// relatedTerms are included so plain-concept queries resolve (e.g. "object
// storage" finds Amazon S3).
function haystack(s: ServiceEntry): string {
  return [
    s.name,
    s.shortName ?? "",
    ...(s.aliases ?? []),
    s.category,
    ...(s.relatedTerms ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

// Debounce the query before it drives the filter and the live-region count, so
// typing stays smooth and the announcement is not chatty. The input value
// itself updates immediately (it is a controlled input); only the derived
// results and the announcement lag by this interval.
const DEBOUNCE_MS = 180;

export default function CatalogBrowser({ services }: CatalogBrowserProps) {
  const [query, setQuery] = useState("");
  const [deferredQuery, setDeferredQuery] = useState("");
  const [domain, setDomain] = useState<DomainFilter>("all");

  useEffect(() => {
    const id = window.setTimeout(() => setDeferredQuery(query), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  // Precompute each service's lowercased haystack once so typing only re-runs
  // the substring test, not the string assembly.
  const indexed = useMemo(
    () => services.map((s) => ({ service: s, text: haystack(s) })),
    [services],
  );

  const needle = deferredQuery.trim().toLowerCase();

  // Search AND the domain filter combine: a service shows only if it matches
  // the active domain (or "all") AND the query (or an empty query).
  const visible = useMemo(
    () =>
      indexed
        .filter(({ service, text }) => {
          const domainOk = domain === "all" || service.domain === domain;
          const queryOk = needle === "" || text.includes(needle);
          return domainOk && queryOk;
        })
        .map((entry) => entry.service),
    [indexed, domain, needle],
  );

  const total = services.length;
  const count = visible.length;
  const isFiltered = needle !== "" || domain !== "all";
  const noun = count === 1 ? "service" : "services";
  const countLabel = isFiltered
    ? `${count} of ${total} ${noun}`
    : `${count} ${noun}`;

  const clearAll = () => {
    setQuery("");
    setDeferredQuery("");
    setDomain("all");
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <label
            htmlFor="catalog-search"
            className="mb-1 block text-sm font-medium text-ink"
          >
            Search services
          </label>
          <div className="flex items-center gap-2">
            <input
              id="catalog-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by service name…"
              className="w-full rounded-md border border-hairline bg-raised px-3 py-2 text-base text-ink"
            />
            {query !== "" && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="shrink-0 rounded-md border border-hairline px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <p
          role="status"
          aria-live="polite"
          className="text-sm text-ink-soft sm:self-end sm:pb-2"
        >
          {countLabel}
        </p>
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-ink">
          Filter by domain
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDomain("all")}
            aria-pressed={domain === "all"}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              domain === "all"
                ? "border-brand bg-info-soft text-brand"
                : "border-hairline text-ink-soft hover:border-brand"
            }`}
          >
            All
          </button>
          {DOMAINS.map((d) => {
            const active = domain === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDomain(d.id)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-brand bg-info-soft text-brand"
                    : "border-hairline text-ink-soft hover:border-brand"
                }`}
              >
                <span className="font-semibold">D{d.id}</span>{" "}
                {domainName(d.id)}
              </button>
            );
          })}
        </div>
      </fieldset>

      {count === 0 ? (
        <div className="mt-6 rounded-lg border border-hairline bg-raised p-8 text-center">
          <h3 className="text-xl font-semibold text-ink">No services match</h3>
          <p className="mx-auto mt-2 max-w-prose text-ink-soft">
            Try a different search term or clear the domain filter to see the
            full catalog.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-5 inline-block rounded-md bg-brand px-4 py-2 font-medium text-raised transition-colors hover:bg-brand-strong"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((service) => (
            <li key={service.id} className="h-full">
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
