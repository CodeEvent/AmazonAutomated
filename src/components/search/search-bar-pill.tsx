import { MagneticButton } from "@/components/motion/magnetic-button";

export function SearchBarPill({
  defaultDestination,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
}: {
  defaultDestination?: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
}) {
  return (
    <form
      action="/search"
      method="get"
      className="mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-lg border border-hairline bg-canvas p-2 shadow-card sm:flex-row sm:items-center sm:rounded-full sm:gap-0"
    >
      <label className="flex-1 rounded-full px-6 py-2 hover:bg-surface-soft sm:border-r sm:border-hairline">
        <span className="block text-xs font-semibold text-ink">Where</span>
        <input
          type="text"
          name="destination"
          defaultValue={defaultDestination}
          placeholder="Search destinations"
          className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </label>

      <label className="flex-1 rounded-full px-6 py-2 hover:bg-surface-soft sm:border-r sm:border-hairline">
        <span className="block text-xs font-semibold text-ink">Check in</span>
        <input
          type="date"
          name="checkIn"
          defaultValue={defaultCheckIn}
          className="w-full bg-transparent text-sm text-ink focus:outline-none"
        />
      </label>

      <label className="flex-1 rounded-full px-6 py-2 hover:bg-surface-soft sm:border-r sm:border-hairline">
        <span className="block text-xs font-semibold text-ink">Check out</span>
        <input
          type="date"
          name="checkOut"
          defaultValue={defaultCheckOut}
          className="w-full bg-transparent text-sm text-ink focus:outline-none"
        />
      </label>

      <label className="flex flex-1 items-center justify-between gap-2 rounded-full px-6 py-2 hover:bg-surface-soft">
        <span className="flex-1">
          <span className="block text-xs font-semibold text-ink">Who</span>
          <input
            type="number"
            name="guests"
            min={1}
            max={32}
            defaultValue={defaultGuests ?? 1}
            className="w-full bg-transparent text-sm text-ink focus:outline-none"
          />
        </span>
        <MagneticButton
          type="submit"
          aria-label="Search"
          range={40}
          strength={0.3}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary-active"
        >
          <SearchIcon />
        </MagneticButton>
      </label>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
