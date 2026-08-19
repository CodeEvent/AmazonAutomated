import { prisma } from "@/lib/prisma";

export type TrendingDestination = { city: string; country: string; count: number };

export async function getTrendingDestinations(limit = 8): Promise<TrendingDestination[]> {
  const cities = await prisma.property.groupBy({
    by: ["city", "country"],
    _count: { _all: true },
    orderBy: { _count: { city: "desc" } },
    take: limit,
  });

  return cities.map((c) => ({ city: c.city, country: c.country, count: c._count._all }));
}

export type DestinationTile = TrendingDestination & { image: string };

/** Trending destinations paired with a representative photo, for the homepage's inspiration tiles. */
export async function getDestinationTiles(limit = 8): Promise<DestinationTile[]> {
  const destinations = await getTrendingDestinations(limit);

  const tiles = await Promise.all(
    destinations.map(async (destination) => {
      const top = await prisma.property.findFirst({
        where: { city: destination.city },
        orderBy: { ratingAverage: "desc" },
        select: { images: true },
      });
      return { ...destination, image: top?.images[0] ?? "" };
    }),
  );

  return tiles.filter((tile) => tile.image.length > 0);
}
