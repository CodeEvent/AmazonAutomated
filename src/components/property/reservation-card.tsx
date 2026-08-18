"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { formatPrice, nightsBetween } from "@/lib/format";
import { computeBookingTotals } from "@/lib/pricing";
import { Calendar, type CalendarValue } from "@/components/search/calendar";
import { GuestStepper } from "@/components/search/guest-stepper";
import { guestsSummaryLabel, guestsToSearchParams, type GuestCounts } from "@/lib/guests";
import type { DateRange } from "@/lib/availability";

export function ReservationCard({
  propertySlug,
  pricePerNight,
  maxGuests,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
  blockedRanges,
  ratingAverage,
  reviewCount,
  unavailable,
}: {
  propertySlug: string;
  pricePerNight: number;
  maxGuests: number;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests: GuestCounts;
  blockedRanges: DateRange[];
  ratingAverage: number;
  reviewCount: number;
  unavailable?: boolean;
}) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<CalendarValue>({
    checkIn: defaultCheckIn ? new Date(defaultCheckIn) : null,
    checkOut: defaultCheckOut ? new Date(defaultCheckOut) : null,
  });
  const [guests, setGuests] = useState<GuestCounts>(defaultGuests);
  const [openPanel, setOpenPanel] = useState<"dates" | "guests" | null>(null);

  const nights =
    dateRange.checkIn && dateRange.checkOut ? nightsBetween(dateRange.checkIn, dateRange.checkOut) : 0;
  const totals = nights > 0 ? computeBookingTotals(pricePerNight, nights) : null;

  function handleDateChange(next: CalendarValue) {
    setDateRange(next);
    if (next.checkIn && next.checkOut) {
      setOpenPanel(null);
    }
  }

  function handleReserve() {
    if (!dateRange.checkIn || !dateRange.checkOut) {
      setOpenPanel("dates");
      return;
    }
    const params = new URLSearchParams({
      checkIn: format(dateRange.checkIn, "yyyy-MM-dd"),
      checkOut: format(dateRange.checkOut, "yyyy-MM-dd"),
      ...guestsToSearchParams(guests),
    });
    router.push(`/property/${propertySlug}/book?${params.toString()}`);
  }

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

      {unavailable ? (
        <p className="mt-4 rounded-sm bg-primary-disabled px-3 py-2 text-sm text-primary-error-text">
          Those dates were just booked by someone else. Try different dates.
        </p>
      ) : null}

      <div className="relative mt-4">
        <div className="overflow-hidden rounded-sm border border-hairline">
          <button
            type="button"
            onClick={() => setOpenPanel(openPanel === "dates" ? null : "dates")}
            className="grid w-full grid-cols-2 border-b border-hairline text-left"
          >
            <span className="border-r border-hairline p-3">
              <span className="block text-[10px] font-semibold uppercase text-ink">Check-in</span>
              <span className="block text-sm text-ink">
                {dateRange.checkIn ? format(dateRange.checkIn, "MMM d, yyyy") : "Add date"}
              </span>
            </span>
            <span className="p-3">
              <span className="block text-[10px] font-semibold uppercase text-ink">Checkout</span>
              <span className="block text-sm text-ink">
                {dateRange.checkOut ? format(dateRange.checkOut, "MMM d, yyyy") : "Add date"}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
            className="block w-full p-3 text-left"
          >
            <span className="block text-[10px] font-semibold uppercase text-ink">Guests</span>
            <span className="block text-sm text-ink">{guestsSummaryLabel(guests)}</span>
          </button>
        </div>

        {openPanel ? (
          <>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpenPanel(null)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-md border border-hairline bg-canvas p-4 shadow-card">
              {openPanel === "dates" ? (
                <Calendar value={dateRange} onChange={handleDateChange} disabledRanges={blockedRanges} />
              ) : (
                <GuestStepper value={guests} onChange={setGuests} maxOccupancy={maxGuests} />
              )}
            </div>
          </>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleReserve}
        className="mt-4 w-full rounded-sm bg-primary py-3 text-base font-medium text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98]"
      >
        Reserve
      </button>

      {totals ? (
        <div className="mt-4 space-y-2 border-t border-hairline-soft pt-4 text-sm text-ink">
          <div className="flex justify-between">
            <span>
              {formatPrice(pricePerNight)} × {nights} night{nights === 1 ? "" : "s"}
            </span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(totals.total)}</span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-center text-sm text-muted">You won&apos;t be charged yet</p>
      )}
    </div>
  );
}
