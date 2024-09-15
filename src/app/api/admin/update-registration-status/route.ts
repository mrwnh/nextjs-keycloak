import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { RegistrationStatus } from "@/lib/schemas";
import { z } from 'zod';

const prisma = new PrismaClient();

const UpdateStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['APPROVED', 'REJECTED'])
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const validatedData = UpdateStatusSchema.parse(data);

    const updatedRegistration = await prisma.registration.update({
      where: { id: validatedData.id },
      data: { 
        status: validatedData.status,
      },
    });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating registration status:', error);
    return NextResponse.json({ error: 'Failed to update registration status' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const data = await req.json();

  try {
    const updatedRegistration = await prisma.registration.update({
        where: { id: params.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          company: data.company,
          designation: data.designation,
          city: data.city,
          status: data.status,
          imageUrl: data.imageUrl,
          qrCodeUrl: data.qrCodeUrl,
          payment: {
            update: {
              status: data.payment?.status,
              ticketType: data.payment?.ticketType,
              lastFourDigits: data.payment?.lastFourDigits,
              paymentDate: data.payment?.paymentDate,
              amount: data.payment?.amount,
              currency: data.payment?.currency,
            },
          },
        },
        include: {
          comments: true,
          payment: true,
        },
      });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
  }
}