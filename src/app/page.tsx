import { prisma } from "@/lib/prisma";
import { SearchLauncher } from "@/components/search/search-launcher";
import { PropertyCard } from "@/components/property/property-card";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-types";
import { Reveal } from "@/components/motion/reveal";
import { getTrendingDestinations } from "@/lib/trending-destinations";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const properties = await prisma.property.findMany({
    orderBy: { ratingAverage: "desc" },
    take: 12,
  });

  const cities = await getTrendingDestinations(6);

  return (
    <div>
      <section className="border-b border-hairline-soft bg-surface-soft/40 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-[1440px]">
          <Reveal y={12}>
            <h1 className="text-center text-[28px] font-bold leading-tight text-ink">
              Find your next stay
            </h1>
            <p className="mt-2 text-center text-base text-muted">
              Search low prices on hotels, homes, and much more...
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8">
            <SearchLauncher />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8">
        <h2 className="text-xl font-semibold text-ink">Trending destinations</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {cities.map((entry) => (
            <a
              key={`${entry.city}-${entry.country}`}
              href={`/search?destination=${encodeURIComponent(entry.city)}`}
              className="block"
            >
              <h3 className="text-base font-semibold text-ink">{entry.city}</h3>
              <p className="text-sm text-muted">
                {entry.count} stay{entry.count === 1 ? "" : "s"}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-8 sm:px-8">
        <div className="flex flex-wrap gap-3">
          {Object.entries(PROPERTY_TYPE_LABELS).map(([type, label]) => (
            <a
              key={type}
              href={`/search?type=${type}`}
              className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-ink hover:border-ink"
            >
              {label}
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-8">
        <h2 className="text-xl font-semibold text-ink">Popular stays right now</h2>
        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {properties.map((property, index) => (
            <Reveal key={property.id} delay={Math.min(index * 0.04, 0.24)}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
