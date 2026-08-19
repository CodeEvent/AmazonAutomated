export function yearsOnPlatform(createdAt: Date, now: Date = new Date()): number {
  const ms = now.getTime() - createdAt.getTime();
  return Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
}

/** Short label for a stat tile — "New" under a year, otherwise the year count. */
export function yearsOnPlatformLabel(createdAt: Date, now: Date = new Date()): string | number {
  const years = yearsOnPlatform(createdAt, now);
  return years < 1 ? "New" : years;
}
