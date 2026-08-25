"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { formatPrice, nightsBetween } from "@/lib/format";
import { Calendar, type CalendarValue } from "@/components/search/calendar";
import { GuestStepper } from "@/components/search/guest-stepper";
import { guestsToSearchParams, type GuestCounts } from "@/lib/guests";
import { rangesOverlap } from "@/lib/date-ranges";
import { stayDiscountPreview } from "@/lib/pricing";
import type { RoomType } from "@/generated/prisma/client";

type BookingRange = { roomTypeId: string; checkIn: Date; checkOut: Date };

// Booking.com shows a split "N adults · N children · N rooms" summary; Wayfarer only
// ever books a single room type per reservation, so the room count is always 1.
function occupancySummary(guests: GuestCounts): string {
  return `${guests.adults} adult${guests.adults === 1 ? "" : "s"} · ${guests.children} child${
    guests.children === 1 ? "" : "ren"
  } · 1 room`;
}

export function AvailabilityTable({
  propertySlug,
  propertyImage,
  roomTypes,
  bookings,
  maxGuestsOverall,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
  unavailable,
  fromPrice,
  showFromPrice,
}: {
  propertySlug: string;
  propertyImage?: string;
  roomTypes: RoomType[];
  bookings: BookingRange[];
  maxGuestsOverall: number;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests: GuestCounts;
  unavailable?: boolean;
  fromPrice: number;
  showFromPrice: boolean;
}) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<CalendarValue>({
    checkIn: defaultCheckIn ? new Date(defaultCheckIn) : null,
    checkOut: defaultCheckOut ? new Date(defaultCheckOut) : null,
  });
  const [guests, setGuests] = useState<GuestCounts>(defaultGuests);
  const [openPanel, setOpenPanel] = useState<"dates" | "guests" | null>(null);
  const [rawSelectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(null);

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

  // Drop the pick if it's no longer available (e.g. the user changed dates) instead
  // of holding onto a stale selection.
  const rawSelectedRow = rows.find((r) => r.roomType.id === rawSelectedRoomTypeId) ?? null;
  const selectedRow = rawSelectedRow && (!hasDates || rawSelectedRow.available) ? rawSelectedRow : null;
  const selectedRoomTypeId = selectedRow?.roomType.id ?? null;
  const selectedTotal = selectedRow
    ? hasDates
      ? selectedRow.roomType.pricePerNight * nights
      : selectedRow.roomType.pricePerNight
    : null;

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

  // Wayfarer books one room type per reservation, so picking a row clears any other pick
  // rather than adding to a cart (Booking.com's per-row quantity + running total).
  function toggleRoomType(roomTypeId: string, select: boolean) {
    setSelectedRoomTypeId(select ? roomTypeId : null);
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
          className="flex flex-1 items-center gap-2.5 rounded-lg border border-hairline px-4 py-3 text-left text-ink"
        >
          <CalendarIcon />
          <span>
            <span className="block text-xs font-semibold uppercase text-muted">Select dates</span>
            <span className="block text-sm text-ink">
              {dateRange.checkIn && dateRange.checkOut
                ? `${format(dateRange.checkIn, "EEE d MMM")} — ${format(dateRange.checkOut, "EEE d MMM")}`
                : "Add dates"}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
          className="flex flex-1 items-center gap-2.5 rounded-lg border border-hairline px-4 py-3 text-left text-ink"
        >
          <PersonIcon />
          <span>
            <span className="block text-xs font-semibold uppercase text-muted">Select occupancy</span>
            <span className="block text-sm text-ink">{occupancySummary(guests)}</span>
          </span>
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

      {/* Desktop: Booking.com-style table with a sticky "I'll reserve" panel */}
      <div className="mt-6 hidden gap-4 lg:grid lg:grid-cols-[1fr_240px]">
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-ink text-left text-canvas">
                <th className="w-2/5 py-3 pl-4 pr-4 font-semibold">Room type</th>
                <th className="py-3 pr-4 font-semibold">
                  {hasDates ? `Price for ${nights} night${nights === 1 ? "" : "s"}` : "Price per night"}
                </th>
                <th className="py-3 pr-4 font-semibold">Your choices</th>
                <th className="py-3 pr-4 font-semibold">Select rooms</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ roomType, remaining, available }) => {
                const preview = hasDates ? stayDiscountPreview(roomType.pricePerNight, nights) : null;
                const total = hasDates ? roomType.pricePerNight * nights : roomType.pricePerNight;
                const isSelected = selectedRoomTypeId === roomType.id;
                const canSelect = !hasDates || available;
                return (
                  <tr key={roomType.id} className="border-b border-hairline-soft align-top last:border-b-0">
                    <td className="py-4 pl-4 pr-4">
                      <p className="font-semibold text-ink">{roomType.name}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-muted">
                        <PersonIcon small /> Sleeps: {roomType.maxGuests} guest{roomType.maxGuests === 1 ? "" : "s"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <FacilityTag icon={<BedIcon />} label={roomType.bedConfiguration} />
                        {roomType.sizeSqm ? (
                          <FacilityTag icon={<SizeIcon />} label={`${roomType.sizeSqm} m²`} />
                        ) : null}
                        {roomType.amenities.map((amenity) => (
                          <FacilityTag key={amenity} icon={<AmenityIcon />} label={amenity} />
                        ))}
                      </div>
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
                      {hasDates && available && remaining <= 5 ? (
                        <p className="mt-1.5 flex items-center gap-1.5 font-medium text-brand">
                          <ScarcityDot /> We have {remaining} left
                        </p>
                      ) : null}
                      {hasDates && !available ? (
                        <p className="mt-1.5 font-medium text-muted">No availability</p>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4">
                      <select
                        value={isSelected ? "1" : "0"}
                        onChange={(event) => toggleRoomType(roomType.id, event.target.value === "1")}
                        disabled={!canSelect}
                        aria-label={`Rooms for ${roomType.name}`}
                        className="w-full rounded-sm border border-hairline px-2 py-1.5 text-sm text-ink disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted"
                      >
                        <option value="0">0</option>
                        <option value="1">1</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="sticky top-24 h-fit rounded-lg border border-hairline bg-canvas p-4 shadow-card">
          <button
            type="button"
            onClick={() => selectedRoomTypeId && reserve(selectedRoomTypeId)}
            disabled={!selectedRoomTypeId}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted"
          >
            I&apos;ll reserve
          </button>
          <ul className="mt-3 space-y-1 text-xs text-muted">
            <li>It only takes 2 minutes</li>
            <li>You won&apos;t be charged yet</li>
          </ul>
        </div>
      </div>

      {/* Mobile: Booking.com app-style swipeable room cards */}
      <div className="mt-6 lg:hidden">
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rows.map(({ roomType, remaining, available }) => {
            const preview = hasDates ? stayDiscountPreview(roomType.pricePerNight, nights) : null;
            const total = hasDates ? roomType.pricePerNight * nights : roomType.pricePerNight;
            const isSelected = selectedRoomTypeId === roomType.id;
            const canSelect = !hasDates || available;
            const image = roomType.images[0] ?? propertyImage;
            return (
              <div
                key={roomType.id}
                className={`w-[85%] max-w-[320px] shrink-0 snap-start rounded-xl border p-4 ${
                  isSelected ? "border-brand ring-1 ring-brand" : "border-hairline"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{roomType.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      <PersonIcon small /> Sleeps {roomType.maxGuests} guest{roomType.maxGuests === 1 ? "" : "s"}
                    </p>
                  </div>
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={roomType.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                  ) : null}
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <FacilityTag icon={<BedIcon />} label={roomType.bedConfiguration} />
                  {roomType.sizeSqm ? <FacilityTag icon={<SizeIcon />} label={`${roomType.sizeSqm} m²`} /> : null}
                  {roomType.amenities.slice(0, 3).map((amenity) => (
                    <FacilityTag key={amenity} icon={<AmenityIcon />} label={amenity} />
                  ))}
                </div>

                <div className="mt-3 rounded-lg border border-hairline-soft p-3">
                  <p className="flex items-center gap-1.5 text-xs text-green-700">
                    <CheckIcon />
                    {roomType.freeCancellation
                      ? hasDates
                        ? `Free cancellation before ${format(dateRange.checkIn!, "d MMM")}`
                        : "Free cancellation"
                      : "Non-refundable"}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-green-700">
                    <CheckIcon /> No prepayment needed
                  </p>
                  <div className="mt-2 border-t border-hairline-soft pt-2">
                    <p className="text-xs text-muted">
                      {hasDates ? `Price for ${nights} night${nights === 1 ? "" : "s"}` : "Price per night"}
                    </p>
                    {preview ? (
                      <p className="mt-0.5 flex items-center gap-2">
                        <span className="text-lg font-semibold text-ink">{formatPrice(preview.discounted)}</span>
                        <span className="rounded bg-green-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                          {preview.percentOff}% off
                        </span>
                      </p>
                    ) : (
                      <p className="mt-0.5 text-lg font-semibold text-ink">{formatPrice(total)}</p>
                    )}
                    <p className="text-xs text-muted">Includes taxes and charges</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleRoomType(roomType.id, !isSelected)}
                    disabled={!canSelect}
                    className={`mt-3 w-full rounded-lg px-4 py-2 text-sm font-semibold transition-transform duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted ${
                      isSelected
                        ? "border border-brand bg-brand/10 text-brand"
                        : "bg-primary text-on-primary hover:bg-primary-active"
                    }`}
                  >
                    {isSelected ? "Selected · Remove" : "Select room"}
                  </button>
                </div>

                {hasDates && available && remaining <= 5 ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand">
                    <ScarcityDot /> We have {remaining} left
                  </p>
                ) : null}
                {hasDates && !available ? (
                  <p className="mt-2 text-xs font-medium text-muted">No availability</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile sticky action bar: a plain "from" price until a room is picked, then the real total */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-canvas shadow-card lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {selectedRoomTypeId && selectedTotal !== null ? (
          <>
            <p className="bg-brand/10 py-1.5 text-center text-xs font-medium text-brand">
              It only takes 2 minutes
            </p>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-base font-semibold text-ink">{formatPrice(selectedTotal)}</p>
                <p className="text-xs text-muted">Includes taxes and charges</p>
              </div>
              <button
                type="button"
                onClick={() => reserve(selectedRoomTypeId)}
                className="rounded-sm bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98]"
              >
                Reserve
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="text-sm text-ink">
              {showFromPrice ? "From " : ""}
              <span className="text-base font-semibold">{formatPrice(fromPrice)}</span> night
            </p>
            <a
              href="#availability"
              className="rounded-sm bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98]"
            >
              Reserve
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function FacilityTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-hairline px-1.5 py-0.5 text-xs text-body">
      {icon}
      {label}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 shrink-0 fill-none stroke-green-700 stroke-2">
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScarcityDot() {
  return <span aria-hidden className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />;
}

function AmenityIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3 shrink-0 fill-none stroke-current stroke-2">
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-3 w-3 shrink-0 fill-none stroke-current stroke-[1.5]">
      <path
        d="M3 18v-6a2 2 0 012-2h4a2 2 0 012 2v1M21 18v-4a2 2 0 00-2-2h-6M3 18h18M3 13h18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SizeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-3 w-3 shrink-0 fill-none stroke-current stroke-[1.5]">
      <path d="M4 20L20 4M4 20v-5M4 20h5M20 4v5M20 4h-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0 fill-none stroke-current stroke-[1.5]">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function PersonIcon({ small }: { small?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`${small ? "h-3 w-3" : "h-5 w-5"} shrink-0 fill-none stroke-current stroke-[1.5]`}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
