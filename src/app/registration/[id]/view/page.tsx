import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import CheckView from '@/components/check-view'

const prisma = new PrismaClient()

export default async function Page({ params }: { params: { id: string } }) {
  const registration = await prisma.registration.findUnique({
    where: { id: params.id },
    include: { payment: true, checkIns: true },
  })

  if (!registration) {
    notFound()
  }

  const formattedRegistration = {
    ...registration,
    checkIns: registration.checkIns,
    payment: registration.payment ? {
      status: registration.payment.status as "PAID" | "UNPAID" | "WAIVED",
      ticketType: registration.payment.ticketType as string | null,
      amount: registration.payment.amount ? Number(registration.payment.amount) : null,
      currency: registration.payment.currency,
      paymentDate: registration.payment.paymentDate?.toISOString() || null,
    } : null,
  }

  return <CheckView registration={formattedRegistration} />
}