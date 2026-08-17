"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validation";
import { computeBookingTotals, generateConfirmationCode } from "@/lib/pricing";
import { nightsBetween } from "@/lib/format";

export async function confirmBookingAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = bookingSchema.parse({
    propertyId: formData.get("propertyId"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    guests: formData.get("guests"),
  });

  const property = await prisma.property.findUnique({ where: { id: parsed.propertyId } });
  if (!property) {
    throw new Error("Property not found");
  }

  const checkIn = new Date(parsed.checkIn);
  const checkOut = new Date(parsed.checkOut);
  const nights = nightsBetween(checkIn, checkOut);
  const { cleaningFee, serviceFee, total } = computeBookingTotals(property.pricePerNight, nights);

  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      propertyId: property.id,
      checkIn,
      checkOut,
      guests: parsed.guests,
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
