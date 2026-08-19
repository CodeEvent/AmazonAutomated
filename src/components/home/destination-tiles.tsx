import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import type { DestinationTile } from "@/lib/trending-destinations";

export function DestinationTiles({ destinations }: { destinations: DestinationTile[] }) {
  if (destinations.length === 0) return null;

  return (
    <Reveal y={12}>
      <h2 className="text-xl font-semibold text-ink">Inspiration for your next trip</h2>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {destinations.map((destination) => (
          <Link
            key={`${destination.city}-${destination.country}`}
            href={`/search?destination=${encodeURIComponent(destination.city)}`}
            className="group block"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-soft">
              <Image
                src={destination.image}
                alt={destination.city}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-ink">{destination.city}</h3>
            <p className="text-sm text-muted">
              {destination.count} stay{destination.count === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}
