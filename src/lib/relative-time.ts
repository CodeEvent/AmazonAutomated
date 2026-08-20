/** "5 days ago" / "3 months ago" / "2 years ago" style label for review timestamps. */
export function relativeTimeLabel(date: Date, now: Date = new Date()): string {
  const ms = now.getTime() - date.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));

  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30.44);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;

  const years = Math.floor(days / 365.25);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

/** "3 months on Wayfarer" / "2 years on Wayfarer" style label for reviewer tenure. */
export function tenureLabel(createdAt: Date, now: Date = new Date()): string {
  const ms = now.getTime() - createdAt.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const months = Math.floor(days / 30.44);

  if (months < 1) return "New on Wayfarer";
  if (months < 12) return months === 1 ? "1 month on Wayfarer" : `${months} months on Wayfarer`;

  const years = Math.floor(days / 365.25);
  return years === 1 ? "1 year on Wayfarer" : `${years} years on Wayfarer`;
}

const AVATAR_COLORS = [
  "#e07a5f",
  "#3d5a80",
  "#81b29a",
  "#f2cc8f",
  "#9b5de5",
  "#118ab2",
  "#e76f51",
  "#588157",
];

/** Deterministic avatar background color from a name, matching the colored-initial avatars in the real app. */
export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
