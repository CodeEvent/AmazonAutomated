-- This app has no real customer data yet (demo/seed data only), so this
-- migration clears Property (and its cascaded Booking/Review rows) rather
-- than attempting a backfill onto a Host table that doesn't exist yet.
-- `prisma/seed.ts` repopulates everything, including Host records, right
-- after this runs (see the `vercel-build` script).

-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "bio" TEXT,
    "education" TEXT,
    "work" TEXT,
    "isSuperhost" BOOLEAN NOT NULL DEFAULT false,
    "yearsHosting" INTEGER NOT NULL DEFAULT 1,
    "responseRatePercent" INTEGER NOT NULL DEFAULT 95,
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "purchaserId" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoHostInquiry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoHostInquiry_pkey" PRIMARY KEY ("id")
);

-- Clear demo/seed Property data (cascades to Booking, Review) so hostId can
-- be added as NOT NULL without a backfill.
DELETE FROM "Property";

-- AlterTable: Property
ALTER TABLE "Property"
  DROP COLUMN "hostName",
  DROP COLUMN "hostImage",
  ADD COLUMN "hostId" TEXT NOT NULL,
  ADD COLUMN "unavailableAmenities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- AlterTable: Booking
ALTER TABLE "Booking"
  ADD COLUMN "insuranceFee" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "guestMessage" TEXT,
  ADD COLUMN "travelInsurance" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "payInInstallments" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'card';

-- AlterTable: User
ALTER TABLE "User"
  ADD COLUMN "referralCode" TEXT,
  ADD COLUMN "marketingOptIn" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "searchableProfile" BOOLEAN NOT NULL DEFAULT true;

-- Backfill referralCode for any existing users, then make it required.
UPDATE "User"
SET "referralCode" = substr(md5(random()::text || clock_timestamp()::text || "id"), 1, 20)
WHERE "referralCode" IS NULL;

ALTER TABLE "User" ALTER COLUMN "referralCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Host_slug_key" ON "Host"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_purchaserId_idx" ON "GiftCard"("purchaserId");

-- CreateIndex
CREATE INDEX "CoHostInquiry_userId_idx" ON "CoHostInquiry"("userId");

-- CreateIndex
CREATE INDEX "Property_hostId_idx" ON "Property"("hostId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoHostInquiry" ADD CONSTRAINT "CoHostInquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
