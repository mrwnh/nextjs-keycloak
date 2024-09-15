import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Ticket, DollarSign, AlertCircle, Download, QrCode, Receipt } from "lucide-react";
import { useState, useEffect } from 'react';
import { PaymentConfirmationModal } from './payment-confirmation';
import { PaymentStatusType } from '@/lib/schemas';

interface PaymentDetailsBase {
  amount: number;
  currency: string;
  lastFourDigits: string;
}


interface TicketPaymentProps {
  ticketType: string | null;
  amount: number | null;
  currency: string | null;
  paymentStatus: PaymentStatusType;
  registrationStatus: string;
  registrationId: string;
  onPayNow: () => void;
  onDownloadReceipt: () => void;
  onDownloadTicket: () => void;
  onDownloadQRCode: () => void;
}

const ticketConfig = {
  FULL: { amount: 300, currency: 'EUR' },
  TWO_DAY: { amount: 200, currency: 'EUR' },
  ONE_DAY: { amount: 100, currency: 'EUR' },
  FREE: { amount: 0, currency: 'EUR' },
  VVIP: { amount: 500, currency: 'EUR' },
  VIP: { amount: 400, currency: 'EUR' },
  PASS: { amount: 150, currency: 'EUR' },
};

export default function TicketPaymentCTA({ 
  ticketType, 
  paymentStatus,
  registrationStatus,
  registrationId,
  onPayNow,
  onDownloadReceipt,
  onDownloadTicket,
  onDownloadQRCode
}: TicketPaymentProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentConfirmation, setPaymentConfirmation] = useState<PaymentDetailsBase | null>(null);

  const ticketInfo = ticketType ? ticketConfig[ticketType as keyof typeof ticketConfig] : null;

  const handlePayNow = async () => {
    setIsPaymentModalOpen(true);
    const response = await fetch('/api/prepare-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId, ticketType }),
    });
    const data = await response.json();
    if (data.checkoutId) {
      window.location.href = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${data.checkoutId}`;
    } else {
      console.error('Failed to prepare checkout');
      setIsPaymentModalOpen(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('paymentStatus');
    if (paymentStatus === 'success') {
      const amount = parseFloat(urlParams.get('amount') || '0');
      const currency = urlParams.get('currency') || '';
      const lastFourDigits = urlParams.get('lastFourDigits') || '';
      setPaymentConfirmation({ amount, currency, lastFourDigits });
    }
  }, []);

  return (
    <>
      <Card className="w-full">
        <CardHeader className="bg-[#162851] text-white">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            Your Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#a2a5ae]">Ticket Type</span>
            <span className="font-semibold text-[#162851]">{ticketType || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#a2a5ae]">Amount</span>
            <span className="font-semibold text-[#162851] flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-[#66cada]" />
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
              >
                Pay Now
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
      </Card>
      <PaymentConfirmationModal
        isOpen={!!paymentConfirmation}
        onClose={() => setPaymentConfirmation(null)}
        paymentDetails={paymentConfirmation || { amount: 0, currency: '', lastFourDigits: '' }}
      />
    </>
  );
}