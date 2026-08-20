import { prisma } from "@/lib/prisma";

export async function getOtherListingsByHost(hostId: string, excludePropertyId: string) {
  return prisma.property.findMany({
    where: { hostId, id: { not: excludePropertyId } },
    orderBy: { ratingAverage: "desc" },
    take: 10,
  });
}

export async function getHostReviews(hostId: string, take = 10) {
  return prisma.review.findMany({
    where: { property: { hostId } },
    orderBy: { createdAt: "desc" },
    take,
    include: { user: { select: { name: true, createdAt: true } } },
  });
}
