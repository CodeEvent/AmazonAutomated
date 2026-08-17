import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validation";
import { computeBookingTotals } from "@/lib/pricing";
import { formatDateShort, formatPrice, nightsBetween } from "@/lib/format";
import { confirmBookingAction } from "@/lib/actions/booking-actions";

type BookPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const session = await auth();

  const property = await prisma.property.findUnique({ where: { slug } });
  if (!property) {
    notFound();
  }

  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const parsed = bookingSchema.safeParse({
    propertyId: property.id,
    checkIn: first(query.checkIn),
    checkOut: first(query.checkOut),
    guests: first(query.guests) ?? "1",
  });

  if (!session?.user?.id) {
    const callbackUrl = `/property/${slug}/book?${new URLSearchParams(
      Object.entries(query).map(([k, v]) => [k, first(v) ?? ""]),
    ).toString()}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (!parsed.success) {
    redirect(`/property/${slug}?${new URLSearchParams(
      Object.entries(query).map(([k, v]) => [k, first(v) ?? ""]),
    ).toString()}`);
  }

  const checkIn = new Date(parsed.data.checkIn);
  const checkOut = new Date(parsed.data.checkOut);
  const nights = nightsBetween(checkIn, checkOut);
  const { subtotal, cleaningFee, serviceFee, total } = computeBookingTotals(
    property.pricePerNight,
    nights,
  );

  return (
    <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-8">
      <h1 className="text-[22px] font-medium text-ink">Confirm and pay</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div>
          <div className="rounded-md border border-hairline p-4">
            <p className="text-base font-semibold text-ink">{property.name}</p>
            <p className="mt-1 text-sm text-muted">
              {property.city}, {property.country}
            </p>
          </div>

          <div className="mt-6 border-b border-hairline-soft pb-6">
            <h2 className="text-lg font-semibold text-ink">Your trip</h2>
            <div className="mt-3 flex items-center justify-between text-sm text-ink">
              <span>Dates</span>
              <span>
                {formatDateShort(checkIn)} – {formatDateShort(checkOut)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-ink">
              <span>Guests</span>
              <span>
                {parsed.data.guests} guest{parsed.data.guests === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <form action={confirmBookingAction} className="mt-6">
            <input type="hidden" name="propertyId" value={property.id} />
            <input type="hidden" name="checkIn" value={parsed.data.checkIn} />
            <input type="hidden" name="checkOut" value={parsed.data.checkOut} />
            <input type="hidden" name="guests" value={parsed.data.guests} />
            <button
              type="submit"
              className="w-full rounded-sm bg-primary py-3 text-base font-medium text-on-primary hover:bg-primary-active"
            >
              Confirm and book
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              This is a demo checkout — no real payment is processed.
            </p>
          </form>
        </div>

        <div className="rounded-md border border-hairline p-6">
          <h2 className="text-lg font-semibold text-ink">Price details</h2>
          <div className="mt-4 space-y-3 text-sm text-ink">
            <div className="flex justify-between">
              <span>
                {formatPrice(property.pricePerNight)} × {nights} night{nights === 1 ? "" : "s"}
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cleaning fee</span>
              <span>{formatPrice(cleaningFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>{formatPrice(serviceFee)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-hairline-soft pt-4 text-base font-semibold text-ink">
            <span>Total (USD)</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
