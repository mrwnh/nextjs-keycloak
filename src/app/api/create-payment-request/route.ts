import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient, TicketType } from '@prisma/client';
import { z } from 'zod';
import { ticketConfig } from '../../../lib/ticketConfig';

const prisma = new PrismaClient();

const CreatePaymentRequestSchema = z.object({
  registrationId: z.string(),
  ticketType: z.nativeEnum(TicketType).default(TicketType.FULL),
  currency: z.string(),
  amount: z.number(),
});

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