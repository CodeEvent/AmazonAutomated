/** Booking.com-style qualitative label for a 0-5 rating, used alongside (not instead of) our star rating. */
export function ratingLabel(ratingAverage: number): string | null {
  if (ratingAverage >= 4.8) return "Exceptional";
  if (ratingAverage >= 4.5) return "Excellent";
  if (ratingAverage >= 4.0) return "Very good";
  if (ratingAverage >= 3.5) return "Good";
  if (ratingAverage > 0) return "Fair";
  return null;
}
