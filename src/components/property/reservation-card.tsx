import { formatPrice } from "@/lib/format";

export function ReservationCard({
  propertySlug,
  pricePerNight,
  maxGuests,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
  ratingAverage,
  reviewCount,
}: {
  propertySlug: string;
  pricePerNight: number;
  maxGuests: number;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
  ratingAverage: number;
  reviewCount: number;
}) {
  return (
    <div className="sticky top-6 rounded-md border border-hairline p-6 shadow-card">
      <div className="flex items-baseline justify-between">
        <p className="text-lg text-ink">
          <span className="font-semibold">{formatPrice(pricePerNight)}</span> night
        </p>
        {reviewCount > 0 ? (
          <span className="text-sm text-ink">
            ★ {ratingAverage.toFixed(2)} · {reviewCount} reviews
          </span>
        ) : null}
      </div>

      <form action={`/property/${propertySlug}/book`} method="get" className="mt-4">
        <div className="grid grid-cols-2 overflow-hidden rounded-sm border border-hairline">
          <label className="border-r border-hairline p-3">
            <span className="block text-[10px] font-semibold uppercase text-ink">Check-in</span>
            <input
              type="date"
              name="checkIn"
              required
              defaultValue={defaultCheckIn}
              className="w-full bg-transparent text-sm text-ink focus:outline-none"
            />
          </label>
          <label className="p-3">
            <span className="block text-[10px] font-semibold uppercase text-ink">Checkout</span>
            <input
              type="date"
              name="checkOut"
              required
              defaultValue={defaultCheckOut}
              className="w-full bg-transparent text-sm text-ink focus:outline-none"
            />
          </label>
          <label className="col-span-2 border-t border-hairline p-3">
            <span className="block text-[10px] font-semibold uppercase text-ink">Guests</span>
            <input
              type="number"
              name="guests"
              min={1}
              max={maxGuests}
              defaultValue={defaultGuests ?? 1}
              className="w-full bg-transparent text-sm text-ink focus:outline-none"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-sm bg-primary py-3 text-base font-medium text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98]"
        >
          Reserve
        </button>
      </form>

      <p className="mt-3 text-center text-sm text-muted">You won&apos;t be charged yet</p>
    </div>
  );
}
