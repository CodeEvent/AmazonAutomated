import { PropertyType } from "@/generated/prisma/client";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  HOTEL: "Hotels",
  APARTMENT: "Apartments",
  VILLA: "Villas",
  RESORT: "Resorts",
  GUEST_HOUSE: "Guest houses",
  HOSTEL: "Hostels",
  CABIN: "Cabins",
};
