'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import https from 'https';
import querystring from 'querystring';

export default function TestPaymentPage() {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const prepareCheckout = async () => {
    const path = '/v1/checkouts';
    const data = querystring.stringify({
      'entityId': '8a8294174b7ecb28014b9699220015ca',
      'amount': '92.00',
      'currency': 'EUR',
      'paymentType': 'DB'
    });
    const options = {
      port: 443,
      host: 'eu-test.oppwa.com',
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length,
        'Authorization': 'Bearer OGE4Mjk0MTc0YjdlY2IyODAxNGI5Njk5MjIwMDE1Y2N8c3k2S0pzVDg='
      }
    };

    return new Promise<any>((resolve, reject) => {
      const postRequest = https.request(options, function(res) {
        const buf: Buffer[] = [];
        res.on('data', chunk => {
          buf.push(Buffer.from(chunk));
        });
        res.on('end', () => {
          const jsonString = Buffer.concat(buf).toString('utf8');
          try {
            resolve(JSON.parse(jsonString));
          } catch (error) {
            reject(error);
          }
        });
      });
      postRequest.on('error', reject);
      postRequest.write(data);
      postRequest.end();
    });
  };

  const handleTestPayment = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const checkoutResponse = await prepareCheckout();
      if (checkoutResponse.id) {
        setCheckoutId(checkoutResponse.id);
        setResult('Checkout prepared successfully. Please complete the payment in the form below.');
      } else {
        throw new Error('Failed to prepare checkout');
      }
    } catch (error) {
      console.error('Error in test payment flow:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (resourcePath: string) => {
    const response = await fetch(`/api/check-payment-status?resourcePath=${encodeURIComponent(resourcePath)}`);
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    if (checkoutId) {
      const script = document.createElement('script');
      script.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
      script.async = true;
      document.body.appendChild(script);

      const form = document.createElement('form');
      form.action = `${window.location.origin}/api/payment-result`;  // Add this line
      form.className = "paymentWidgets";
      form.setAttribute('data-brands', "VISA MASTER AMEX");

      const container = document.getElementById('payment-container');
      if (container) {
        container.innerHTML = '';
        container.appendChild(form);
      }

      // Add event listener for payment completion
      window.addEventListener('message', async function(e) {
        if (e.data.name === 'PAYMENT_RESULT') {
          const status = await checkPaymentStatus(e.data.resourcePath);
          setPaymentStatus(status.result.description);
        }
      }, false);

      return () => {
        document.body.removeChild(script);
        window.removeEventListener('message', () => {});
      };
    }
  }, [checkoutId]);

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Payment Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTestPayment} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Test Payment Integration'}
          </Button>
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold">Result:</h3>
              <p>{result}</p>
            </div>
          )}
          {paymentStatus && (
            <div className="mt-4 p-4 bg-blue-100 rounded">
              <h3 className="font-semibold">Payment Status:</h3>
              <p>{paymentStatus}</p>
            </div>
          )}
          <div id="payment-container" className="mt-4"></div>
        </CardContent>
      </Card>
    </div>
  );
}