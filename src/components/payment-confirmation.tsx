import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { CheckCircle2, CreditCard, Calendar, DollarSign } from 'lucide-react';

interface PaymentDetails {
  amount: number;
  currency: string;
  lastFourDigits: string;
}

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentDetails: PaymentDetails;
}

export function PaymentConfirmationModal({ isOpen, onClose, paymentDetails }: PaymentConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle2 className="text-green-500" />
            Payment Successful
          </DialogTitle>
          <DialogDescription>
            Your payment has been processed successfully. Here are the details of your transaction:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="text-[#66cada]" />
            <span className="font-semibold">Amount:</span>
            <span>{paymentDetails.amount} {paymentDetails.currency}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="text-[#66cada]" />
            <span className="font-semibold">Card:</span>
            <span>**** **** **** {paymentDetails.lastFourDigits}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="text-[#66cada]" />
            <span className="font-semibold">Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="bg-[#66cada] hover:bg-[#4fa8b8] text-white">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}