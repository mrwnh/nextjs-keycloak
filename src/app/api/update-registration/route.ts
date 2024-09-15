import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { registrationSchema, RegistrationInput } from "@/lib/schemas";
import { z } from 'zod';

const prisma = new PrismaClient();

const UpdateRegistrationSchema = registrationSchema.partial().extend({
  id: z.string().cuid(),
});

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const validatedData = UpdateRegistrationSchema.parse(data);

    const { id, ...updateData } = validatedData;

    if (!id) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id },
      data: updateData,
      include: {
        payment: true,
      },
    });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating registration:', error);
    return NextResponse.json({ error: 'Registration update failed' }, { status: 500 });
  }
}