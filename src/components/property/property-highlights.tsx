import type { PropertyHighlight } from "@/lib/property-highlights";

export function PropertyHighlights({ highlights }: { highlights: PropertyHighlight[] }) {
  if (highlights.length === 0) return null;

  return (
    <div className="space-y-5 border-b border-hairline-soft py-6">
      {highlights.map((highlight) => (
        <div key={highlight.title} className="flex items-start gap-4">
          <Icon type={highlight.icon} />
          <div>
            <p className="text-base font-semibold text-ink">{highlight.title}</p>
            <p className="mt-0.5 text-sm text-muted">{highlight.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Icon({ type }: { type: PropertyHighlight["icon"] }) {
  if (type === "door") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 shrink-0 fill-none stroke-ink stroke-[1.5]">
        <rect x="6" y="2" width="12" height="20" rx="1" />
        <circle cx="14.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (type === "pin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 shrink-0 fill-none stroke-ink stroke-[1.5]">
        <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 shrink-0 fill-none stroke-ink stroke-[1.5]">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
