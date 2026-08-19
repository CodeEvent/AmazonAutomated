/** Stable, explainable heuristic for the "Rare find" badge — no real demand signal to draw on yet. */
export function isRareFind(ratingAverage: number, reviewCount: number): boolean {
  return ratingAverage >= 4.9 && reviewCount >= 150;
}
