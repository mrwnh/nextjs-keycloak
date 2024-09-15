import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const CreatePaymentRequestSchema = z.object({
  registrationId: z.string(),
  ticketType: z.enum(['FULL', 'FREE', 'VVIP', 'VIP', 'PASS', 'ONE_DAY', 'TWO_DAY']),
});

const ticketConfig = {
  FULL: { amount: 300, currency: 'EUR' },
  TWO_DAY: { amount: 200, currency: 'EUR' },
  ONE_DAY: { amount: 100, currency: 'EUR' },
  FREE: { amount: 0, currency: 'EUR' },
  VVIP: { amount: 500, currency: 'EUR' },
  VIP: { amount: 400, currency: 'EUR' },
  PASS: { amount: 150, currency: 'EUR' },
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { registrationId, ticketType } = CreatePaymentRequestSchema.parse(body);

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { payment: true },
    });

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Registration is not approved' }, { status: 400 });
    }

    if (registration.payment) {
      return NextResponse.json({ error: 'Payment request already exists' }, { status: 400 });
    }

    const ticketInfo = ticketConfig[ticketType];

    const payment = await prisma.payment.create({
      data: {
        status: 'UNPAID',
        ticketType: ticketType,
        amount: ticketInfo.amount,
        currency: ticketInfo.currency,
        registration: { connect: { id: registrationId } },
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: unknown) {
    console.error('Error creating payment request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create payment request', details: errorMessage }, { status: 500 });
  }
}