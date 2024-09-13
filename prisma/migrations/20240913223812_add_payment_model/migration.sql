/*
  Warnings:

  - You are about to drop the column `lastFourDigits` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `ticketType` on the `Registration` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'WAIVED');

-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "lastFourDigits",
DROP COLUMN "paymentStatus",
DROP COLUMN "ticketType";

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "ticketType" TEXT,
    "lastFourDigits" TEXT,
    "paymentDate" TIMESTAMP(3),
    "amount" DOUBLE PRECISION,
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_registrationId_key" ON "Payment"("registrationId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
