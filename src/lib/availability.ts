import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type DateRange = { checkIn: Date; checkOut: Date };

/** All confirmed booking date ranges for a property, used to grey out unavailable calendar days. */
export async function getBlockedRanges(propertyId: string): Promise<DateRange[]> {
  return prisma.booking.findMany({
    where: { propertyId, status: "CONFIRMED" },
    select: { checkIn: true, checkOut: true },
  });
}

/** Half-open interval overlap: [aStart, aEnd) intersects [bStart, bEnd). */
export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export async function isRangeAvailable(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<boolean> {
  const overlapping = await prisma.booking.findFirst({
    where: {
      propertyId,
      status: "CONFIRMED",
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { id: true },
  });
  return !overlapping;
}

/** Prisma where-fragment excluding properties fully booked for the given dates, if both are provided. */
export function availabilityWhere(
  checkIn: Date | undefined,
  checkOut: Date | undefined,
): Prisma.PropertyWhereInput {
  if (!checkIn || !checkOut) return {};

  return {
    bookings: {
      none: {
        status: "CONFIRMED",
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    },
  };
}
