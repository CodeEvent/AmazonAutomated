const CLEANING_FEE_CENTS = 3500;
const SERVICE_FEE_RATE = 0.12;

export function computeBookingTotals(nightlyRateCents: number, nights: number) {
  const subtotal = nightlyRateCents * nights;
  const cleaningFee = CLEANING_FEE_CENTS;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + cleaningFee + serviceFee;

  return { subtotal, cleaningFee, serviceFee, total };
}

export function generateConfirmationCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
