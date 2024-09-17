import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { registrationSchema, RegistrationInput, PaymentStatus, RegistrationStatus } from "@/lib/schemas";
import { z } from "zod";
import QRCode from 'qrcode';
import { put } from '@vercel/blob';
import { sendConfirmationEmail } from '@/utils/email';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const data = await req.json();

  try {
    const validatedData: RegistrationInput = registrationSchema.parse(data);

    let qrCodeUrl = null;

    // Fetch user from database to get the ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate QR code with user ID
    const qrCodeBuffer = await QRCode.toBuffer(`${process.env.NEXTAUTH_URL}/registration/${user.id}/view`);

    // Upload QR code to Vercel Blob using user ID
    const { url } = await put(`qr-codes/${user.id}.png`, qrCodeBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN as string,
    });

    qrCodeUrl = url;

    const registration = await prisma.registration.create({
      data: {
        ...validatedData,
        status: RegistrationStatus.enum.PENDING,
        qrCodeUrl,
        payment: {
          create: {
            status: PaymentStatus.enum.UNPAID,
          }
        },
      },
      include: {
        payment: true,
      },
    });

    // Send confirmation email
    await sendConfirmationEmail(registration.email, registration.firstName);

    return NextResponse.json(registration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid registration data', details: error.errors }, { status: 400 });
    }
    console.error('Error during registration:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}