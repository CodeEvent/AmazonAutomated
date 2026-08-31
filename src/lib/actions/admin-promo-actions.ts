"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { adminPromoCodeSchema } from "@/lib/validation";
import type { AdminActionState } from "@/lib/actions/admin-property-actions";

function promoFieldsFromForm(formData: FormData) {
  return {
    code: formData.get("code"),
    description: formData.get("description"),
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minNights: formData.get("minNights"),
    maxRedemptions: formData.get("maxRedemptions"),
    active: formData.get("active"),
    expiresAt: formData.get("expiresAt"),
  };
}

function promoDiscountValueCents(discountType: "PERCENT" | "FIXED", discountValue: number): number {
  // PERCENT is stored as a whole percent (e.g. 10 = 10%); FIXED is a dollar
  // amount from the form, converted to cents for storage.
  return discountType === "PERCENT" ? Math.round(discountValue) : Math.round(discountValue * 100);
}

export async function createPromoCodeAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = adminPromoCodeSchema.safeParse(promoFieldsFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { discountType, discountValue, ...data } = parsed.data;

  try {
    await prisma.promoCode.create({
      data: {
        ...data,
        discountType,
        discountValue: promoDiscountValueCents(discountType, discountValue),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That code already exists" };
    }
    throw error;
  }

  revalidatePath("/admin/promo-codes");
  redirect("/admin/promo-codes");
}

export async function updatePromoCodeAction(
  promoCodeId: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = adminPromoCodeSchema.safeParse(promoFieldsFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { discountType, discountValue, ...data } = parsed.data;

  const existing = await prisma.promoCode.findUnique({ where: { id: promoCodeId } });
  if (!existing) {
    return { error: "Promo code not found" };
  }

  try {
    await prisma.promoCode.update({
      where: { id: promoCodeId },
      data: {
        ...data,
        discountType,
        discountValue: promoDiscountValueCents(discountType, discountValue),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That code already exists" };
    }
    throw error;
  }

  revalidatePath("/admin/promo-codes");
  redirect("/admin/promo-codes");
}

export async function deletePromoCodeAction(promoCodeId: string): Promise<AdminActionState> {
  await requireAdmin();

  try {
    await prisma.promoCode.delete({ where: { id: promoCodeId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { error: "Promo code not found" };
    }
    throw error;
  }

  revalidatePath("/admin/promo-codes");
  return null;
}
