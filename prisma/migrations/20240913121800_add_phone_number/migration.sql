/*
  Warnings:

  - You are about to drop the column `mobileNumber` on the `Registration` table. All the data in the column will be lost.
  - Added the required column `phoneNumber` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Registration" ADD COLUMN "phoneNumber" TEXT;

-- Update existing rows
UPDATE "Registration" SET "phoneNumber" = '' WHERE "phoneNumber" IS NULL;

-- Make phoneNumber required
ALTER TABLE "Registration" ALTER COLUMN "phoneNumber" SET NOT NULL;

-- Drop the mobileNumber column
ALTER TABLE "Registration" DROP COLUMN "mobileNumber";
