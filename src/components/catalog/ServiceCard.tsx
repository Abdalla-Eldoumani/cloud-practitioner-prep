import type { Domain, ServiceEntry } from "@/lib/types";
import { domainName } from "@/lib/constants";

// DomainBadge is an Astro component and cannot mount inside a React island, so
// its visual treatment is reproduced here. The tints, the D-number, and the
// name match DomainBadge.astro exactly so the badge reads identically wherever
// it appears; color is never the only signal (the D-number and name carry it).
const domainTint: Record<Domain, string> = {
  1: "border-brand bg-info-soft text-ink",
  2: "border-accent text-ink",
  3: "border-correct bg-correct-soft text-ink",
  4: "border-flag text-ink",
};

interface ServiceCardProps {
  service: ServiceEntry;
}

// One catalog entry as a presentational card. Rendered inside a grid <li> by
// CatalogBrowser; it is not itself a link (it contains the doc link), so it
// never nests interactive elements.
export default function ServiceCard({ service }: ServiceCardProps) {
  const { domain, category, name, purpose, whenToUse, reference, aliases } =
    service;
  const primaryAlias = aliases && aliases.length > 0 ? aliases[0] : null;

  return (
    <div className="h-full rounded-lg border border-hairline bg-raised p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${domainTint[domain]}`}
        >
          <span className="font-semibold">D{domain}</span>
          <span>{domainName(domain)}</span>
        </span>
        <span className="ml-auto text-xs text-ink-soft">{category}</span>
      </div>

      <h3 className="mt-3 text-lg font-semibold text-ink">{name}</h3>
      {primaryAlias && (
        <p className="text-sm text-ink-soft">{primaryAlias}</p>
      )}

      <p className="mt-2 text-base text-ink">{purpose}</p>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          When to use
        </p>
        <p className="text-sm text-ink-soft">{whenToUse}</p>
      </div>

      <a
        href={reference.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-sm font-medium text-brand underline underline-offset-2"
      >
        {reference.label}
      </a>
    </div>
  );
}
