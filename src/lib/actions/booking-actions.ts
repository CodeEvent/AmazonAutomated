"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validation";
import { computeBookingTotals, generateConfirmationCode } from "@/lib/pricing";
import { nightsBetween } from "@/lib/format";
import { isRangeAvailable } from "@/lib/availability";

export async function confirmBookingAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = bookingSchema.parse({
    propertyId: formData.get("propertyId"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    adults: formData.get("adults"),
    children: formData.get("children"),
    infants: formData.get("infants"),
    pets: formData.get("pets"),
  });

  const property = await prisma.property.findUnique({ where: { id: parsed.propertyId } });
  if (!property) {
    throw new Error("Property not found");
  }

  const checkIn = new Date(parsed.checkIn);
  const checkOut = new Date(parsed.checkOut);

  const available = await isRangeAvailable(property.id, checkIn, checkOut);
  if (!available) {
    const params = new URLSearchParams({
      checkIn: parsed.checkIn,
      checkOut: parsed.checkOut,
      adults: String(parsed.adults),
      children: String(parsed.children),
      infants: String(parsed.infants),
      pets: String(parsed.pets),
      unavailable: "1",
    });
    redirect(`/property/${property.slug}?${params.toString()}#reserve`);
  }

  const nights = nightsBetween(checkIn, checkOut);
  const { cleaningFee, serviceFee, total } = computeBookingTotals(property.pricePerNight, nights);

  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      propertyId: property.id,
      checkIn,
      checkOut,
      adults: parsed.adults,
      children: parsed.children,
      infants: parsed.infants,
      pets: parsed.pets,
      nights,
      nightlyRate: property.pricePerNight,
      cleaningFee,
      serviceFee,
      totalPrice: total,
      confirmationCode: generateConfirmationCode(),
    },
  });

  redirect(`/booking/confirmation/${booking.id}`);
}
