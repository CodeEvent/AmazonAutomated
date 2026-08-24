import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateShort, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { SuccessCheck } from "@/components/motion/success-check";
import { guestsSummaryLabel } from "@/lib/guests";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Credit or debit card",
  apple_pay: "Apple Pay",
  paypal: "PayPal",
};

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/booking/confirmation/${id}`)}`);
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { property: true },
  });

  if (!booking || booking.userId !== session.user.id) {
    notFound();
  }

  const isCancelled = booking.status === "CANCELLED";
  const canCancel = !isCancelled && booking.checkIn > new Date();
  const subtotal = booking.nightlyRate * booking.nights;

  return (
    <div className="mx-auto max-w-[640px] px-4 py-16 text-center sm:px-8">
      {isCancelled ? (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-soft">
          <XIcon />
        </div>
      ) : (
        <SuccessCheck />
      )}
      <h1 className="mt-6 text-[22px] font-medium text-ink">
        {isCancelled ? "Booking cancelled" : "Booking confirmed"}
      </h1>
      <p className="mt-2 text-base text-muted">
        Confirmation code <span className="font-semibold text-ink">{booking.confirmationCode}</span>
      </p>

      <div className="mt-8 rounded-md border border-hairline p-6 text-left">
        <div className="flex items-start gap-3">
          {booking.property.images[0] ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={booking.property.images[0]}
                alt={booking.property.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : null}
          <div>
            <p className="text-base font-semibold text-ink">{booking.property.name}</p>
            <p className="mt-1 text-sm text-muted">
              {booking.property.city}, {booking.property.country}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-between border-t border-hairline-soft pt-4 text-sm text-ink">
          <span>Dates</span>
          <span>
            {formatDateShort(booking.checkIn)} – {formatDateShort(booking.checkOut)}
          </span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-ink">
          <span>Guests</span>
          <span>{guestsSummaryLabel(booking)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-ink">
          <span>Payment method</span>
          <span>{PAYMENT_METHOD_LABELS[booking.paymentMethod] ?? booking.paymentMethod}</span>
        </div>
        {booking.payInInstallments ? (
          <div className="mt-2 flex justify-between text-sm text-ink">
            <span>Payment plan</span>
            <span>3 payments of {formatPrice(Math.round(booking.totalPrice / 3))}</span>
          </div>
        ) : null}

        <div className="mt-4 space-y-2 border-t border-hairline-soft pt-4 text-sm text-ink">
          <p className="font-semibold">Price details</p>
          <div className="flex justify-between text-muted">
            <span>
              {formatPrice(booking.nightlyRate)} × {booking.nights} night{booking.nights === 1 ? "" : "s"}
            </span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Cleaning fee</span>
            <span>{formatPrice(booking.cleaningFee)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Service fee</span>
            <span>{formatPrice(booking.serviceFee)}</span>
          </div>
          {booking.travelInsurance ? (
            <div className="flex justify-between text-muted">
              <span>Travel insurance</span>
              <span>{formatPrice(booking.insuranceFee)}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex justify-between border-t border-hairline-soft pt-4 text-base font-semibold text-ink">
          <span>{isCancelled ? "Total (not charged)" : "Total paid"}</span>
          <span>{formatPrice(booking.totalPrice)}</span>
        </div>

        {booking.guestMessage ? (
          <div className="mt-4 border-t border-hairline-soft pt-4">
            <p className="text-sm font-semibold text-ink">Your message to the host</p>
            <p className="mt-1 text-sm text-body">{booking.guestMessage}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-md border border-hairline-soft bg-surface-soft/60 p-6 text-left">
        <h2 className="text-base font-semibold text-ink">Manage your booking</h2>
        {isCancelled ? (
          <p className="mt-2 text-sm text-muted">
            This booking was cancelled and its dates have been released.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              This reservation is non-refundable. Since no real payment is processed in this demo,
              cancelling won&apos;t issue a refund — it simply releases these dates.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {canCancel ? <CancelBookingButton bookingId={booking.id} /> : null}
              <Link
                href={`/property/${booking.property.slug}#reserve`}
                className="rounded-lg border border-hairline px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-soft"
              >
                Contact host
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button href="/account/bookings" variant="secondary">
          View my bookings
        </Button>
        <Button href="/" variant="primary">
          Back to home
        </Button>
      </div>

      <p className="mt-6 text-xs text-muted">
        <Link href={`/property/${booking.property.slug}`} className="underline">
          {booking.property.name}
        </Link>{" "}
        — this is a demo checkout, no real payment was processed.
      </p>
    </div>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7 fill-none stroke-muted stroke-2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
