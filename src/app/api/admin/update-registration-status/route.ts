import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const data = await req.json();

  try {
    const updatedRegistration = await prisma.registration.update({
      where: { id: data.id },
      data: { status: data.status === 'approve' ? 'approved' : 'rejected' },
    });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
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
        ticketType: data.ticketType,
        status: data.status,
        paymentStatus: data.paymentStatus,
        lastFourDigits: data.lastFourDigits,
        imageUrl: data.imageUrl,
        qrCodeUrl: data.qrCodeUrl,
      },
      include: {
        comments: true,
      },
    });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
  }
}