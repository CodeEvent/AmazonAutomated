import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";
import { RailScroller } from "@/components/home/rail-scroller";
import { Reveal } from "@/components/motion/reveal";
import type { PropertyRailData } from "@/lib/homepage-sections";

export function PropertyRail({ rail }: { rail: PropertyRailData }) {
  return (
    <Reveal y={12}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-ink">{rail.title}</h2>
        <Link
          href={rail.seeAllHref}
          className="shrink-0 text-sm font-semibold text-ink underline underline-offset-2 hover:no-underline"
        >
          See all
        </Link>
      </div>

      <RailScroller>
        {rail.properties.map((property) => (
          <div key={property.id} className="w-[240px] shrink-0 snap-start sm:w-[260px]">
            <PropertyCard property={property} />
          </div>
        ))}
      </RailScroller>
    </Reveal>
  );
}
