-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('GUEST', 'ADMIN');

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_bookingId_idx" ON "Message"("bookingId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
