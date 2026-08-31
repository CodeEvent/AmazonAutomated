"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validation";
import { computeBookingTotals, generateConfirmationCode, breakfastQuote } from "@/lib/pricing";
import { nightsBetween } from "@/lib/format";
import { isRoomTypeAvailable } from "@/lib/availability";
import { validatePromoCode, type PromoValidationResult } from "@/lib/promo";

export async function applyPromoCodeAction(
  code: string,
  roomTypeId: string,
  checkIn: string,
  checkOut: string,
): Promise<PromoValidationResult> {
  const roomType = await prisma.roomType.findUnique({ where: { id: roomTypeId } });
  if (!roomType) return { valid: false, error: "Room type not found" };

  const nights = nightsBetween(new Date(checkIn), new Date(checkOut));
  const subtotal = roomType.pricePerNight * nights;
  return validatePromoCode(code, subtotal, nights);
}

export async function confirmBookingAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = bookingSchema.parse({
    propertyId: formData.get("propertyId"),
    roomTypeId: formData.get("roomTypeId"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    adults: formData.get("adults"),
    children: formData.get("children"),
    infants: formData.get("infants"),
    pets: formData.get("pets"),
    guestMessage: formData.get("guestMessage") ?? "",
    travelInsurance: formData.get("travelInsurance") === "1",
    payInInstallments: formData.get("payInInstallments") === "1",
    paymentMethod: formData.get("paymentMethod") ?? "card",
  });
  const breakfastAdded = formData.get("breakfastAdded") === "1";
  const promoCodeRaw = formData.get("promoCode");
  const promoCode = typeof promoCodeRaw === "string" ? promoCodeRaw.trim() : "";

  const roomType = await prisma.roomType.findUnique({
    where: { id: parsed.roomTypeId },
    include: { property: true },
  });
  if (!roomType || roomType.propertyId !== parsed.propertyId) {
    throw new Error("Room type not found");
  }
  const property = roomType.property;

  const checkIn = new Date(parsed.checkIn);
  const checkOut = new Date(parsed.checkOut);

  const available = await isRoomTypeAvailable(roomType.id, checkIn, checkOut);
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
    redirect(`/property/${property.slug}?${params.toString()}#availability`);
  }

  const nights = nightsBetween(checkIn, checkOut);
  const breakfastFee =
    breakfastAdded && roomType.breakfastPricePerNight
      ? breakfastQuote(roomType.breakfastPricePerNight, nights)
      : 0;

  let promoResult: PromoValidationResult | null = null;
  if (promoCode) {
    promoResult = await validatePromoCode(promoCode, roomType.pricePerNight * nights, nights);
  }
  const promoDiscount = promoResult?.valid ? promoResult.discountCents : 0;
  const promoCodeId = promoResult?.valid ? promoResult.promoCodeId : null;

  const { cleaningFee, serviceFee, insuranceFee, total } = computeBookingTotals(
    roomType.pricePerNight,
    nights,
    parsed.travelInsurance,
    breakfastFee,
    promoDiscount,
  );

  const booking = await prisma.$transaction(async (tx) => {
    if (promoCodeId) {
      await tx.promoCode.update({
        where: { id: promoCodeId },
        data: { redemptionCount: { increment: 1 } },
      });
    }
    return tx.booking.create({
      data: {
        userId: session.user!.id,
        propertyId: property.id,
        roomTypeId: roomType.id,
        checkIn,
        checkOut,
        adults: parsed.adults,
        children: parsed.children,
        infants: parsed.infants,
        pets: parsed.pets,
        nights,
        nightlyRate: roomType.pricePerNight,
        cleaningFee,
        serviceFee,
        insuranceFee,
        totalPrice: total,
        confirmationCode: generateConfirmationCode(),
        guestMessage: parsed.guestMessage || null,
        travelInsurance: parsed.travelInsurance,
        payInInstallments: parsed.payInInstallments,
        paymentMethod: parsed.paymentMethod,
        breakfastAdded: breakfastFee > 0,
        breakfastFee,
        promoCodeId,
        promoDiscount,
      },
    });
  });

  redirect(`/booking/confirmation/${booking.id}`);
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const bookingId = formData.get("bookingId");
  if (typeof bookingId !== "string" || !bookingId) {
    throw new Error("Missing bookingId");
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== session.user.id) {
    throw new Error("Booking not found");
  }

  if (booking.status === "CONFIRMED" && booking.checkIn > new Date()) {
    await prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
  }

  revalidatePath(`/booking/confirmation/${bookingId}`);
  revalidatePath("/account/bookings");
}
