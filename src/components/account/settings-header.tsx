import Link from "next/link";

export function SettingsHeader({ title, backHref = "/account" }: { title: string; backHref?: string }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <Link
        href={backHref}
        aria-label="Back"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-surface-soft"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-ink stroke-2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <h1 className="text-xl font-bold text-ink">{title}</h1>
    </div>
  );
}
