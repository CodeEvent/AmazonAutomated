import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { PropertyCardGallery } from "@/components/property/property-card-gallery";

export type PropertyCardData = {
  slug: string;
  name: string;
  city: string;
  country: string;
  pricePerNight: number;
  ratingAverage: number;
  reviewCount: number;
  images: string[];
};

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const isGuestFavorite = property.reviewCount > 10 && property.ratingAverage >= 4.7;

  return (
    <Link
      href={`/property/${property.slug}`}
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
        <p className="truncate text-sm text-muted">
          {property.city}, {property.country}
        </p>
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
