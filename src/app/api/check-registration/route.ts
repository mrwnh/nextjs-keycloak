import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const data = await req.json();

  try {
    const existingRegistration = await prisma.registration.findUnique({
      where: { email: data.email },
    });

    return NextResponse.json({ registration: existingRegistration });
  } catch (error) {
    console.error('Error checking registration:', error);
    return NextResponse.json({ error: 'Failed to check registration' }, { status: 500 });
  }
}