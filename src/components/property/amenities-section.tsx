import { categorizeAmenities } from "@/lib/amenity-categories";

export function AmenitiesSection({
  amenities,
  unavailableAmenities,
}: {
  amenities: string[];
  unavailableAmenities: string[];
}) {
  const categories = categorizeAmenities(amenities);

  return (
    <section className="border-b border-hairline-soft py-8">
      <h2 className="text-xl font-bold text-ink">What this place offers</h2>

      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.label}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{category.label}</h3>
            <ul className="mt-3 space-y-2.5">
              {category.items.map((amenity) => (
                <li key={amenity} className="flex items-center gap-2.5 text-sm text-ink">
                  <DotIcon /> {amenity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {unavailableAmenities.length > 0 ? (
        <div className="mt-8 border-t border-hairline-soft pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Not included</h3>
          <ul className="mt-3 space-y-2.5">
            {unavailableAmenities.map((amenity) => (
              <li key={amenity} className="flex items-center gap-2.5 text-sm text-muted line-through">
                <SlashIcon /> {amenity}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function DotIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4 shrink-0 fill-none stroke-ink stroke-[1.5]">
      <circle cx="10" cy="10" r="7" />
    </svg>
  );
}

function SlashIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4 shrink-0 fill-none stroke-muted stroke-[1.5]">
      <circle cx="10" cy="10" r="7" />
      <path d="M5.5 14.5l9-9" strokeLinecap="round" />
    </svg>
  );
}
