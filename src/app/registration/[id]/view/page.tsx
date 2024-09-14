import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Image from 'next/image';

const prisma = new PrismaClient();

export default async function RegistrationView({ params }: { params: { id: string } }) {
  const registration = await prisma.registration.findUnique({
    where: { id: params.id },
    include: { payment: true },
  });

  if (!registration) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registration Details</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <p className="font-bold">Registration Type:</p>
          <p>{registration.registrationType}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Name:</p>
          <p>{`${registration.firstName} ${registration.lastName}`}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Email:</p>
          <p>{registration.email}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Phone Number:</p>
          <p>{registration.phoneNumber}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Company:</p>
          <p>{registration.company}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Designation:</p>
          <p>{registration.designation}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">City:</p>
          <p>{registration.city}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Status:</p>
          <p>{registration.status}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Payment Status:</p>
          <p>{registration.payment?.status || 'N/A'}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Ticket Type:</p>
          <p>{registration.payment?.ticketType || 'N/A'}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Payment Amount:</p>
          <p>{registration.payment?.amount ? `${registration.payment.amount} ${registration.payment.currency}` : 'N/A'}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Payment Date:</p>
          <p>{registration.payment?.paymentDate ? new Date(registration.payment.paymentDate).toLocaleDateString() : 'N/A'}</p>
        </div>
        {registration.imageUrl && (
          <div className="mb-4">
            <p className="font-bold">Profile Picture:</p>
            <Image src={registration.imageUrl} alt="Profile" width={128} height={128} className="object-cover rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}