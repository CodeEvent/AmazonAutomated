const CLEANING_FEE_CENTS = 3500;
const SERVICE_FEE_RATE = 0.12;
const INSURANCE_RATE = 0.048;

export function computeBookingTotals(
  nightlyRateCents: number,
  nights: number,
  travelInsurance = false,
) {
  const subtotal = nightlyRateCents * nights;
  const cleaningFee = CLEANING_FEE_CENTS;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const insuranceFee = travelInsurance ? Math.round(subtotal * INSURANCE_RATE) : 0;
  const total = subtotal + cleaningFee + serviceFee + insuranceFee;

  return { subtotal, cleaningFee, serviceFee, insuranceFee, total };
}

export function insuranceQuote(nightlyRateCents: number, nights: number): number {
  return Math.round(nightlyRateCents * nights * INSURANCE_RATE);
}

export function generateConfirmationCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
