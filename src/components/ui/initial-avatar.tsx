import { avatarColor } from "@/lib/relative-time";

export function InitialAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: avatarColor(name), fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
}
