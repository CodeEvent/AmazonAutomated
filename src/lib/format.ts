export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const msPerNight = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / msPerNight));
}

/** "15:00" (24h) -> "3:00 PM". */
export function formatTimeOfDay(hhmm: string): string {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}
