"use client";

import { useState } from "react";

export function AmenitiesSection({
  amenities,
  unavailableAmenities,
}: {
  amenities: string[];
  unavailableAmenities: string[];
}) {
  const [showAll, setShowAll] = useState(false);
  const total = amenities.length + unavailableAmenities.length;

  const previewAvailable = amenities.slice(0, 5);
  const previewUnavailable = unavailableAmenities.slice(0, Math.max(0, 7 - previewAvailable.length));

  const listAvailable = showAll ? amenities : previewAvailable;
  const listUnavailable = showAll ? unavailableAmenities : previewUnavailable;

  return (
    <section className="border-b border-hairline-soft py-8">
      <h2 className="text-xl font-bold text-ink">What this place offers</h2>
      <ul className="mt-4 grid grid-cols-1 gap-y-3 sm:grid-cols-2">
        {listAvailable.map((amenity) => (
          <li key={amenity} className="flex items-center gap-3 border-b border-hairline-soft py-3 text-base text-ink">
            <DotIcon /> {amenity}
          </li>
        ))}
        {listUnavailable.map((amenity) => (
          <li
            key={amenity}
            className="flex items-center gap-3 border-b border-hairline-soft py-3 text-base text-muted line-through"
          >
            <SlashIcon /> {amenity}
          </li>
        ))}
      </ul>

      {total > previewAvailable.length + previewUnavailable.length ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-6 rounded-lg border border-ink px-5 py-3 text-sm font-semibold text-ink hover:bg-surface-soft"
        >
          {showAll ? "Show less" : `Show all ${total} amenities`}
        </button>
      ) : null}
    </section>
  );
}

function DotIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="h-5 w-5 shrink-0 fill-none stroke-ink stroke-[1.5]">
      <circle cx="10" cy="10" r="7" />
    </svg>
  );
}

function SlashIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="h-5 w-5 shrink-0 fill-none stroke-muted stroke-[1.5]">
      <circle cx="10" cy="10" r="7" />
      <path d="M5.5 14.5l9-9" strokeLinecap="round" />
    </svg>
  );
}
