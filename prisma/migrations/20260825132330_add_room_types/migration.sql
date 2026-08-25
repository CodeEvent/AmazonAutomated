-- CreateTable
CREATE TABLE "RoomType" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxGuests" INTEGER NOT NULL,
    "bedConfiguration" TEXT NOT NULL,
    "sizeSqm" INTEGER,
    "pricePerNight" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amenities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "freeCancellation" BOOLEAN NOT NULL DEFAULT true,
    "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomType_propertyId_idx" ON "RoomType"("propertyId");

-- AddForeignKey
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one default "Entire place" room type per existing property, priced/sized
-- from that property's own columns, so existing (demo) bookings have something real
-- to point at.
INSERT INTO "RoomType" ("id", "propertyId", "name", "maxGuests", "bedConfiguration", "pricePerNight", "quantity", "freeCancellation", "updatedAt")
SELECT
  substr(md5(random()::text || clock_timestamp()::text || p."id"), 1, 25),
  p."id",
  'Entire place',
  p."maxGuests",
  p."beds" || ' bed' || CASE WHEN p."beds" = 1 THEN '' ELSE 's' END,
  p."pricePerNight",
  1,
  true,
  CURRENT_TIMESTAMP
FROM "Property" p;

-- AlterTable: Booking — add roomTypeId nullable first, backfill, then require it.
ALTER TABLE "Booking" ADD COLUMN "roomTypeId" TEXT;

UPDATE "Booking" b
SET "roomTypeId" = rt."id"
FROM "RoomType" rt
WHERE rt."propertyId" = b."propertyId";

ALTER TABLE "Booking" ALTER COLUMN "roomTypeId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Booking_roomTypeId_idx" ON "Booking"("roomTypeId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
