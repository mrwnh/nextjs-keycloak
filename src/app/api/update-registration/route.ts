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
        where: { email: session.user.email },
        data: {
          registrationType: data.registrationType,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber, 
          company: data.company,
          designation: data.designation,
          city: data.city,
          imageUrl: data.imageUrl,
        },
      });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json({ error: 'Registration update failed' }, { status: 500 });
  }
}