import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { registrationId, userEmail } = await request.json()
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        registrationId,
        checkedInBy: user.id,
      },
    })

    await prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'APPROVED' },
    })

    return NextResponse.json(checkIn)
  } catch (error) {
    console.error('Error creating check-in:', error)
    return NextResponse.json({ message: 'Error creating check-in' }, { status: 500 })
  }
}