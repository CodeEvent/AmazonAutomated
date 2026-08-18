import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SearchBarPill } from "@/components/search/search-bar-pill";
import { PropertyCard } from "@/components/property/property-card";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-types";
import { PropertyType } from "@/generated/prisma/client";
import { Reveal } from "@/components/motion/reveal";

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
  const guests = Number(first(params.guests) ?? "1") || 1;
  const type = first(params.type);
  const minPrice = Number(first(params.minPrice) ?? "") || undefined;
  const maxPrice = Number(first(params.maxPrice) ?? "") || undefined;
  const sortKey = (first(params.sort) as keyof typeof SORT_OPTIONS) ?? "recommended";
  const sort = SORT_OPTIONS[sortKey] ?? SORT_OPTIONS.recommended;

  const where: Prisma.PropertyWhereInput = {
    maxGuests: { gte: guests },
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

  const properties = await prisma.property.findMany({
    where,
    orderBy: sort.orderBy,
  });

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <SearchBarPill
        defaultDestination={destination}
        defaultCheckIn={checkIn}
        defaultCheckOut={checkOut}
        defaultGuests={guests}
      />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          {/* Mobile: collapsed disclosure so results don't require extra scrolling to reach */}
          <details className="group rounded-sm border border-hairline px-4 py-3 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              <span>
                Filters
                {type && type in PROPERTY_TYPE_LABELS
                  ? ` · ${PROPERTY_TYPE_LABELS[type as keyof typeof PROPERTY_TYPE_LABELS]}`
                  : ""}
              </span>
              <ChevronDownIcon />
            </summary>
            <ul className="mt-3 space-y-2">
              <FilterLink
                label="All types"
                active={!type}
                params={params}
                overrides={{ type: undefined }}
              />
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <FilterLink
                  key={value}
                  label={label}
                  active={type === value}
                  params={params}
                  overrides={{ type: value }}
                />
              ))}
            </ul>
          </details>

          {/* Desktop: always-visible sidebar */}
          <div className="hidden lg:block">
            <h2 className="text-base font-semibold text-ink">Property type</h2>
            <ul className="mt-3 space-y-2">
              <FilterLink
                label="All types"
                active={!type}
                params={params}
                overrides={{ type: undefined }}
              />
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <FilterLink
                  key={value}
                  label={label}
                  active={type === value}
                  params={params}
                  overrides={{ type: value }}
                />
              ))}
            </ul>
          </div>
        </aside>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
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
            <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((property, index) => (
                <Reveal key={property.id} delay={Math.min(index * 0.04, 0.24)}>
                  <PropertyCard property={property} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterLink({
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
    <li>
      <a
        href={`/search?${next.toString()}`}
        className={active ? "text-sm font-semibold text-ink" : "text-sm text-muted hover:text-ink"}
      >
        {label}
      </a>
    </li>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
