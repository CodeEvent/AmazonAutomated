import Link from "next/link";
import Image from "next/image";
import { RailScroller } from "@/components/home/rail-scroller";
import type { Property } from "@/generated/prisma/client";

export function HostListingsRail({ hostName, listings }: { hostName: string; listings: Property[] }) {
  if (listings.length === 0) return null;

  return (
    <div className="mt-6 border-t border-hairline-soft pt-6">
      <h3 className="text-base font-semibold text-ink">{hostName}&apos;s listings</h3>
      <div className="mt-4">
        <RailScroller>
          {listings.map((property) => (
            <Link key={property.id} href={`/property/${property.slug}`} className="block w-[180px] shrink-0 snap-start">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-soft">
                {property.images[0] ? (
                  <Image
                    src={property.images[0]}
                    alt={property.name}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <p className="mt-2 text-xs text-muted">Entire place</p>
              <p className="truncate text-sm font-medium text-ink">{property.name}</p>
              {property.reviewCount > 0 ? (
                <p className="text-xs text-muted">
                  ★ {property.ratingAverage.toFixed(2)} · {property.reviewCount} reviews
                </p>
              ) : null}
            </Link>
          ))}
        </RailScroller>
      </div>
    </div>
  );
}
