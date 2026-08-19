import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-types";
import { ReservationCard } from "@/components/property/reservation-card";
import { MobileReserveBar } from "@/components/property/mobile-reserve-bar";
import { getBlockedRanges } from "@/lib/availability";
import { parseGuestsFromParams } from "@/lib/guests";
import { PhotoGrid } from "@/components/property/photo-grid";
import { HostCard } from "@/components/property/host-card";
import { AmenitiesSection } from "@/components/property/amenities-section";
import { ReviewsSection } from "@/components/property/reviews-section";
import { isRareFind } from "@/lib/badges";

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
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const blockedRanges = await getBlockedRanges(property.id);
  const guests = parseGuestsFromParams(query);
  const rareFind = isRareFind(property.ratingAverage, property.reviewCount);

  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-8 pb-24 sm:px-8 lg:pb-8">
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

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <section className="border-b border-hairline-soft py-8">
            <p className="whitespace-pre-line text-base leading-relaxed text-body">
              {property.description}
            </p>
          </section>

          <AmenitiesSection amenities={property.amenities} unavailableAmenities={property.unavailableAmenities} />

          <HostCard host={property.host} />

          <ReviewsSection
            reviews={property.reviews}
            ratingAverage={property.ratingAverage}
            reviewCount={property.reviewCount}
          />
        </div>

        <div id="reserve" className="scroll-mt-24">
          <ReservationCard
            propertySlug={property.slug}
            pricePerNight={property.pricePerNight}
            maxGuests={property.maxGuests}
            defaultCheckIn={first(query.checkIn)}
            defaultCheckOut={first(query.checkOut)}
            defaultGuests={guests}
            blockedRanges={blockedRanges}
            ratingAverage={property.ratingAverage}
            reviewCount={property.reviewCount}
            unavailable={first(query.unavailable) === "1"}
          />
        </div>
      </div>

      <MobileReserveBar pricePerNight={property.pricePerNight} />
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
