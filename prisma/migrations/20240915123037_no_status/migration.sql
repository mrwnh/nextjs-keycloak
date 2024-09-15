/*
  Warnings:

  - You are about to drop the `RegistrationStatusHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StatusHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RegistrationStatusHistory" DROP CONSTRAINT "RegistrationStatusHistory_registrationId_fkey";

-- DropForeignKey
ALTER TABLE "StatusHistory" DROP CONSTRAINT "StatusHistory_registrationId_fkey";

-- DropTable
DROP TABLE "RegistrationStatusHistory";

-- DropTable
DROP TABLE "StatusHistory";
