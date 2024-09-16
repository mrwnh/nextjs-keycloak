import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Ticket, AlertCircle, Download, QrCode, Receipt } from "lucide-react";
import { PaymentStatusType } from '@/lib/schemas';
import { ticketConfig } from '@/lib/ticketConfig';

interface TicketPaymentProps {
  ticketType: string | null;
  paymentStatus: PaymentStatusType;
  registrationStatus: string;
  registrationId: string;
  onDownloadReceipt: () => void;
  onDownloadTicket: () => void;
  onDownloadQRCode: () => void;
}

export default function TicketPaymentCTA({ 
  ticketType, 
  paymentStatus,
  registrationStatus,
  registrationId,
  onDownloadReceipt,
  onDownloadTicket,
  onDownloadQRCode
}: TicketPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const ticketInfo = ticketType ? ticketConfig[ticketType as keyof typeof ticketConfig] : null;

  const prepareCheckout = async () => {
    if (!ticketType || !ticketInfo) {
      throw new Error('Invalid ticket type or missing ticket info');
    }

    const response = await fetch('/api/prepare-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationId,
        ticketType,
        currency: ticketInfo.currency,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to prepare checkout');
    }

    return response.json();
  };

  const handlePayNow = async () => {
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
      console.error('Error in payment flow:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (checkoutId) {
      const script = document.createElement('script');
      script.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const form = document.createElement('form');
        form.action = `${process.env.NEXT_PUBLIC_URL}/api/payment-result`;
        form.className = "paymentWidgets";
        form.setAttribute('data-brands', "VISA MASTER AMEX");

        const container = document.getElementById('payment-container');
        if (container) {
          container.innerHTML = '';
          container.appendChild(form);
        }
      };

      const handlePaymentResult = async (e: MessageEvent) => {
        if (e.data.name === 'PAYMENT_RESULT') {
          const status = await checkPaymentStatus(e.data.resourcePath);
          // Update payment status here
          // You might need to call a function to update the payment status in your parent component
        }
      };

      window.addEventListener('message', handlePaymentResult);

      return () => {
        document.body.removeChild(script);
        window.removeEventListener('message', handlePaymentResult);
      };
    }
  }, [checkoutId]);

  const checkPaymentStatus = async (resourcePath: string) => {
    const response = await fetch(`/api/check-payment-status?resourcePath=${encodeURIComponent(resourcePath)}`);
    const data = await response.json();
    return data;
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-[#162851] text-white">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="h-6 w-6" />
          Your Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {/* Ticket details */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-[#a2a5ae] dark:text-white">Ticket Type</span>
          <span className="font-semibold text-[#162851] dark:text-white">{ticketType || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-[#a2a5ae] dark:text-white">Amount</span>
          <span className="font-semibold text-[#162851] dark:text-white flex items-center">
            {ticketInfo ? `${ticketInfo.amount} ${ticketInfo.currency}` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-[#a2a5ae]">Payment Status</span>
          <Badge 
            variant={paymentStatus === 'PAID' ? 'default' : 'destructive'}
            className={`font-semibold ${
              paymentStatus === 'PAID' 
                ? 'bg-[#66cada] text-[#162851] hover:bg-[#4fa8b8]' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            {paymentStatus.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4 p-6">
        {registrationStatus === 'APPROVED' && paymentStatus === 'UNPAID' ? (
          <>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-r-md flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Your registration is approved. Please complete your payment to secure your spot.
              </p>
            </div>
            <Button 
              onClick={handlePayNow} 
              className="w-full bg-[#66cada] hover:bg-[#4fa8b8] text-[#162851] font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Pay Now'}
            </Button>
          </>
        ) : paymentStatus === 'PAID' ? (
          <>
            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-r-md flex items-start">
              <Ticket className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                Your ticket is confirmed. You can now download your receipt, ticket, and QR code.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={onDownloadReceipt} 
                variant="outline" 
                className="flex flex-col items-center justify-center h-20 text-[#162851] border-[#66cada] hover:bg-[#66cada] hover:text-white"
              >
                <Receipt className="h-6 w-6 mb-1" />
                <span className="text-xs">Receipt</span>
              </Button>
              <Button 
                onClick={onDownloadTicket} 
                variant="outline" 
                className="flex flex-col items-center justify-center h-20 text-[#162851] border-[#66cada] hover:bg-[#66cada] hover:text-white"
              >
                <Download className="h-6 w-6 mb-1" />
                <span className="text-xs">Ticket</span>
              </Button>
              <Button 
                onClick={onDownloadQRCode} 
                variant="outline" 
                className="flex flex-col items-center justify-center h-20 text-[#162851] border-[#66cada] hover:bg-[#66cada] hover:text-white"
              >
                <QrCode className="h-6 w-6 mb-1" />
                <span className="text-xs">QR Code</span>
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-r-md flex items-start">
            <AlertCircle className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Your registration is pending approval. Please wait for further instructions.
            </p>
          </div>
        )}
      </CardFooter>
      <div id="payment-container" className="mt-4"></div>
    </Card>
  );
}