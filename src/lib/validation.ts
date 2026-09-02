import { z } from "zod";
import { PropertyType } from "@/generated/prisma/client";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const bookingSchema = z
  .object({
    propertyId: z.string().min(1),
    roomTypeId: z.string().min(1),
    checkIn: z.string().min(1, "Select a check-in date"),
    checkOut: z.string().min(1, "Select a check-out date"),
    adults: z.coerce.number().int().min(1).max(32),
    children: z.coerce.number().int().min(0).max(32).default(0),
    infants: z.coerce.number().int().min(0).max(32).default(0),
    pets: z.coerce.number().int().min(0).max(32).default(0),
    guestMessage: z.string().trim().max(1000).default(""),
    travelInsurance: z.coerce.boolean().default(false),
    payInInstallments: z.coerce.boolean().default(false),
    paymentMethod: z.enum(["card", "apple_pay", "paypal"]).default("card"),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

/** Optional "HH:mm" 24-hour time input, blank -> undefined. */
const optionalTime = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm, e.g. 15:00")
    .optional(),
);

/** Splits a comma-separated admin input into a trimmed, non-empty string list. */
const commaList = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

/** Splits a newline-separated admin input (one URL per line) into a string list. */
const lineList = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
  );

export const adminPropertySchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  name: z.string().trim().min(1, "Name is required").max(120),
  type: z.enum(PropertyType),
  description: z.string().trim().min(1, "Description is required"),
  city: z.string().trim().min(1, "City is required"),
  country: z.string().trim().min(1, "Country is required"),
  address: z.string().trim().min(1, "Address is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  pricePerNightDollars: z.coerce.number().positive("Price must be greater than 0"),
  maxGuests: z.coerce.number().int().min(1).max(64),
  bedrooms: z.coerce.number().int().min(0).max(64),
  beds: z.coerce.number().int().min(0).max(64),
  bathrooms: z.coerce.number().int().min(0).max(64),
  amenities: commaList,
  unavailableAmenities: commaList,
  images: lineList.refine((urls) => urls.length > 0, "Add at least one image URL"),
  ratingAverage: z.coerce.number().min(0).max(5).default(0),
  reviewCount: z.coerce.number().int().min(0).default(0),
  hostId: z.string().min(1, "Choose a host"),
  houseRules: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(4000).optional(),
  ),
  checkInFrom: optionalTime,
  checkInUntil: optionalTime,
  checkOutBy: optionalTime,
});

export const adminRoomTypeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(2000).default(""),
  maxGuests: z.coerce.number().int().min(1).max(32),
  bedConfiguration: z.string().trim().min(1, "Bed configuration is required"),
  sizeSqm: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),
  pricePerNightDollars: z.coerce.number().positive("Price must be greater than 0"),
  quantity: z.coerce.number().int().min(1).max(999),
  amenities: commaList,
  freeCancellation: z.coerce.boolean().default(true),
  images: lineList,
  breakfastPricePerNightDollars: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.coerce.number().positive().optional(),
  ),
  turnoverBufferHours: z.coerce.number().int().min(0).max(72).default(0),
});

export const adminBlockedDateSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().trim().max(200).default(""),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const adminPromoCodeSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, "Code must be at least 3 characters")
      .max(32)
      .regex(/^[A-Z0-9]+$/, "Use letters and numbers only"),
    description: z.string().trim().max(200).default(""),
    discountType: z.enum(["PERCENT", "FIXED"]),
    discountValue: z.coerce.number().positive("Must be greater than 0"),
    minNights: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.coerce.number().int().positive().optional(),
    ),
    maxRedemptions: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.coerce.number().int().positive().optional(),
    ),
    active: z.coerce.boolean().default(true),
    expiresAt: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.coerce.date().optional(),
    ),
  })
  .refine((data) => data.discountType !== "PERCENT" || data.discountValue <= 100, {
    message: "A percentage discount can't exceed 100",
    path: ["discountValue"],
  });
