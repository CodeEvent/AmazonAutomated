"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { adminPropertySchema, adminRoomTypeSchema } from "@/lib/validation";

export type AdminActionState = { error: string } | null;

function propertyFieldsFromForm(formData: FormData) {
  return {
    slug: formData.get("slug"),
    name: formData.get("name"),
    type: formData.get("type"),
    description: formData.get("description"),
    city: formData.get("city"),
    country: formData.get("country"),
    address: formData.get("address"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    pricePerNightDollars: formData.get("pricePerNightDollars"),
    maxGuests: formData.get("maxGuests"),
    bedrooms: formData.get("bedrooms"),
    beds: formData.get("beds"),
    bathrooms: formData.get("bathrooms"),
    amenities: formData.get("amenities"),
    unavailableAmenities: formData.get("unavailableAmenities"),
    images: formData.get("images"),
    ratingAverage: formData.get("ratingAverage"),
    reviewCount: formData.get("reviewCount"),
    hostId: formData.get("hostId"),
  };
}

export async function createPropertyAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = adminPropertySchema.safeParse(propertyFieldsFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { pricePerNightDollars, ...data } = parsed.data;

  const existing = await prisma.property.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { error: "That slug is already in use" };
  }

  const property = await prisma.property.create({
    data: { ...data, pricePerNight: Math.round(pricePerNightDollars * 100) },
  });

  revalidatePath("/admin/properties");
  revalidatePath("/");
  revalidatePath("/search");
  redirect(`/admin/properties/${property.id}`);
}

export async function updatePropertyAction(
  propertyId: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = adminPropertySchema.safeParse(propertyFieldsFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { pricePerNightDollars, ...data } = parsed.data;

  const existing = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!existing) {
    return { error: "Property not found" };
  }
  if (data.slug !== existing.slug) {
    const slugTaken = await prisma.property.findUnique({ where: { slug: data.slug } });
    if (slugTaken) {
      return { error: "That slug is already in use" };
    }
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: { ...data, pricePerNight: Math.round(pricePerNightDollars * 100) },
  });

  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath(`/property/${existing.slug}`);
  if (data.slug !== existing.slug) revalidatePath(`/property/${data.slug}`);
  revalidatePath("/");
  revalidatePath("/search");
  return null;
}

export async function deletePropertyAction(propertyId: string): Promise<AdminActionState> {
  await requireAdmin();

  const existing = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!existing) {
    return { error: "Property not found" };
  }

  try {
    await prisma.property.delete({ where: { id: propertyId } });
  } catch {
    return { error: "Couldn't delete this property. Try again." };
  }

  revalidatePath("/admin/properties");
  revalidatePath("/");
  revalidatePath("/search");
  redirect("/admin/properties");
}

function roomTypeFieldsFromForm(formData: FormData) {
  return {
    name: formData.get("name"),
    description: formData.get("description"),
    maxGuests: formData.get("maxGuests"),
    bedConfiguration: formData.get("bedConfiguration"),
    sizeSqm: formData.get("sizeSqm"),
    pricePerNightDollars: formData.get("pricePerNightDollars"),
    quantity: formData.get("quantity"),
    amenities: formData.get("amenities"),
    freeCancellation: formData.get("freeCancellation"),
    images: formData.get("images"),
    breakfastPricePerNightDollars: formData.get("breakfastPricePerNightDollars"),
  };
}

export async function createRoomTypeAction(
  propertyId: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = adminRoomTypeSchema.safeParse(roomTypeFieldsFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { pricePerNightDollars, breakfastPricePerNightDollars, ...data } = parsed.data;

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    return { error: "Property not found" };
  }

  try {
    await prisma.roomType.create({
      data: {
        ...data,
        propertyId,
        pricePerNight: Math.round(pricePerNightDollars * 100),
        breakfastPricePerNight:
          breakfastPricePerNightDollars != null ? Math.round(breakfastPricePerNightDollars * 100) : null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "This property already has a room type with that name" };
    }
    throw error;
  }

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath(`/property/${property.slug}`);
  redirect(`/admin/properties/${propertyId}`);
}

export async function updateRoomTypeAction(
  propertyId: string,
  roomTypeId: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = adminRoomTypeSchema.safeParse(roomTypeFieldsFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { pricePerNightDollars, breakfastPricePerNightDollars, ...data } = parsed.data;

  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: { property: true },
  });
  if (!roomType || roomType.propertyId !== propertyId) {
    return { error: "Room type not found" };
  }

  try {
    await prisma.roomType.update({
      where: { id: roomTypeId },
      data: {
        ...data,
        pricePerNight: Math.round(pricePerNightDollars * 100),
        breakfastPricePerNight:
          breakfastPricePerNightDollars != null ? Math.round(breakfastPricePerNightDollars * 100) : null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "This property already has a room type with that name" };
    }
    throw error;
  }

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath(`/admin/properties/${propertyId}/room-types/${roomTypeId}`);
  revalidatePath(`/property/${roomType.property.slug}`);
  redirect(`/admin/properties/${propertyId}`);
}

export async function deleteRoomTypeAction(
  propertyId: string,
  roomTypeId: string,
): Promise<AdminActionState> {
  await requireAdmin();

  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: { property: true },
  });
  if (!roomType || roomType.propertyId !== propertyId) {
    return { error: "Room type not found" };
  }

  try {
    await prisma.roomType.delete({ where: { id: roomTypeId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { error: "Can't delete — this room type has existing bookings." };
    }
    throw error;
  }

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath(`/property/${roomType.property.slug}`);
  return null;
}
