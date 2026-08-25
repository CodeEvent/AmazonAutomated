"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { formatPrice, nightsBetween } from "@/lib/format";
import { Calendar, type CalendarValue } from "@/components/search/calendar";
import { GuestStepper } from "@/components/search/guest-stepper";
import { guestsSummaryLabel, guestsToSearchParams, type GuestCounts } from "@/lib/guests";
import { rangesOverlap } from "@/lib/date-ranges";
import { stayDiscountPreview } from "@/lib/pricing";
import type { RoomType } from "@/generated/prisma/client";

type BookingRange = { roomTypeId: string; checkIn: Date; checkOut: Date };

export function AvailabilityTable({
  propertySlug,
  roomTypes,
  bookings,
  maxGuestsOverall,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
  unavailable,
}: {
  propertySlug: string;
  roomTypes: RoomType[];
  bookings: BookingRange[];
  maxGuestsOverall: number;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests: GuestCounts;
  unavailable?: boolean;
}) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<CalendarValue>({
    checkIn: defaultCheckIn ? new Date(defaultCheckIn) : null,
    checkOut: defaultCheckOut ? new Date(defaultCheckOut) : null,
  });
  const [guests, setGuests] = useState<GuestCounts>(defaultGuests);
  const [openPanel, setOpenPanel] = useState<"dates" | "guests" | null>(null);

  const hasDates = Boolean(dateRange.checkIn && dateRange.checkOut);
  const nights = hasDates ? nightsBetween(dateRange.checkIn!, dateRange.checkOut!) : 0;

  const rows = useMemo(() => {
    return roomTypes.map((roomType) => {
      if (!hasDates) {
        return { roomType, remaining: roomType.quantity, available: true };
      }
      const bookedCount = bookings.filter(
        (b) =>
          b.roomTypeId === roomType.id &&
          rangesOverlap(dateRange.checkIn!, dateRange.checkOut!, b.checkIn, b.checkOut),
      ).length;
      const remaining = roomType.quantity - bookedCount;
      return { roomType, remaining, available: remaining > 0 };
    });
  }, [roomTypes, bookings, hasDates, dateRange]);

  function handleDateChange(next: CalendarValue) {
    setDateRange(next);
    if (next.checkIn && next.checkOut) setOpenPanel(null);
  }

  function reserve(roomTypeId: string) {
    if (!dateRange.checkIn || !dateRange.checkOut) {
      setOpenPanel("dates");
      return;
    }
    const params = new URLSearchParams({
      roomTypeId,
      checkIn: format(dateRange.checkIn, "yyyy-MM-dd"),
      checkOut: format(dateRange.checkOut, "yyyy-MM-dd"),
      ...guestsToSearchParams(guests),
    });
    router.push(`/property/${propertySlug}/book?${params.toString()}`);
  }

  return (
    <section id="availability" className="scroll-mt-24 border-b border-hairline-soft py-8">
      <h2 className="text-xl font-bold text-ink">Availability</h2>

      {unavailable ? (
        <p className="mt-3 rounded-sm bg-primary-disabled px-3 py-2 text-sm text-primary-error-text">
          Those dates were just booked by someone else. Try different dates.
        </p>
      ) : null}

      <div className="relative mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === "dates" ? null : "dates")}
          className="flex-1 rounded-lg border border-hairline px-4 py-3 text-left"
        >
          <span className="block text-xs font-semibold uppercase text-muted">Select dates</span>
          <span className="block text-sm text-ink">
            {dateRange.checkIn && dateRange.checkOut
              ? `${format(dateRange.checkIn, "EEE d MMM")} — ${format(dateRange.checkOut, "EEE d MMM")}`
              : "Add dates"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
          className="flex-1 rounded-lg border border-hairline px-4 py-3 text-left"
        >
          <span className="block text-xs font-semibold uppercase text-muted">Select occupancy</span>
          <span className="block text-sm text-ink">{guestsSummaryLabel(guests)}</span>
        </button>

        {openPanel ? (
          <>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpenPanel(null)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-md border border-hairline bg-canvas p-4 shadow-card sm:left-auto sm:w-[360px]">
              {openPanel === "dates" ? (
                <Calendar value={dateRange} onChange={handleDateChange} />
              ) : (
                <GuestStepper value={guests} onChange={setGuests} maxOccupancy={maxGuestsOverall} />
              )}
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-ink text-left text-canvas">
              <th className="w-2/5 py-3 pl-4 pr-4 font-semibold">Room type</th>
              <th className="py-3 pr-4 font-semibold">
                {hasDates ? `Price for ${nights} night${nights === 1 ? "" : "s"}` : "Price per night"}
              </th>
              <th className="py-3 pr-4 font-semibold">Your choices</th>
              <th className="py-3 pr-4 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ roomType, remaining, available }) => {
              const preview = hasDates
                ? stayDiscountPreview(roomType.pricePerNight, nights)
                : null;
              const total = hasDates ? roomType.pricePerNight * nights : roomType.pricePerNight;
              return (
                <tr key={roomType.id} className="border-b border-hairline-soft align-top last:border-b-0">
                  <td className="py-4 pl-4 pr-4">
                    <p className="font-semibold text-ink">{roomType.name}</p>
                    <p className="mt-1 text-muted">
                      {roomType.maxGuests} guest{roomType.maxGuests === 1 ? "" : "s"} · {roomType.bedConfiguration}
                      {roomType.sizeSqm ? ` · ${roomType.sizeSqm} m²` : ""}
                    </p>
                    {roomType.amenities.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {roomType.amenities.slice(0, 6).map((amenity) => (
                          <span key={amenity} className="flex items-center gap-1.5 text-xs text-body">
                            <AmenityIcon />
                            <span className="truncate">{amenity}</span>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td className="bg-surface-soft py-4 pr-4 align-top">
                    {preview ? (
                      <>
                        <p className="text-xs text-muted line-through">{formatPrice(preview.original)}</p>
                        <p className="mt-0.5 flex items-center gap-2">
                          <span className="text-base font-semibold text-ink">
                            {formatPrice(preview.discounted)}
                          </span>
                          <span className="rounded bg-green-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                            {preview.percentOff}% off
                          </span>
                        </p>
                      </>
                    ) : (
                      <p className="text-base font-semibold text-ink">{formatPrice(total)}</p>
                    )}
                    <p className="mt-1 text-xs text-muted">Includes taxes and charges</p>
                  </td>
                  <td className="py-4 pr-4 text-muted">
                    <p className="flex items-center gap-1.5 text-green-700">
                      <CheckIcon />
                      {roomType.freeCancellation
                        ? hasDates
                          ? `Free cancellation before ${format(dateRange.checkIn!, "d MMM")}`
                          : "Free cancellation"
                        : "Non-refundable"}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-green-700">
                      <CheckIcon /> No prepayment needed
                    </p>
                    {hasDates && available && remaining <= 2 ? (
                      <p className="mt-1.5 font-medium text-brand">
                        {remaining === 1 ? "We have 1 left" : `Only ${remaining} left`}
                      </p>
                    ) : null}
                    {hasDates && !available ? (
                      <p className="mt-1.5 font-medium text-muted">No availability</p>
                    ) : null}
                  </td>
                  <td className="py-4 pr-4">
                    <button
                      type="button"
                      onClick={() => reserve(roomType.id)}
                      disabled={hasDates && !available}
                      className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted"
                    >
                      Reserve
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-center text-xs text-muted sm:text-left">
        It only takes 2 minutes · You won&apos;t be charged yet
      </p>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 shrink-0 fill-none stroke-green-700 stroke-2">
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AmenityIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3 shrink-0 fill-none stroke-muted stroke-2">
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
