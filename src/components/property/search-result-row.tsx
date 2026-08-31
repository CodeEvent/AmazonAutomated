import Link from "next/link";
import Image from "next/image";
import { formatPrice, nightsBetween } from "@/lib/format";
import { ratingLabel } from "@/lib/rating-label";

export type SearchResultRowData = {
  slug: string;
  name: string;
  city: string;
  country: string;
  pricePerNight: number;
  ratingAverage: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  roomTypeName: string;
  freeCancellation: boolean;
};

export function SearchResultRow({
  property,
  searchQuery,
  checkIn,
  checkOut,
}: {
  property: SearchResultRowData;
  searchQuery?: string;
  checkIn?: Date;
  checkOut?: Date;
}) {
  const href = searchQuery ? `/property/${property.slug}?${searchQuery}` : `/property/${property.slug}`;
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const total = nights > 0 ? property.pricePerNight * nights : property.pricePerNight;
  const label = ratingLabel(property.ratingAverage);
  const facilities = property.amenities.slice(0, 3);

  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-hairline-soft p-4 transition-colors hover:border-ink hover:shadow-card sm:flex-row"
    >
      <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg sm:h-auto sm:w-60">
        {property.images[0] ? (
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            sizes="(min-width: 640px) 240px, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-ink">{property.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <PinIcon />
            {property.city}, {property.country}
          </p>
          <p className="mt-1 text-sm text-ink">{property.roomTypeName}</p>

          {facilities.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
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

          {property.freeCancellation ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-green-700">
              <CheckIcon /> Free cancellation
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end sm:text-right">
          {property.reviewCount > 0 ? (
            <div className="flex items-center gap-2">
              <span>
                {label ? <span className="text-sm font-medium text-ink">{label}</span> : null}
                <span className="ml-1.5 text-xs text-muted">{property.reviewCount} reviews</span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-sm font-bold text-canvas">
                {property.ratingAverage.toFixed(1)}
              </span>
            </div>
          ) : null}

          <div>
            <p className="text-xs text-muted">
              {nights > 0 ? `${nights} night${nights === 1 ? "" : "s"}` : "per night"}
            </p>
            <p className="text-xl font-bold text-ink">{formatPrice(total)}</p>
          </div>

          <span className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary transition-colors group-hover:bg-primary-active">
            See availability
          </span>
        </div>
      </div>
    </Link>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 shrink-0 fill-none stroke-muted stroke-[1.5]">
      <path d="M8 14.5S13 10 13 6.5a5 5 0 10-10 0C3 10 8 14.5 8 14.5z" strokeLinejoin="round" />
      <circle cx="8" cy="6.5" r="1.75" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 shrink-0 fill-none stroke-green-700 stroke-2">
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
