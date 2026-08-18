export type GuestCounts = {
  adults: number;
  children: number;
  infants: number;
  pets: number;
};

export const DEFAULT_GUESTS: GuestCounts = { adults: 1, children: 0, infants: 0, pets: 0 };

/** Adults + children count toward a property's max occupancy; infants and pets don't. */
export function occupancy(guests: GuestCounts): number {
  return guests.adults + guests.children;
}

export function guestsSummaryLabel(guests: GuestCounts): string {
  const occ = occupancy(guests);
  const parts = [`${occ} guest${occ === 1 ? "" : "s"}`];
  if (guests.infants > 0) parts.push(`${guests.infants} infant${guests.infants === 1 ? "" : "s"}`);
  if (guests.pets > 0) parts.push(`${guests.pets} pet${guests.pets === 1 ? "" : "s"}`);
  return parts.join(", ");
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseCount(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

export function parseGuestsFromParams(
  params: Record<string, string | string[] | undefined>,
): GuestCounts {
  const adults = parseCount(firstParam(params.adults), 1);
  return {
    adults: adults > 0 ? adults : 1,
    children: parseCount(firstParam(params.children), 0),
    infants: parseCount(firstParam(params.infants), 0),
    pets: parseCount(firstParam(params.pets), 0),
  };
}

export function guestsToSearchParams(guests: GuestCounts): Record<string, string> {
  const params: Record<string, string> = { adults: String(guests.adults) };
  if (guests.children > 0) params.children = String(guests.children);
  if (guests.infants > 0) params.infants = String(guests.infants);
  if (guests.pets > 0) params.pets = String(guests.pets);
  return params;
}
