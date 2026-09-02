import "server-only";

export type CalendarDay = {
  date: Date;
  occupied: number;
  quantity: number;
  remaining: number;
  isBlocked: boolean;
};

/**
 * One month of real per-day occupancy for a room type, from actual bookings +
 * blocks. Bookings' occupied window is extended past checkout by
 * turnoverBufferHours, matching the real gating in src/lib/availability.ts,
 * so the admin sees exactly what guests actually can and can't book.
 */
export function buildCalendarMonth(
  year: number,
  month: number, // 0-indexed
  quantity: number,
  bookings: { checkIn: Date; checkOut: Date }[],
  blocks: { startDate: Date; endDate: Date }[],
  turnoverBufferHours = 0,
): CalendarDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const bufferMs = turnoverBufferHours * 60 * 60 * 1000;
  const days: CalendarDay[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const nextDate = new Date(year, month, d + 1);
    const bookedHere = bookings.filter((b) => {
      const effectiveCheckOut = bufferMs > 0 ? new Date(b.checkOut.getTime() + bufferMs) : b.checkOut;
      return b.checkIn < nextDate && effectiveCheckOut > date;
    }).length;
    const blockedHere = blocks.filter((b) => b.startDate < nextDate && b.endDate > date).length;
    const occupied = bookedHere + blockedHere;
    days.push({ date, occupied, quantity, remaining: quantity - occupied, isBlocked: blockedHere > 0 });
  }

  return days;
}

/** Monday-first leading offset (0-6) for a month's first day, to pad a 7-column grid. */
export function leadingOffset(year: number, month: number): number {
  const jsWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  return (jsWeekday + 6) % 7;
}
