import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registrationSchema, RegistrationInput, PaymentStatus, RegistrationStatus } from "@/lib/schemas";
import { z } from "zod";
import QRCode from 'qrcode';
import { put } from '@vercel/blob';
import { sendConfirmationEmail } from '@/utils/email';
import { validateApiKey } from '@/utils/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // Validate API key
  const apiKey = req.headers.get('X-API-Key');
  if (!validateApiKey(apiKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();

  try {
    const validatedData: RegistrationInput = registrationSchema.parse(data);

    let qrCodeUrl = null;

    // Create a new user (assuming external registrations always create new users)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        role: 'MEMBER',
      },
    });

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