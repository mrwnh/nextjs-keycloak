import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import https from 'https';
import querystring from 'querystring';
import { TicketType } from '@/lib/schemas';
import { z } from 'zod';

export const ticketConfig = {
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
  currency: z.string(),
  amount: z.number(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { registrationId, ticketType, currency } = PrepareCheckoutSchema.parse(body);

    const ticketInfo = ticketConfig[ticketType];
    if (!ticketInfo) {
      return NextResponse.json({ error: 'Invalid ticket type' }, { status: 400 });
    }

    const { amount } = ticketInfo;

    let entityId;
    switch (currency) {
      case 'SAR':
        entityId = "8acda4ce899a99c00189b5839d8376e8";
        break;
      case 'USD':
        entityId = "8acda4ca902fb4bb01904e2cddf40dea";
        break;
      case 'EUR':
        entityId = "8acda4ca902fb4bb01904e2d42430df1";
        break;
      case 'GBP':
        entityId = "8ac9a4cd90e440510190e4a76f460523";
        break;
      default:
        return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }

    const data = querystring.stringify({
      'entityId': entityId,
      'amount': amount.toFixed(2),
      'currency': currency,
      'paymentType': 'DB',
      'merchantTransactionId': registrationId,
      'testMode': 'EXTERNAL',
      'customParameters[SHOPPER_registration_id]': registrationId,
      'customParameters[SHOPPER_ticketType]': ticketType
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

    const checkoutIdResponse = await new Promise<any>((resolve, reject) => {
      const postRequest = https.request(options, function(res) {
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
      postRequest.on('error', reject);
      postRequest.write(data);
      postRequest.end();
    });

    console.log('Full response from payment provider:', JSON.stringify(checkoutIdResponse, null, 2));

    if (checkoutIdResponse.result.code !== "000.200.100") {
      throw new Error(`Failed to get checkoutId from payment provider. Response: ${JSON.stringify(checkoutIdResponse)}`);
    }

    const checkoutId = checkoutIdResponse.id;

    return NextResponse.json({ checkoutId, amount, currency, entityId });
  } catch (error: unknown) {
    console.error('Error preparing checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to prepare checkout', details: errorMessage }, { status: 500 });
  }
}