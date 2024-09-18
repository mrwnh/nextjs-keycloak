import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
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
    const existingRegistration = await prisma.registration.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        registrationType: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        company: true,
        designation: true,
        city: true,
        status: true,
        imageUrl: true,
        qrCodeUrl: true,
        createdAt: true,
        payment: {
          select: {
            status: true,
            ticketType: true,
            amount: true,
            currency: true,
            paymentDate: true,
          }
        },
      }
    });

    if (!existingRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ registration: existingRegistration });
  } catch (error) {
    console.error('Error checking registration:', error);
    return NextResponse.json({ error: 'Failed to check registration' }, { status: 500 });
  }
}