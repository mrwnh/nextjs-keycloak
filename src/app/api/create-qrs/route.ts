import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import { put } from '@vercel/blob';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Fetch all registrations
    const registrations = await prisma.registration.findMany();

    let updatedCount = 0;

    for (const registration of registrations) {
      // Generate new QR code using registration ID
      const qrCodeBuffer = await QRCode.toBuffer(`${process.env.NEXTAUTH_URL}/registration/${registration.id}/view`);

      // Upload QR code to Vercel Blob
      const { url } = await put(`qr-codes/${registration.id}.png`, qrCodeBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN as string,
      });

      // Update registration with new QR code URL
      await prisma.registration.update({
        where: { id: registration.id },
        data: { qrCodeUrl: url }
      });

      updatedCount++;
    }

    return NextResponse.json({ message: `Updated ${updatedCount} QR codes` });
  } catch (error) {
    console.error('Error regenerating QR codes:', error);
    return NextResponse.json({ error: 'Failed to regenerate QR codes' }, { status: 500 });
  }
}