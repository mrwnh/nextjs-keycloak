import { NextResponse } from 'next/server';
import https from 'https';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const resourcePath = searchParams.get('resourcePath');

  if (!resourcePath) {
    return NextResponse.json({ error: 'Resource path is required' }, { status: 400 });
  }

  const options = {
    port: 443,
    host: 'eu-test.oppwa.com',
    path: resourcePath + '?entityId=8a8294174b7ecb28014b9699220015ca',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer OGE4Mjk0MTc0YjdlY2IyODAxNGI5Njk5MjIwMDE1Y2N8c3k2S0pzVDg='
    }
  };

  try {
    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, function (res) {
        const chunks: Buffer[] = [];
        res.on('data', function (chunk) {
          chunks.push(chunk);
        });
        res.on('end', function () {
          const body = Buffer.concat(chunks);
          resolve(JSON.parse(body.toString()));
        });
      });
      req.on('error', reject);
      req.end();
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
  }
}