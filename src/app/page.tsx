import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SearchLauncher } from "@/components/search/search-launcher";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyRail } from "@/components/home/property-rail";
import { DestinationTiles } from "@/components/home/destination-tiles";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-types";
import { Reveal } from "@/components/motion/reveal";
import { getDestinationTiles } from "@/lib/trending-destinations";
import { getHomepageRails } from "@/lib/homepage-sections";

export const dynamic = "force-dynamic";

const HERO_TABS: Array<{ label: string; active?: boolean; comingSoon?: boolean }> = [
  { label: "Stays", active: true },
  { label: "Flights", comingSoon: true },
  { label: "Car rentals", comingSoon: true },
];

export default async function HomePage() {
  const [destinations, rails] = await Promise.all([
    getDestinationTiles(8),
    getHomepageRails(),
  ]);

  const railPropertyIds = new Set(rails.flatMap((rail) => rail.properties.map((p) => p.id)));

  // Fallback grid: only used when there isn't enough data to fill rails, or to
  // surface properties that didn't make it into any rail.
  const fallbackProperties =
    rails.length === 0
      ? await prisma.property.findMany({ orderBy: { ratingAverage: "desc" }, take: 12 })
      : await prisma.property.findMany({
          where: { id: { notIn: Array.from(railPropertyIds) } },
          orderBy: { ratingAverage: "desc" },
          take: 12,
        });

  return (
    <div>
      <section className="relative overflow-hidden px-4 py-16 sm:px-8">
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/45 to-ink/70" />

        <div className="relative mx-auto max-w-[1440px]">
          <Reveal y={12}>
            <div className="mx-auto flex w-fit items-center gap-1 rounded-full bg-canvas/15 p-1 backdrop-blur-sm">
              {HERO_TABS.map((tab) => (
                <span
                  key={tab.label}
                  title={tab.comingSoon ? "Coming soon" : undefined}
                  className={
                    tab.active
                      ? "flex items-center gap-1.5 rounded-full bg-canvas px-4 py-1.5 text-sm font-semibold text-ink"
                      : "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-canvas/75"
                  }
                >
                  {tab.label}
                  {tab.comingSoon ? (
                    <span className="rounded-full border border-canvas/40 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-canvas/80">
                      New
                    </span>
                  ) : null}
                </span>
              ))}
            </div>

            <h1 className="mt-6 text-center text-[28px] font-bold leading-tight text-canvas drop-shadow-sm">
              Find your next stay
            </h1>
            <p className="mt-2 text-center text-base text-canvas/90 drop-shadow-sm">
              Search low prices on hotels, homes, and much more...
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8">
            <SearchLauncher />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8">
        <DestinationTiles destinations={destinations} />
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

      {rails.map((rail) => (
        <section key={rail.key} className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-8">
          <PropertyRail rail={rail} />
        </section>
      ))}

      {fallbackProperties.length > 0 ? (
        <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-8">
          <h2 className="text-xl font-semibold text-ink">
            {rails.length === 0 ? "Popular stays right now" : "More places to explore"}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {fallbackProperties.map((property, index) => (
              <Reveal key={property.id} delay={Math.min(index * 0.04, 0.24)}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
