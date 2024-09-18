import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    
    // First, delete associated Payment record
    await prisma.payment.deleteMany({
      where: { registrationId: id },
    })

    // Then, delete the Registration
    const deletedRegistration = await prisma.registration.delete({
      where: { id },
    })

    return NextResponse.json(deletedRegistration)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting registration:', error)
      return NextResponse.json({ error: 'Failed to delete registration', message: error.message }, { status: 500 })
    } else {
      console.error('Error deleting registration:', error)
      return NextResponse.json({ error: 'Failed to delete registration', message: 'Unknown error occurred' }, { status: 500 })
    }
  }
}