import { NextResponse } from 'next/server';
import https from 'https';
import querystring from 'querystring';
import { z } from 'zod';
import { ticketConfig, getEntityId } from '@/lib/ticketConfig';

const PrepareCheckoutSchema = z.object({
  registrationId: z.string(),
  ticketType: z.enum(['FULL', 'TWO_DAY', 'ONE_DAY', 'FREE', 'VVIP', 'VIP', 'PASS']),
  currency: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { registrationId, ticketType, currency } = PrepareCheckoutSchema.parse(body);

    const ticketInfo = ticketConfig[ticketType];
    if (!ticketInfo) {
      throw new Error('Invalid ticket type');
    }

    const entityId = getEntityId(currency);
    const amount = ticketInfo.amount.toFixed(2);

    const data = querystring.stringify({
      'entityId': entityId,
      'amount': amount,
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

    if (checkoutIdResponse.result && checkoutIdResponse.result.code === "000.200.100") {
      return NextResponse.json({ 
        id: checkoutIdResponse.id,
        amount,
        currency,
        entityId,
        registrationId
      });
    } else {
      throw new Error('Failed to get checkoutId from payment provider');
    }
  } catch (error: unknown) {
    console.error('Error preparing checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to prepare checkout', details: errorMessage }, { status: 500 });
  }
}