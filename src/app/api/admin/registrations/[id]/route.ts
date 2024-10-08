import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../../auth/[...nextauth]/route'
import { Prisma, PrismaClient } from '@prisma/client';
import { RegistrationStatus, PaymentStatus, TicketType } from "@/lib/schemas";
import { z } from 'zod';

const prisma = new PrismaClient();

const UpdateRegistrationSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(10).optional(),
  company: z.string().min(2).optional(),
  designation: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING']).optional(),
  imageUrl: z.string().url().optional(),
  qrCodeUrl: z.string().url().nullable().optional(),
  payment: z.object({
    status: z.enum(['UNPAID', 'PAID', 'WAIVED', 'REFUNDED']).optional(),
    ticketType: z.enum(['FULL', 'FREE', 'VVIP', 'VIP', 'PASS', 'ONE_DAY', 'TWO_DAY']).optional(),
    lastFourDigits: z.string().length(4).optional(),
    paymentDate: z.string().datetime().optional(),
    amount: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
  }).optional(),
});

async function updateRegistration(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { payment, ...registrationData } = data;
    const validatedData = UpdateRegistrationSchema.omit({ payment: true }).parse(registrationData);

    const updatedRegistration = await prisma.registration.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        comments: true,
        payment: true,
      },
    });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
      }
    }
    console.error('Error updating registration:', error);
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
  }
}

export const PUT = updateRegistration;
export const PATCH = updateRegistration;