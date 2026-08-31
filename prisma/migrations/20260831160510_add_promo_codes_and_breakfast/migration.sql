-- CreateEnum
CREATE TYPE "PromoDiscountType" AS ENUM ('PERCENT', 'FIXED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "breakfastAdded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "breakfastFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promoCodeId" TEXT,
ADD COLUMN     "promoDiscount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "RoomType" ADD COLUMN     "breakfastPricePerNight" INTEGER;

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "PromoDiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "minNights" INTEGER,
    "maxRedemptions" INTEGER,
    "redemptionCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "Booking_promoCodeId_idx" ON "Booking"("promoCodeId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
