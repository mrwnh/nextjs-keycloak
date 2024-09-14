import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.redirect('/api/auth/signin');
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const resourcePath = searchParams.get('resourcePath');

  if (!id || !resourcePath) {
    return NextResponse.json({ error: 'Missing id or resourcePath' }, { status: 400 });
  }

  try {
    const paymentStatus = await checkPaymentStatus(resourcePath);

    if (paymentStatus.result.code === '000.100.110') {
      // Payment successful
      const updatedRegistration = await prisma.registration.update({
        where: { email: session.user.email ?? '' },
        data: {
          payment: {
            update: {
              status: 'PAID',
              lastFourDigits: paymentStatus.card.last4Digits,
              paymentDate: new Date(),
              amount: parseFloat(paymentStatus.amount),
              currency: paymentStatus.currency,
            },
          },
        },
        include: {
          payment: true,
        },
      });

      // Redirect to the registration page with success status
      return NextResponse.redirect(`/register?paymentStatus=success&registrationId=${updatedRegistration.id}`);
    } else {
      // Payment failed
      return NextResponse.redirect(`/register?paymentStatus=failed`);
    }
  } catch (error) {
    console.error('Error processing payment result:', error);
    return NextResponse.redirect(`/register?paymentStatus=error`);
  }
}

async function checkPaymentStatus(resourcePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      port: 443,
      host: 'eu-test.oppwa.com',
      path: resourcePath,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer OGE4Mjk0MTc0YjdlY2IyODAxNGI5Njk5MjIwMDE1Y2N8c3k2S0pzVDg='
      }
    };

    const req = https.request(options, (res) => {
      const buf: Buffer[] = [];
      res.on('data', chunk => {
        buf.push(Buffer.from(chunk));
      });
      res.on('end', () => {
        const jsonString = Buffer.concat(buf).toString('utf8');
        try {
          const result = JSON.parse(jsonString);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}