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

  // A deep link can pre-fill the search: opening /catalog?q=<term> (for example
  // from picking a service in the command palette) lands here already filtered
  // to that service. We read the URL once after mount — not during render — so
  // the first render keeps the empty defaults and the server and client markup
  // match. The value comes back decoded from URLSearchParams and is rendered
  // only as the controlled input's value and used as a substring needle, never
  // as markup, so a hostile q can at most filter the list to nothing. Seeding
  // deferredQuery too means the results and the live count reflect the term on
  // load instead of flashing the full list for one debounce interval. With no
  // q (or only whitespace) the defaults are left untouched and a plain visit is
  // unchanged.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search)
      .get("q")
      ?.trim();
    if (initial) {
      setQuery(initial);
      setDeferredQuery(initial);
    }
  }, []);

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
          <label htmlFor="catalog-search" className="sr-only">
            Search services
          </label>
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="var(--ink-3)"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
              >
                <circle cx="7" cy="7" r="4.6" />
                <path d="M10.5 10.5 14 14" />
              </svg>
              <input
                id="catalog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${total} services…`}
                className="w-full rounded-r2 border border-line-1 bg-ground-0 py-2.5 pr-3.5 pl-10 text-[14px] text-ink-1 transition-colors focus:border-blueprint"
              />
            </div>
            {query !== "" && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="btn-ghost shrink-0 px-3 py-2 text-[13.5px]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <p
          role="status"
          aria-live="polite"
          className="t-mono-sm uppercase text-ink-3 sm:self-end sm:pb-2"
        >
          {countLabel}
        </p>
      </div>

      <fieldset className="mt-4">
        <legend className="sr-only">Filter by domain</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDomain("all")}
            aria-pressed={domain === "all"}
            className={`rounded-r1 border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors ${
              domain === "all"
                ? "border-blueprint bg-blueprint-dim"
                : "border-line-1 text-ink-3 hover:border-line-2 hover:text-ink-1"
            }`}
            style={
              domain === "all" ? { color: "var(--kicker-ink)" } : undefined
            }
          >
            All{domain === "all" ? " ✓" : ""}
          </button>
          {DOMAINS.map((d) => {
            const active = domain === d.id;
            const glyphColor = `var(--d${d.id})`;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDomain(d.id)}
                aria-pressed={active}
                className="inline-flex items-center gap-1.5 rounded-r1 border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors"
                style={
                  active
                    ? {
                        color: glyphColor,
                        borderColor: glyphColor,
                        borderWidth: "1.5px",
                        padding: "5.5px 11.5px",
                        background: `color-mix(in srgb, ${glyphColor} 12%, transparent)`,
                      }
                    : { color: "var(--ink-3)", borderColor: "var(--line-1)" }
                }
              >
                <svg width="10" height="10" viewBox="0 0 11 11" aria-hidden="true">
                  {d.id === 1 && (
                    <circle cx="5.5" cy="5.5" r="4.2" fill={active ? glyphColor : "none"} stroke={glyphColor} strokeWidth="1.6" />
                  )}
                  {d.id === 2 && (
                    <rect x="2.4" y="2.4" width="6.2" height="6.2" fill={active ? glyphColor : "none"} stroke={glyphColor} strokeWidth="1.6" transform="rotate(45 5.5 5.5)" />
                  )}
                  {d.id === 3 && (
                    <polygon points="2,2.6 9,2.6 5.5,9" fill={active ? glyphColor : "none"} stroke={glyphColor} strokeWidth="1.6" strokeLinejoin="round" />
                  )}
                  {d.id === 4 && (
                    <rect x="2.2" y="2.2" width="6.6" height="6.6" fill={active ? glyphColor : "none"} stroke={glyphColor} strokeWidth="1.6" />
                  )}
                </svg>
                D{d.id} {domainName(d.id)}
                {active ? " ✓" : ""}
              </button>
            );
          })}
        </div>
      </fieldset>

      {count === 0 ? (
        <div className="mt-7 flex flex-col items-start gap-3 rounded-r3 border border-line-1 bg-ground-1 px-6 py-8">
          <span className="inline-flex items-center gap-3">
            <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
              <circle cx="9" cy="9" r="6.6" fill="none" stroke="var(--ink-3)" strokeWidth="1.6" />
            </svg>
            <span
              aria-hidden="true"
              className="inline-block w-14 border-t-2 border-dotted"
              style={{ borderColor: "color-mix(in srgb, var(--blueprint) 50%, transparent)" }}
            />
            <span className="font-mono text-[10px] tracking-[0.12em]" style={{ color: "var(--kicker-ink)" }}>
              NO MATCH ON THE MAP
            </span>
          </span>
          <p className="t-body-sm max-w-prose text-ink-2">
            Nothing answers to that. Try another term or clear the domain
            filter to see the full catalog.
          </p>
          <button type="button" onClick={clearAll} className="btn-secondary">
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col">
          {visible.map((service) => (
            <li key={service.id} className="border-b border-line-1 last:border-b-0">
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
