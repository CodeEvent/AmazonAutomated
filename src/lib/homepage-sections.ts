import { prisma } from "@/lib/prisma";
import type { Property } from "@/generated/prisma/client";

export type PropertyRailData = {
  key: string;
  title: string;
  seeAllHref: string;
  properties: Property[];
};

/** Rails need enough cards to actually scroll — below this we skip the rail entirely. */
const MIN_RAIL_SIZE = 4;
const MAX_RAILS = 4;
const CARDS_PER_RAIL = 10;

export async function getHomepageRails(): Promise<PropertyRailData[]> {
  const cityGroups = await prisma.property.groupBy({
    by: ["city"],
    _count: { _all: true },
    orderBy: { _count: { city: "desc" } },
  });

  const rails: PropertyRailData[] = [];

  for (const group of cityGroups) {
    if (rails.length >= MAX_RAILS - 1) break;
    if (group._count._all < MIN_RAIL_SIZE) continue;

    const properties = await prisma.property.findMany({
      where: { city: group.city },
      orderBy: { ratingAverage: "desc" },
      take: CARDS_PER_RAIL,
    });

    rails.push({
      key: `city-${group.city}`,
      title: `Popular homes in ${group.city}`,
      seeAllHref: `/search?destination=${encodeURIComponent(group.city)}`,
      properties,
    });
  }

  const hotels = await prisma.property.findMany({
    where: { type: { in: ["HOTEL", "RESORT"] } },
    orderBy: { ratingAverage: "desc" },
    take: CARDS_PER_RAIL,
  });

  if (hotels.length >= MIN_RAIL_SIZE) {
    rails.push({
      key: "hotels",
      title: "Great hotels for your next trip",
      seeAllHref: "/search?type=HOTEL",
      properties: hotels,
    });
  }

  return rails;
}
