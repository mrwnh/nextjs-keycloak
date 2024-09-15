import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const UpdatePaymentSchema = z.object({
  ticketType: z.enum(['FULL', 'FREE', 'VVIP', 'VIP', 'PASS', 'ONE_DAY', 'TWO_DAY']),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id: registrationId } = params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { registrationId: registrationId },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id: registrationId } = params;

  try {
    const body = await req.json();
    const { ticketType } = UpdatePaymentSchema.parse(body);

    const updatedPayment = await prisma.payment.update({
      where: { registrationId: registrationId },
      data: { ticketType: ticketType },
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}