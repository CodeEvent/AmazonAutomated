import "server-only";
import { prisma } from "@/lib/prisma";

export type PromoValidationResult =
  | { valid: true; promoCodeId: string; discountCents: number; description: string | null }
  | { valid: false; error: string };

/**
 * Validates a promo code against a real stay (subtotal + nights) and returns
 * the discount it earns. Re-run server-side at both preview time (checkout's
 * "Apply" button) and booking-confirmation time — never trust a client-
 * supplied discount amount.
 */
export async function validatePromoCode(
  rawCode: string,
  subtotalCents: number,
  nights: number,
): Promise<PromoValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, error: "Enter a promo code" };

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) {
    return { valid: false, error: "Invalid promo code" };
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { valid: false, error: "This code has expired" };
  }
  if (promo.maxRedemptions != null && promo.redemptionCount >= promo.maxRedemptions) {
    return { valid: false, error: "This code has reached its usage limit" };
  }
  if (promo.minNights != null && nights < promo.minNights) {
    return {
      valid: false,
      error: `Requires a stay of at least ${promo.minNights} night${promo.minNights === 1 ? "" : "s"}`,
    };
  }

  const discountCents =
    promo.discountType === "PERCENT"
      ? Math.round(subtotalCents * (promo.discountValue / 100))
      : Math.min(promo.discountValue, subtotalCents);

  return { valid: true, promoCodeId: promo.id, discountCents, description: promo.description };
}
