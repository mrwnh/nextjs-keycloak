import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { registrationSchema, RegistrationInput } from "@/lib/schemas";
import { z } from "zod";
import QRCode from 'qrcode';
import { put } from '@vercel/blob';
import { sendConfirmationEmail } from '@/utils/email';

// Add this type declaration at the top of the file
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    }
  }
}

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

    // Generate QR code
    const qrCodeBuffer = await QRCode.toBuffer(`${process.env.NEXTAUTH_URL}/registration/${session.user.id}/view`);

    // Upload QR code to Vercel Blob
    const { url } = await put(`qr-codes/${session.user.id}.png`, qrCodeBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN as string,
    });

    qrCodeUrl = url;

    const registration = await prisma.registration.create({
      data: {
        ...validatedData,
        status: 'pending',
        qrCodeUrl,
        payment: {
          create: {
            status: 'UNPAID',
          },
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