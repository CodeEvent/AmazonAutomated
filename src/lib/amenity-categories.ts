/**
 * Groups a property's real amenity strings into Booking.com-style facility
 * categories via keyword matching. Purely a display grouping over real data
 * (nothing is invented) — an amenity that matches no keyword list falls into
 * "General".
 */
const CATEGORIES: Array<{ label: string; keywords: string[] }> = [
  { label: "Wifi & workspace", keywords: ["wifi"] },
  { label: "Kitchen & dining", keywords: ["kitchen", "minibar", "breakfast", "room service"] },
  { label: "Outdoor space", keywords: ["balcony", "garden", "courtyard", "terrace", "rooftop", "beach", "pool"] },
  { label: "Wellness", keywords: ["hot tub", "spa", "gym", "sauna", "soaking tub"] },
  { label: "Views", keywords: ["view", "lake"] },
  { label: "Parking & arrival", keywords: ["parking", "doorman", "check-in", "valet"] },
  { label: "Home comforts", keywords: ["air conditioning", "fireplace", "washer", "laundry", "locker"] },
];

export function categorizeAmenities(amenities: string[]): Array<{ label: string; items: string[] }> {
  const remaining = new Set(amenities);
  const buckets: Array<{ label: string; items: string[] }> = [];

  for (const category of CATEGORIES) {
    const matches = [...remaining].filter((amenity) =>
      category.keywords.some((keyword) => amenity.toLowerCase().includes(keyword)),
    );
    if (matches.length > 0) {
      buckets.push({ label: category.label, items: matches });
      matches.forEach((match) => remaining.delete(match));
    }
  }

  if (remaining.size > 0) {
    buckets.push({ label: "General", items: [...remaining] });
  }

  return buckets;
}
