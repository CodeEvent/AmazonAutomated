-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "checkInFrom" TEXT,
ADD COLUMN     "checkInUntil" TEXT,
ADD COLUMN     "checkOutBy" TEXT;

-- AlterTable
ALTER TABLE "RoomType" ADD COLUMN     "turnoverBufferHours" INTEGER NOT NULL DEFAULT 0;
