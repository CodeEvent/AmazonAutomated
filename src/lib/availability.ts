import { prisma } from "@/lib/prisma";
import type { RoomType } from "@/generated/prisma/client";

export type DateRange = { checkIn: Date; checkOut: Date };

export type RoomTypeAvailability = RoomType & {
  bookedCount: number;
  remaining: number;
  available: boolean;
};

/**
 * How many of a room type's units are unavailable for a date range — real
 * confirmed bookings plus admin-managed blocked-date ranges (maintenance,
 * owner use, etc.), which count against quantity exactly like a booking.
 */
async function countOccupiedUnits(roomTypeId: string, checkIn: Date, checkOut: Date): Promise<number> {
  const [bookedCount, blockedCount] = await Promise.all([
    prisma.booking.count({
      where: {
        roomTypeId,
        status: "CONFIRMED",
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    }),
    prisma.blockedDate.count({
      where: {
        roomTypeId,
        startDate: { lt: checkOut },
        endDate: { gt: checkIn },
      },
    }),
  ]);
  return bookedCount + blockedCount;
}

/**
 * All of a property's room types, each annotated with how many units are still
 * free for the given dates (or full quantity/no dates chosen yet). This is what
 * drives the Booking.com-style availability table on the listing page.
 */
export async function getRoomTypesWithAvailability(
  propertyId: string,
  checkIn?: Date,
  checkOut?: Date,
): Promise<RoomTypeAvailability[]> {
  const roomTypes = await prisma.roomType.findMany({
    where: { propertyId },
    orderBy: { pricePerNight: "asc" },
  });

  if (!checkIn || !checkOut) {
    return roomTypes.map((roomType) => ({
      ...roomType,
      bookedCount: 0,
      remaining: roomType.quantity,
      available: true,
    }));
  }

  return Promise.all(
    roomTypes.map(async (roomType) => {
      const bookedCount = await countOccupiedUnits(roomType.id, checkIn, checkOut);
      const remaining = roomType.quantity - bookedCount;
      return { ...roomType, bookedCount, remaining, available: remaining > 0 };
    }),
  );
}

export async function isRoomTypeAvailable(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<boolean> {
  const roomType = await prisma.roomType.findUnique({ where: { id: roomTypeId } });
  if (!roomType) return false;
  const occupiedCount = await countOccupiedUnits(roomTypeId, checkIn, checkOut);
  return occupiedCount < roomType.quantity;
}

/** True if at least one of the property's room types still has capacity for these dates. */
export async function isPropertyAvailable(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<boolean> {
  const roomTypes = await getRoomTypesWithAvailability(propertyId, checkIn, checkOut);
  return roomTypes.some((roomType) => roomType.available);
}

/** Cheapest available room type's nightly price, for search-result cards ("from $X"). */
export function cheapestAvailableRate(roomTypes: RoomTypeAvailability[]): number | null {
  const available = roomTypes.filter((rt) => rt.available);
  if (available.length === 0) return null;
  return Math.min(...available.map((rt) => rt.pricePerNight));
}
