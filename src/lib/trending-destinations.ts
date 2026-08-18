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
