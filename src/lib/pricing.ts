const CLEANING_FEE_CENTS = 3500;
const SERVICE_FEE_RATE = 0.12;
const INSURANCE_RATE = 0.048;
const LONG_STAY_DISCOUNT_RATE = 0.0156;
const LONG_STAY_MIN_NIGHTS = 2;

export function hasLongStayDiscount(nights: number): boolean {
  return nights >= LONG_STAY_MIN_NIGHTS;
}

export function computeBookingTotals(
  nightlyRateCents: number,
  nights: number,
  travelInsurance = false,
) {
  const subtotal = nightlyRateCents * nights;
  const longStayDiscount = hasLongStayDiscount(nights)
    ? Math.round(subtotal * LONG_STAY_DISCOUNT_RATE)
    : 0;
  const cleaningFee = CLEANING_FEE_CENTS;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const insuranceFee = travelInsurance ? Math.round(subtotal * INSURANCE_RATE) : 0;
  const total = subtotal - longStayDiscount + cleaningFee + serviceFee + insuranceFee;

  return { subtotal, longStayDiscount, cleaningFee, serviceFee, insuranceFee, total };
}

export function insuranceQuote(nightlyRateCents: number, nights: number): number {
  return Math.round(nightlyRateCents * nights * INSURANCE_RATE);
}

export function generateConfirmationCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
