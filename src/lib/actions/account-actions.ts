"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ActionState = { error?: string; success?: string } | null;

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing && existing.id !== userId) {
    return { error: "That email is already in use" };
  }

  await prisma.user.update({ where: { id: userId }, data: parsed.data });
  revalidatePath("/account");
  revalidatePath("/account/settings");
  return { success: "Profile updated" };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash) {
    return { error: "This account doesn't use a password" };
  }

  const matches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!matches) {
    return { error: "Current password is incorrect" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { success: "Password updated" };
}

export async function updatePrivacyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId();
  await prisma.user.update({
    where: { id: userId },
    data: {
      marketingOptIn: formData.get("marketingOptIn") === "on",
      searchableProfile: formData.get("searchableProfile") === "on",
    },
  });
  revalidatePath("/account/privacy");
  return { success: "Privacy preferences saved" };
}

const coHostSchema = z.object({
  city: z.string().trim().min(1, "City is required").max(100),
  message: z.string().trim().min(10, "Tell us a bit more (at least 10 characters)").max(1000),
});

export async function createCoHostInquiryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = coHostSchema.safeParse({
    city: formData.get("city"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.coHostInquiry.create({
    data: { userId, city: parsed.data.city, message: parsed.data.message },
  });
  revalidatePath("/account/co-host");
  return { success: "Inquiry sent — we'll be in touch about co-hosts in your area." };
}

const giftCardSchema = z.object({
  amount: z.coerce.number().int().min(25).max(2000),
  recipientName: z.string().trim().max(100).default(""),
  recipientEmail: z.string().trim().toLowerCase().max(200).default(""),
  message: z.string().trim().max(300).default(""),
});

function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function purchaseGiftCardAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = giftCardSchema.safeParse({
    amount: formData.get("amount"),
    recipientName: formData.get("recipientName") ?? "",
    recipientEmail: formData.get("recipientEmail") ?? "",
    message: formData.get("message") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const amountCents = parsed.data.amount * 100;
  await prisma.giftCard.create({
    data: {
      code: generateGiftCardCode(),
      amount: amountCents,
      balance: amountCents,
      purchaserId: userId,
      recipientName: parsed.data.recipientName || null,
      recipientEmail: parsed.data.recipientEmail || null,
      message: parsed.data.message || null,
    },
  });
  revalidatePath("/account/gift-cards");
  return { success: "Gift card purchased — this is a demo, no real payment was processed." };
}
