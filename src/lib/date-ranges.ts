/**
 * Pure date-range helpers with no server dependencies, safe to import from
 * client components (unlike availability.ts, which pulls in Prisma/pg).
 */

/** Half-open interval overlap: [aStart, aEnd) intersects [bStart, bEnd). */
export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}
