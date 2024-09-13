-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "lastFourDigits" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
ADD COLUMN     "qrCodeUrl" TEXT,
ADD COLUMN     "ticketType" TEXT;

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "registrationId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
