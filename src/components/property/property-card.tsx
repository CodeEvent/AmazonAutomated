import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { PropertyCardGallery } from "@/components/property/property-card-gallery";
import { ratingLabel } from "@/lib/rating-label";

export type PropertyCardData = {
  slug: string;
  name: string;
  city: string;
  country: string;
  pricePerNight: number;
  ratingAverage: number;
  reviewCount: number;
  images: string[];
  amenities?: string[];
};

export function PropertyCard({
  property,
  searchQuery,
  showDetails = false,
}: {
  property: PropertyCardData;
  /** Query string (no leading "?") carrying the current search's dates/guests into the listing page. */
  searchQuery?: string;
  /** Extra info density (rating label, facility chips) for result-list contexts like /search. */
  showDetails?: boolean;
}) {
  const isGuestFavorite = property.reviewCount > 10 && property.ratingAverage >= 4.7;
  const href = searchQuery
    ? `/property/${property.slug}?${searchQuery}`
    : `/property/${property.slug}`;
  const label = showDetails ? ratingLabel(property.ratingAverage) : null;
  const facilities = showDetails ? (property.amenities ?? []).slice(0, 3) : [];

  return (
    <Link
      href={href}
      className="group block transition-transform duration-200 ease-out hover:-translate-y-0.5"
    >
      <PropertyCardGallery
        images={property.images}
        alt={property.name}
        badge={isGuestFavorite ? "Guest favorite" : undefined}
      />

      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-base font-semibold text-ink">{property.name}</h3>
          {property.reviewCount > 0 ? (
            <span className="flex shrink-0 items-center gap-1 text-sm text-ink">
              <StarIcon />
              {property.ratingAverage.toFixed(2)}
            </span>
          ) : null}
        </div>
        {label ? (
          <p className="text-sm text-ink">
            {label} <span className="text-muted">· {property.reviewCount} reviews</span>
          </p>
        ) : null}
        <p className="truncate text-sm text-muted">
          {property.city}, {property.country}
        </p>
        {facilities.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {facilities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full border border-hairline px-2 py-0.5 text-xs text-muted"
              >
                {amenity}
              </span>
            ))}
          </div>
        ) : null}
        <p className="text-sm text-ink">
          <span className="font-semibold">{formatPrice(property.pricePerNight)}</span> night
        </p>
      </div>
    </Link>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-ink">
      <path d="M8 0l2.163 5.279 5.837.451-4.5 3.792L12.9 15.5 8 12.2 3.1 15.5l1.4-5.978L0 5.73l5.837-.451z" />
    </svg>
  );
}
