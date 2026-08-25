import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SearchLauncher } from "@/components/search/search-launcher";
import { SearchResultRow } from "@/components/property/search-result-row";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-types";
import { PropertyType } from "@/generated/prisma/client";
import { Reveal } from "@/components/motion/reveal";
import { guestsToSearchParams, occupancy, parseGuestsFromParams } from "@/lib/guests";
import { isPropertyAvailable } from "@/lib/availability";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SORT_OPTIONS = {
  recommended: { label: "Recommended", orderBy: { ratingAverage: "desc" as const } },
  price_asc: { label: "Price: low to high", orderBy: { pricePerNight: "asc" as const } },
  price_desc: { label: "Price: high to low", orderBy: { pricePerNight: "desc" as const } },
  rating: { label: "Top rated", orderBy: { ratingAverage: "desc" as const } },
} satisfies Record<string, { label: string; orderBy: Prisma.PropertyOrderByWithRelationInput }>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const destination = first(params.destination) ?? "";
  const checkIn = first(params.checkIn) ?? "";
  const checkOut = first(params.checkOut) ?? "";
  const guests = parseGuestsFromParams(params);
  const type = first(params.type);
  const minPrice = Number(first(params.minPrice) ?? "") || undefined;
  const maxPrice = Number(first(params.maxPrice) ?? "") || undefined;
  const sortKey = (first(params.sort) as keyof typeof SORT_OPTIONS) ?? "recommended";
  const sort = SORT_OPTIONS[sortKey] ?? SORT_OPTIONS.recommended;

  const checkInDate = checkIn ? new Date(checkIn) : undefined;
  const checkOutDate = checkOut ? new Date(checkOut) : undefined;

  const propertyLinkParams = new URLSearchParams(guestsToSearchParams(guests));
  if (checkIn) propertyLinkParams.set("checkIn", checkIn);
  if (checkOut) propertyLinkParams.set("checkOut", checkOut);
  const propertyLinkQuery = propertyLinkParams.toString();

  const where: Prisma.PropertyWhereInput = {
    maxGuests: { gte: occupancy(guests) },
  };

  if (destination) {
    where.OR = [
      { city: { contains: destination, mode: "insensitive" } },
      { country: { contains: destination, mode: "insensitive" } },
      { name: { contains: destination, mode: "insensitive" } },
    ];
  }

  if (type && type in PropertyType) {
    where.type = type as PropertyType;
  }

  if (minPrice || maxPrice) {
    where.pricePerNight = {
      ...(minPrice ? { gte: minPrice * 100 } : {}),
      ...(maxPrice ? { lte: maxPrice * 100 } : {}),
    };
  }

  const candidates = await prisma.property.findMany({
    where,
    orderBy: sort.orderBy,
    include: { roomTypes: { orderBy: { pricePerNight: "asc" }, take: 1 } },
  });

  let properties = candidates;
  if (checkInDate && checkOutDate) {
    const availabilityFlags = await Promise.all(
      candidates.map((property) => isPropertyAvailable(property.id, checkInDate, checkOutDate)),
    );
    properties = candidates.filter((_, index) => availabilityFlags[index]);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <SearchLauncher
        defaultDestination={destination}
        defaultCheckIn={checkIn}
        defaultCheckOut={checkOut}
        searchParams={params}
      />

      {/* Horizontal pill filter bar, matching airbnb.com's search results header
          (a left filter sidebar reads more like booking.com than Airbnb). */}
      <div className="mt-6 -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterPill
          label="All types"
          active={!type}
          params={params}
          overrides={{ type: undefined }}
        />
        {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
          <FilterPill
            key={value}
            label={label}
            active={type === value}
            params={params}
            overrides={{ type: value }}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {properties.length} stay{properties.length === 1 ? "" : "s"}
          {destination ? ` in ${destination}` : ""}
        </p>

        <form action="/search" method="get" className="flex items-center gap-2">
          {Object.entries(params).map(([key, value]) =>
            key === "sort" || value === undefined ? null : (
              <input key={key} type="hidden" name={key} value={first(value)} />
            ),
          )}
          <label className="text-sm text-muted" htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sortKey}
            className="rounded-sm border border-hairline px-3 py-2 text-sm text-ink"
          >
            {Object.entries(SORT_OPTIONS).map(([key, option]) => (
              <option key={key} value={key}>
                {option.label}
              </option>
            ))}
          </select>
        </form>
      </div>

      {properties.length === 0 ? (
        <p className="mt-12 text-center text-muted">
          No stays match your search. Try different dates or a broader destination.
        </p>
      ) : (
        <div className="mx-auto mt-6 flex max-w-[900px] flex-col gap-4">
          {properties.map((property, index) => {
            const cheapestRoom = property.roomTypes[0];
            return (
              <Reveal key={property.id} delay={Math.min(index * 0.03, 0.24)}>
                <SearchResultRow
                  property={{
                    ...property,
                    roomTypeName: cheapestRoom?.name ?? "Entire place",
                    freeCancellation: cheapestRoom?.freeCancellation ?? true,
                  }}
                  searchQuery={propertyLinkQuery}
                  checkIn={checkInDate}
                  checkOut={checkOutDate}
                />
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  params,
  overrides,
}: {
  label: string;
  active: boolean;
  params: Record<string, string | string[] | undefined>;
  overrides: Record<string, string | undefined>;
}) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, ...overrides })) {
    const v = first(value as string | string[] | undefined);
    if (v) next.set(key, v);
  }

  return (
    <a
      href={`/search?${next.toString()}`}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-ink bg-ink text-canvas"
          : "border-hairline text-ink hover:border-ink"
      }`}
    >
      {label}
    </a>
  );
}
