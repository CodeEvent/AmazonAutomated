import "server-only";
import { prisma } from "@/lib/prisma";

const DAY_MS = 1000 * 60 * 60 * 24;
const TREND_WINDOW_DAYS = 30;

export type ReportingSummary = {
  totalRevenueCents: number;
  windowRevenueCents: number;
  priorWindowRevenueCents: number;
  averageBookingValueCents: number;
  totalBookings: number;
  cancelledBookings: number;
  cancellationRatePercent: number;
  trailingOccupancyRatePercent: number;
  forwardOccupancyRatePercent: number;
  dailyBookings: { date: string; count: number }[];
  topProperties: { id: string; slug: string; name: string; revenueCents: number; bookingCount: number }[];
  promoPerformance: {
    code: string;
    active: boolean;
    redemptionCount: number;
    totalDiscountCents: number;
  }[];
};

export async function getReportingSummary(): Promise<ReportingSummary> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - TREND_WINDOW_DAYS * DAY_MS);
  const priorWindowStart = new Date(windowStart.getTime() - TREND_WINDOW_DAYS * DAY_MS);
  const forwardWindowEnd = new Date(now.getTime() + TREND_WINDOW_DAYS * DAY_MS);

  const [
    revenueAgg,
    windowRevenueAgg,
    priorWindowRevenueAgg,
    totalBookings,
    cancelledBookings,
    recentBookings,
    roomTypeQuantities,
    trailingOverlappingBookings,
    forwardOverlappingBookings,
    propertyRevenueGroups,
    promoDiscountGroups,
    promoCodes,
  ] = await Promise.all([
    prisma.booking.aggregate({ where: { status: "CONFIRMED" }, _sum: { totalPrice: true } }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", createdAt: { gte: windowStart } },
      _sum: { totalPrice: true },
    }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", createdAt: { gte: priorWindowStart, lt: windowStart } },
      _sum: { totalPrice: true },
    }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.booking.findMany({
      where: { createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
    prisma.roomType.aggregate({ _sum: { quantity: true } }),
    prisma.booking.findMany({
      where: { status: "CONFIRMED", checkIn: { lt: now }, checkOut: { gt: windowStart } },
      select: { checkIn: true, checkOut: true },
    }),
    prisma.booking.findMany({
      where: { status: "CONFIRMED", checkIn: { lt: forwardWindowEnd }, checkOut: { gt: now } },
      select: { checkIn: true, checkOut: true },
    }),
    prisma.booking.groupBy({
      by: ["propertyId"],
      where: { status: "CONFIRMED" },
      _sum: { totalPrice: true },
      _count: true,
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 5,
    }),
    prisma.booking.groupBy({
      by: ["promoCodeId"],
      where: { status: "CONFIRMED", promoCodeId: { not: null } },
      _sum: { promoDiscount: true },
      _count: true,
    }),
    prisma.promoCode.findMany({ select: { id: true, code: true, active: true, redemptionCount: true } }),
  ]);

  const totalRevenueCents = revenueAgg._sum.totalPrice ?? 0;
  const windowRevenueCents = windowRevenueAgg._sum.totalPrice ?? 0;
  const priorWindowRevenueCents = priorWindowRevenueAgg._sum.totalPrice ?? 0;
  const averageBookingValueCents = totalBookings > 0 ? Math.round(totalRevenueCents / totalBookings) : 0;
  const cancellationRatePercent = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

  // Occupancy: booked room-nights (each confirmed booking occupies one unit of
  // its room type per night) over total available room-nights in a window,
  // clipped to that window's bounds. Trailing = stays already taken (past
  // performance); forward = stays already on the books for the next 30 days
  // (pipeline) — most demo bookings are future-dated, so forward is the more
  // telling number day-to-day.
  const totalRoomUnits = roomTypeQuantities._sum.quantity ?? 0;

  function occupancyRate(
    bookings: { checkIn: Date; checkOut: Date }[],
    rangeStart: Date,
    rangeEnd: Date,
  ): number {
    const rangeDays = Math.max(0, Math.round((rangeEnd.getTime() - rangeStart.getTime()) / DAY_MS));
    const availableRoomNights = totalRoomUnits * rangeDays;
    if (availableRoomNights <= 0) return 0;
    const bookedRoomNights = bookings.reduce((sum, booking) => {
      const overlapStart = Math.max(booking.checkIn.getTime(), rangeStart.getTime());
      const overlapEnd = Math.min(booking.checkOut.getTime(), rangeEnd.getTime());
      return sum + Math.max(0, Math.round((overlapEnd - overlapStart) / DAY_MS));
    }, 0);
    return Math.min(100, Math.round((bookedRoomNights / availableRoomNights) * 100));
  }

  const trailingOccupancyRatePercent = occupancyRate(trailingOverlappingBookings, windowStart, now);
  const forwardOccupancyRatePercent = occupancyRate(forwardOverlappingBookings, now, forwardWindowEnd);

  // Daily booking volume, bucketed by creation date.
  const countsByDate = new Map<string, number>();
  for (const booking of recentBookings) {
    const key = booking.createdAt.toISOString().slice(0, 10);
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
  }
  const dailyBookings: { date: string; count: number }[] = [];
  for (let i = TREND_WINDOW_DAYS - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * DAY_MS).toISOString().slice(0, 10);
    dailyBookings.push({ date, count: countsByDate.get(date) ?? 0 });
  }

  const propertyIds = propertyRevenueGroups.map((g) => g.propertyId);
  const properties = await prisma.property.findMany({
    where: { id: { in: propertyIds } },
    select: { id: true, slug: true, name: true },
  });
  const propertyById = new Map(properties.map((p) => [p.id, p]));
  const topProperties = propertyRevenueGroups
    .map((group) => {
      const property = propertyById.get(group.propertyId);
      if (!property) return null;
      return {
        id: property.id,
        slug: property.slug,
        name: property.name,
        revenueCents: group._sum.totalPrice ?? 0,
        bookingCount: group._count,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const discountByPromoId = new Map(promoDiscountGroups.map((g) => [g.promoCodeId, g]));
  const promoPerformance = promoCodes
    .map((promo) => {
      const group = discountByPromoId.get(promo.id);
      return {
        code: promo.code,
        active: promo.active,
        redemptionCount: promo.redemptionCount,
        totalDiscountCents: group?._sum.promoDiscount ?? 0,
      };
    })
    .filter((p) => p.redemptionCount > 0)
    .sort((a, b) => b.totalDiscountCents - a.totalDiscountCents);

  return {
    totalRevenueCents,
    windowRevenueCents,
    priorWindowRevenueCents,
    averageBookingValueCents,
    totalBookings,
    cancelledBookings,
    cancellationRatePercent,
    trailingOccupancyRatePercent,
    forwardOccupancyRatePercent,
    dailyBookings,
    topProperties,
    promoPerformance,
  };
}
