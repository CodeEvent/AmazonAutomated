import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validation";
import { computeBookingTotals } from "@/lib/pricing";
import { formatDateShort, nightsBetween } from "@/lib/format";
import { confirmBookingAction } from "@/lib/actions/booking-actions";
import { isRoomTypeAvailable } from "@/lib/availability";
import { guestsSummaryLabel, parseGuestsFromParams } from "@/lib/guests";
import { isRareFind } from "@/lib/badges";
import { BookingReview } from "@/components/booking/booking-review";

type BookPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const session = await auth();

  const property = await prisma.property.findUnique({ where: { slug }, include: { host: true } });
  if (!property) {
    notFound();
  }

  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const guests = parseGuestsFromParams(query);

  const parsed = bookingSchema.safeParse({
    propertyId: property.id,
    roomTypeId: first(query.roomTypeId),
    checkIn: first(query.checkIn),
    checkOut: first(query.checkOut),
    adults: guests.adults,
    children: guests.children,
    infants: guests.infants,
    pets: guests.pets,
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

  const roomType = await prisma.roomType.findUnique({ where: { id: parsed.data.roomTypeId } });
  if (!roomType || roomType.propertyId !== property.id) {
    notFound();
  }

  const checkIn = new Date(parsed.data.checkIn);
  const checkOut = new Date(parsed.data.checkOut);

  const available = await isRoomTypeAvailable(roomType.id, checkIn, checkOut);
  if (!available) {
    const params2 = new URLSearchParams({
      checkIn: parsed.data.checkIn,
      checkOut: parsed.data.checkOut,
      adults: String(parsed.data.adults),
      children: String(parsed.data.children),
      infants: String(parsed.data.infants),
      pets: String(parsed.data.pets),
      unavailable: "1",
    });
    redirect(`/property/${slug}?${params2.toString()}#availability`);
  }

  const nights = nightsBetween(checkIn, checkOut);
  const { subtotal, longStayDiscount, cleaningFee, serviceFee, total } = computeBookingTotals(
    roomType.pricePerNight,
    nights,
  );
  const rareFind = isRareFind(property.ratingAverage, property.reviewCount);

  return (
    <div className="mx-auto max-w-[1100px] px-0 py-4 sm:px-8 sm:py-10">
      <BookingReview
        action={confirmBookingAction}
        propertySlug={property.slug}
        propertyName={property.name}
        roomTypeName={roomType.name}
        propertyImage={property.images[0]}
        ratingAverage={property.ratingAverage}
        reviewCount={property.reviewCount}
        isSuperhost={property.host.isSuperhost}
        rareFind={rareFind}
        freeCancellation={roomType.freeCancellation}
        hostName={property.host.name}
        checkInLabel={formatDateShort(checkIn)}
        checkOutLabel={formatDateShort(checkOut)}
        guestsLabel={guestsSummaryLabel(parsed.data)}
        propertyId={property.id}
        roomTypeId={roomType.id}
        checkIn={parsed.data.checkIn}
        checkOut={parsed.data.checkOut}
        adults={parsed.data.adults}
        childrenCount={parsed.data.children}
        infants={parsed.data.infants}
        pets={parsed.data.pets}
        nights={nights}
        nightlyRate={roomType.pricePerNight}
        subtotal={subtotal}
        longStayDiscount={longStayDiscount}
        cleaningFee={cleaningFee}
        serviceFee={serviceFee}
        baseTotal={total}
        breakfastPricePerNight={roomType.breakfastPricePerNight}
      />
    </div>
  );
}
