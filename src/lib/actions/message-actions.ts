"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";

export type MessageActionState = { error: string } | null;

function bodyFromForm(formData: FormData): string | null {
  const raw = formData.get("body");
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2000) return null;
  return trimmed;
}

/** Guest sends a message on their own booking. */
export async function sendGuestMessageAction(
  bookingId: string,
  _prevState: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You need to be signed in to send a message." };
  }

  const body = bodyFromForm(formData);
  if (!body) {
    return { error: "Write a message before sending." };
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== session.user.id) {
    return { error: "Booking not found." };
  }

  await prisma.message.create({ data: { bookingId, sender: "GUEST", body } });

  revalidatePath(`/booking/confirmation/${bookingId}`);
  revalidatePath(`/admin/messages/${bookingId}`);
  revalidatePath("/admin/messages");
  return null;
}

/** Admin replies on behalf of the property (Wayfarer has no separate host login). */
export async function sendAdminMessageAction(
  bookingId: string,
  _prevState: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  await requireAdmin();

  const body = bodyFromForm(formData);
  if (!body) {
    return { error: "Write a message before sending." };
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return { error: "Booking not found." };
  }

  await prisma.message.create({ data: { bookingId, sender: "ADMIN", body } });

  revalidatePath(`/admin/messages/${bookingId}`);
  revalidatePath("/admin/messages");
  revalidatePath(`/booking/confirmation/${bookingId}`);
  return null;
}
