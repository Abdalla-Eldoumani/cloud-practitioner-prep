import type { ServiceEntry } from "@/lib/types";

// One catalog entry as a list row: name in the deciding voice, the domain id
// in its color, what-it-is in a quieter ink, and the dotted reach-for-it-when
// line that answers the exam's phrasing. Rendered inside a hairline-divided
// <li> by CatalogBrowser; it is not itself a link (it contains the doc link),
// so it never nests interactive elements.
export default function ServiceCard({ service }: { service: ServiceEntry }) {
  const { domain, category, name, purpose, whenToUse, reference, aliases } =
    service;
  const primaryAlias = aliases && aliases.length > 0 ? aliases[0] : null;

  return (
    <div className="flex flex-col gap-1.5 px-1 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="t-sub text-ink-1">
          {name}
          {primaryAlias && (
            <span className="t-body-sm ml-2 font-[450] text-ink-3">
              {primaryAlias}
            </span>
          )}
        </h3>
        <span
          className="font-mono text-[9.5px] tracking-[0.1em]"
          style={{ color: `var(--d${domain})` }}
        >
          D{domain}
        </span>
        <span className="t-mono-sm hidden uppercase text-ink-3 sm:inline">
          {category}
        </span>
        <a
          href={reference.url}
          target="_blank"
          rel="noopener noreferrer"
          className="t-mono-sm ml-auto uppercase transition-colors hover:text-ink-1"
          style={{ color: "var(--kicker-ink)" }}
        >
          Docs &#8599;
        </a>
      </div>
      <p className="t-body-sm text-ink-2">{purpose}</p>
      <p className="t-body-sm w-fit border-b-2 border-dotted border-line-1 pb-1 text-ink-3">
        Reach for it when: {whenToUse}
      </p>
    </div>
  );
}
