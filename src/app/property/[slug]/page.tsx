import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-types";
import { AvailabilityTable } from "@/components/property/availability-table";
import { parseGuestsFromParams } from "@/lib/guests";
import { PhotoGrid } from "@/components/property/photo-grid";
import { HostCard } from "@/components/property/host-card";
import { AmenitiesSection } from "@/components/property/amenities-section";
import { ReviewsSection } from "@/components/property/reviews-section";
import { PropertyHighlights } from "@/components/property/property-highlights";
import { ExpandableText } from "@/components/ui/expandable-text";
import { isRareFind } from "@/lib/badges";
import { hasLongStayDiscount } from "@/lib/pricing";
import { getPropertyHighlights } from "@/lib/property-highlights";
import { getOtherListingsByHost, getHostReviews } from "@/lib/host-profile";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PropertyDetailPage({ params, searchParams }: PropertyPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      host: true,
      roomTypes: { orderBy: { pricePerNight: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true, createdAt: true } } },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const [propertyBookings, otherListings, hostReviews] = await Promise.all([
    prisma.booking.findMany({
      where: { property: { id: property.id }, status: "CONFIRMED" },
      select: { roomTypeId: true, checkIn: true, checkOut: true },
    }),
    getOtherListingsByHost(property.hostId, property.id),
    getHostReviews(property.hostId),
  ]);
  const guests = parseGuestsFromParams(query);
  const rareFind = isRareFind(property.ratingAverage, property.reviewCount);
  const highlights = getPropertyHighlights(property);
  // Every stay of 2+ nights qualifies for the long-stay discount (see pricing.ts's
  // LONG_STAY_MIN_NIGHTS), which covers virtually every real booking, so this badge is unconditional.
  const extendedStayDiscount = hasLongStayDiscount(2);
  const cheapestRoomPrice = Math.min(...property.roomTypes.map((rt) => rt.pricePerNight));
  // A room type can sleep more than the property's own headline maxGuests (e.g. a hotel's
  // largest suite), so the guest picker's cap has to cover whichever is bigger.
  const maxGuestsOverall = Math.max(property.maxGuests, ...property.roomTypes.map((rt) => rt.maxGuests));

  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 pb-32 sm:px-8 lg:pb-8">
      <h1 className="text-[22px] font-medium leading-tight text-ink">{property.name}</h1>
      <p className="mt-1 text-sm text-muted">
        Entire {PROPERTY_TYPE_LABELS[property.type].toLowerCase()} in {property.city}, {property.country}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink">
        {property.reviewCount > 0 ? (
          <span className="flex items-center gap-1 font-medium">
            <StarIcon /> {property.ratingAverage.toFixed(2)} · {property.reviewCount} reviews
          </span>
        ) : (
          <span className="text-muted">New listing</span>
        )}
        {rareFind ? (
          <span className="flex items-center gap-1 font-medium text-brand">💎 Rare find</span>
        ) : null}
      </div>

      {extendedStayDiscount ? (
        <span className="mt-3 inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
          Extended stay discount
        </span>
      ) : null}

      <PhotoGrid images={property.images} alt={property.name} />

      <div className="mt-6 flex items-center gap-3 border-b border-hairline-soft pb-8">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-ink text-base font-semibold text-canvas">
          {property.host.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={property.host.image} alt={property.host.name} className="h-full w-full object-cover" />
          ) : (
            property.host.name.trim().charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-base font-semibold text-ink">Hosted by {property.host.name}</p>
          <p className="text-sm text-muted">
            {property.host.isSuperhost ? "Superhost · " : ""}
            {property.maxGuests} guests · {property.bedrooms} bedrooms · {property.beds} beds ·{" "}
            {property.bathrooms} baths
          </p>
        </div>
      </div>

      <AvailabilityTable
        propertySlug={property.slug}
        propertyImage={property.images[0]}
        roomTypes={property.roomTypes}
        bookings={propertyBookings}
        maxGuestsOverall={maxGuestsOverall}
        defaultCheckIn={first(query.checkIn)}
        defaultCheckOut={first(query.checkOut)}
        defaultGuests={guests}
        unavailable={first(query.unavailable) === "1"}
        fromPrice={cheapestRoomPrice}
        showFromPrice={property.roomTypes.length > 1}
      />

      <PropertyHighlights highlights={highlights} />

      <section className="border-b border-hairline-soft py-8">
        <h2 className="text-xl font-bold text-ink">About this place</h2>
        <div className="mt-3 text-base leading-relaxed text-body">
          {property.description.length > 220 ? (
            <ExpandableText text={property.description} clampLines={4} />
          ) : (
            <p className="whitespace-pre-line">{property.description}</p>
          )}
        </div>
      </section>

      <AmenitiesSection amenities={property.amenities} unavailableAmenities={property.unavailableAmenities} />

      <HostCard host={property.host} otherListings={otherListings} hostReviews={hostReviews} />

      <ReviewsSection
        reviews={property.reviews}
        ratingAverage={property.ratingAverage}
        reviewCount={property.reviewCount}
      />
    </div>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-ink">
      <path d="M8 0l2.163 5.279 5.837.451-4.5 3.792L12.9 15.5 8 12.2 3.1 15.5l1.4-5.978L0 5.73l5.837-.451z" />
    </svg>
  );
}
