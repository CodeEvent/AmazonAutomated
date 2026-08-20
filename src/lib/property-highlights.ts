export type PropertyHighlight = { icon: "door" | "pin" | "check"; title: string; description: string };

/** Derives a couple of feature highlight cards from what we already know about a listing. */
export function getPropertyHighlights(property: {
  amenities: string[];
  ratingAverage: number;
  reviewCount: number;
}): PropertyHighlight[] {
  const highlights: PropertyHighlight[] = [];

  if (property.amenities.includes("Self check-in")) {
    highlights.push({
      icon: "door",
      title: "Self check-in",
      description: "Check yourself in with the lockbox.",
    });
  }

  if (property.ratingAverage >= 4.85 && property.reviewCount >= 50) {
    highlights.push({
      icon: "pin",
      title: "Great location",
      description: "Guests who stayed here in the past year loved the location.",
    });
  }

  return highlights;
}
