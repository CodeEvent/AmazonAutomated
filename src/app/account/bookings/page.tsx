import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateShort, formatPrice } from "@/lib/format";

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/bookings");
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { property: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-8">
      <h1 className="text-[22px] font-medium text-ink">My bookings</h1>

      {bookings.length === 0 ? (
        <p className="mt-6 text-muted">
          You haven&apos;t booked any stays yet.{" "}
          <Link href="/" className="underline">
            Start exploring
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 divide-y divide-hairline-soft">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/booking/confirmation/${booking.id}`}
              className="flex items-center justify-between gap-4 py-5"
            >
              <div>
                <p className="text-base font-semibold text-ink">{booking.property.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatDateShort(booking.checkIn)} – {formatDateShort(booking.checkOut)} ·{" "}
                  {booking.guests} guest{booking.guests === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-xs text-muted">Confirmation {booking.confirmationCode}</p>
              </div>
              <p className="text-base font-semibold text-ink">{formatPrice(booking.totalPrice)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
