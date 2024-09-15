import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import https from 'https';
import querystring from 'querystring';
import { TicketType } from '@/lib/schemas';
import { z } from 'zod';

const ticketConfig = {
  FULL: { amount: 300, currency: 'EUR' },
  TWO_DAY: { amount: 200, currency: 'EUR' },
  ONE_DAY: { amount: 100, currency: 'EUR' },
  FREE: { amount: 0, currency: 'EUR' },
  VVIP: { amount: 500, currency: 'EUR' },
  VIP: { amount: 400, currency: 'EUR' },
  PASS: { amount: 150, currency: 'EUR' },
};

const PrepareCheckoutSchema = z.object({
  registrationId: z.string(),
  ticketType: TicketType.default('FULL'),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { registrationId, ticketType } = PrepareCheckoutSchema.parse(body);

    const ticketInfo = ticketConfig[ticketType];
    if (!ticketInfo) {
      return NextResponse.json({ error: 'Invalid ticket type' }, { status: 400 });
    }

    const { amount, currency } = ticketInfo;

    const data = querystring.stringify({
      'entityId': '8a8294174b7ecb28014b9699220015ca',
      'amount': amount.toFixed(2),
      'currency': currency,
      'paymentType': 'DB',
      'merchantTransactionId': registrationId,
    });

    const options = {
      port: 443,
      host: 'eu-test.oppwa.com',
      path: '/v1/checkouts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length,
        'Authorization': 'Bearer OGE4Mjk0MTc0YjdlY2IyODAxNGI5Njk5MjIwMDE1Y2N8c3k2S0pzVDg='
      }
    };

    const checkoutId = await new Promise((resolve, reject) => {
      const postRequest = https.request(options, function(res) {
        const buf: Buffer[] = [];
        res.on('data', chunk => {
          buf.push(Buffer.from(chunk));
        });
        res.on('end', () => {
          const jsonString = Buffer.concat(buf).toString('utf8');
          try {
            const result = JSON.parse(jsonString);
            resolve(result.id);
          } catch (error) {
            reject(error);
          }
        });
      });
      postRequest.on('error', reject);
      postRequest.write(data);
      postRequest.end();
    });

    return NextResponse.json({ checkoutId, amount, currency });
  } catch (error: unknown) {
    console.error('Error preparing checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to prepare checkout', details: errorMessage }, { status: 500 });
  }
}