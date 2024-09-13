import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
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
    const existingRegistration = await prisma.registration.findUnique({
      where: { email: data.email },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'User already registered' }, { status: 400 });
    }

    const registration = await prisma.registration.create({
      data: {
        ...data,
        status: 'pending',
      },
    });

    // Send confirmation email
    await sendConfirmationEmail(registration.email, registration.firstName);

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}