"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { adminBlockedDateSchema } from "@/lib/validation";
import type { AdminActionState } from "@/lib/actions/admin-property-actions";

export async function createBlockedDateAction(
  propertyId: string,
  roomTypeId: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = adminBlockedDateSchema.safeParse({
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: { property: { select: { slug: true } } },
  });
  if (!roomType || roomType.propertyId !== propertyId) {
    return { error: "Room type not found" };
  }

  await prisma.blockedDate.create({
    data: {
      roomTypeId,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      reason: parsed.data.reason || null,
    },
  });

  revalidatePath(`/admin/properties/${propertyId}/room-types/${roomTypeId}/calendar`);
  revalidatePath(`/property/${roomType.property.slug}`);
  return null;
}

export async function deleteBlockedDateAction(
  propertyId: string,
  roomTypeId: string,
  blockedDateId: string,
): Promise<AdminActionState> {
  await requireAdmin();

  const blocked = await prisma.blockedDate.findUnique({
    where: { id: blockedDateId },
    include: { roomType: { include: { property: { select: { slug: true } } } } },
  });
  if (!blocked || blocked.roomTypeId !== roomTypeId || blocked.roomType.propertyId !== propertyId) {
    return { error: "Blocked range not found" };
  }

  await prisma.blockedDate.delete({ where: { id: blockedDateId } });

  revalidatePath(`/admin/properties/${propertyId}/room-types/${roomTypeId}/calendar`);
  revalidatePath(`/property/${blocked.roomType.property.slug}`);
  return null;
}
