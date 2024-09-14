// src/app/api/prepare-checkout/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import https from 'https';
import querystring from 'querystring';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log('Received body:', body);

    const { currency, registrationId, ticketType } = body;
    const missingFields: string[] = [];
    if (!currency) missingFields.push('currency');
    if (!registrationId) missingFields.push('registrationId');
    if (!ticketType) missingFields.push('ticketType');

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    let amount: number;
    switch (ticketType) {
      case 'Full Access':
        amount = 300;
        break;
      case '2 days':
        amount = 200;
        break;
      case '1 day':
        amount = 100;
        break;
      default:
        return NextResponse.json({ error: 'Invalid ticket type' }, { status: 400 });
    }

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

    return NextResponse.json({ checkoutId });
  } catch (error) {
    console.error('Error preparing checkout:', error);
    return NextResponse.json({ error: 'Failed to prepare checkout', details: error.message }, { status: 500 });
  }
}