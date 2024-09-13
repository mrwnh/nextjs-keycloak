import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { sendConfirmationEmail } from '@/utils/email';
import { registrationSchema, Registration } from "@/lib/schemas";
import { z } from "zod";
import QRCode from 'qrcode';
import { put } from '@vercel/blob';

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
    const validatedData = registrationSchema.parse(data);
    const existingRegistration = await prisma.registration.findUnique({
      where: { email: validatedData.email },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'User already registered' }, { status: 400 });
    }

    // Remove 'id', 'comments', and 'payment' from validatedData
    const { id, comments, payment, ...registrationData } = validatedData;

    let qrCodeUrl = null;

    // Only generate QR code if status is 'approved'
    if (registrationData.status === 'approved') {
      // Generate QR code
      const qrCodeBuffer = await QRCode.toBuffer(`${process.env.NEXTAUTH_URL}/registration/${id}/view`);

      // Upload QR code to Vercel Blob
      const { url } = await put(`qr-codes/${id}.png`, qrCodeBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN as string,
      });

      qrCodeUrl = url;
    }

    const registration = await prisma.registration.create({
      data: {
        ...registrationData,
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
    if (error instanceof Error) {
      console.error('Error during registration:', error.message);
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
  }
}