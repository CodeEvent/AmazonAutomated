"use client";

import { cancelBookingAction } from "@/lib/actions/booking-actions";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  return (
    <form
      action={cancelBookingAction}
      onSubmit={(event) => {
        if (!window.confirm("Cancel this booking? These dates will be released.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <button
        type="submit"
        className="rounded-lg border border-hairline px-4 py-2 text-sm font-semibold text-primary-error-text hover:bg-surface-soft"
      >
        Cancel booking
      </button>
    </form>
  );
}
