import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateShort, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { SuccessCheck } from "@/components/motion/success-check";
import { guestsSummaryLabel } from "@/lib/guests";

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

  return (
    <div className="mx-auto max-w-[640px] px-4 py-16 text-center sm:px-8">
      <SuccessCheck />
      <h1 className="mt-6 text-[22px] font-medium text-ink">Booking confirmed</h1>
      <p className="mt-2 text-base text-muted">
        Confirmation code <span className="font-semibold text-ink">{booking.confirmationCode}</span>
      </p>

      <div className="mt-8 rounded-md border border-hairline p-6 text-left">
        <p className="text-base font-semibold text-ink">{booking.property.name}</p>
        <p className="mt-1 text-sm text-muted">
          {booking.property.city}, {booking.property.country}
        </p>
        <div className="mt-4 flex justify-between text-sm text-ink">
          <span>Dates</span>
          <span>
            {formatDateShort(booking.checkIn)} – {formatDateShort(booking.checkOut)}
          </span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-ink">
          <span>Guests</span>
          <span>{guestsSummaryLabel(booking)}</span>
        </div>
        <div className="mt-4 flex justify-between border-t border-hairline-soft pt-4 text-base font-semibold text-ink">
          <span>Total paid</span>
          <span>{formatPrice(booking.totalPrice)}</span>
        </div>
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
