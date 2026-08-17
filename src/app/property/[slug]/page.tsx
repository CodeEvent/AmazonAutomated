import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-types";
import { ReservationCard } from "@/components/property/reservation-card";

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
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-8 sm:px-8">
      <h1 className="text-[22px] font-medium leading-tight text-ink">{property.name}</h1>
      <div className="mt-2 flex items-center gap-2 text-sm text-ink">
        {property.reviewCount > 0 ? (
          <span className="flex items-center gap-1 font-medium">
            <StarIcon /> {property.ratingAverage.toFixed(2)} · {property.reviewCount} reviews
          </span>
        ) : (
          <span className="text-muted">New listing</span>
        )}
        <span className="text-muted">
          · {property.city}, {property.country}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2 overflow-hidden rounded-md sm:grid-cols-2">
        {property.images.slice(0, 2).map((src, index) => (
          <div key={src} className="relative aspect-[4/3] bg-surface-soft">
            <Image
              src={src}
              alt={`${property.name} photo ${index + 1}`}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <section className="border-b border-hairline-soft pb-8">
            <p className="text-base font-semibold text-ink">
              {PROPERTY_TYPE_LABELS[property.type]} hosted by {property.hostName}
            </p>
            <p className="mt-1 text-sm text-muted">
              {property.maxGuests} guests · {property.bedrooms} bedrooms · {property.beds} beds ·{" "}
              {property.bathrooms} baths
            </p>
          </section>

          <section className="border-b border-hairline-soft py-8">
            <p className="whitespace-pre-line text-base leading-relaxed text-body">
              {property.description}
            </p>
          </section>

          <section className="border-b border-hairline-soft py-8">
            <h2 className="text-xl font-bold text-ink">What this place offers</h2>
            <ul className="mt-4 grid grid-cols-1 gap-y-3 sm:grid-cols-2">
              {property.amenities.map((amenity) => (
                <li key={amenity} className="border-b border-hairline-soft py-3 text-base text-ink">
                  {amenity}
                </li>
              ))}
            </ul>
          </section>

          <section className="py-8">
            <h2 className="text-xl font-bold text-ink">Reviews</h2>
            {property.reviews.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No reviews yet.</p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {property.reviews.map((review) => (
                  <div key={review.id}>
                    <p className="text-sm font-semibold text-ink">
                      {review.user.name ?? "Guest"}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
                        review.createdAt,
                      )}
                    </p>
                    <p className="mt-2 text-sm text-body">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div>
          <ReservationCard
            propertySlug={property.slug}
            pricePerNight={property.pricePerNight}
            maxGuests={property.maxGuests}
            defaultCheckIn={first(query.checkIn)}
            defaultCheckOut={first(query.checkOut)}
            defaultGuests={Number(first(query.guests) ?? "1") || 1}
            ratingAverage={property.ratingAverage}
            reviewCount={property.reviewCount}
          />
        </div>
      </div>
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
