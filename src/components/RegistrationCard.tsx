'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RegistrationForm } from './form';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MapPin, Briefcase, Award, Building, AlertCircle, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Registration } from '@/lib/schemas';
import { Separator } from '@/components/ui/separator';
import TicketPaymentCTA from '@/components/TicketPaymentCTA';
import { PaymentConfirmationModal } from './payment-confirmation';

export default function RegistrationCard({ registration, onUpdate }: { registration: Registration, onUpdate: (updatedRegistration: Registration) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState(registration);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({ amount: 0, currency: '', lastFourDigits: '' });

  const handlePaymentResult = useCallback(async (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const resourcePath = formData.get('resourcePath') as string;

    try {
      const response = await fetch('/api/payment-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resourcePath }),
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const result = await response.json();

      if (result.success) {
        setCurrentRegistration(result.registration);
        setPaymentDetails({
          amount: result.registration.payment.amount,
          currency: result.registration.payment.currency,
          lastFourDigits: result.registration.payment.lastFourDigits,
        });
        setIsPaymentModalOpen(true);
        onUpdate(result.registration);
      } else {
        // Payment failed, show error message to the user
        console.error('Payment failed:', result.error);
      }
    } catch (error) {
      console.error('Error processing payment result:', error);
      // Show error message to the user
    }
  }, [setCurrentRegistration, setPaymentDetails, setIsPaymentModalOpen, onUpdate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const resourcePath = urlParams.get('resourcePath');

    if (id && resourcePath) {
      const event = new Event('submit');
      const form = document.createElement('form');
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', 'resourcePath');
      input.setAttribute('value', resourcePath);
      form.appendChild(input);
      form.addEventListener('submit', handlePaymentResult);
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }, [handlePaymentResult]);

  const handleUpdate = async (values: any) => {
    try {
      const response = await fetch('/api/update-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedRegistration = await response.json();
        setCurrentRegistration(updatedRegistration);
        onUpdate(updatedRegistration);
        setIsEditing(false);
      } else {
        console.error('Failed to update registration');
      }
    } catch (error) {
      console.error('Error updating registration:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-[#66cada] text-[#162851] hover:cursor-default hover:bg-[#4fa8b8] dark:bg-[#66cada] dark:text-[#162851] dark:hover:bg-[#4fa8b8]';
      case 'rejected':
        return 'bg-red-600 text-white hover:cursor-default hover:bg-red-500 dark:bg-red-600 dark:text-white';
      case 'pending':
        return 'bg-yellow-100 text-[#162851] hover:cursor-default hover:bg-yellow-200 dark:bg-yellow-600 dark:text-white';
      default:
        return 'bg-gray-100 text-[#162851] hover:cursor-default hover:bg-gray-200 dark:bg-gray-600 dark:text-white';
    }
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-center space-x-3">
      <Icon className="text-[#66cada] h-5 w-5" />
      <div>
        <p className="text-sm text-[#a2a5ae]">{label}</p>
        <p className="font-semibold text-[#162851] dark:text-white">{value}</p>
      </div>
    </div>
  );

  const handlePayNow = async () => {
    try {
      const response = await fetch('/api/prepare-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: currentRegistration.payment?.currency || 'EUR',
          registrationId: currentRegistration.id,
          ticketType: currentRegistration.payment?.ticketType || 'Full Access',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to prepare checkout');
      }

      const { checkoutId } = await response.json();

      // Create the payment form
      const script = document.createElement('script');
      script.src = "https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=" + checkoutId;
      script.async = true;
      script.onload = () => {
        const form = document.createElement('form');
        form.action = '/api/payment-result';
        form.method = 'POST';
        form.className = 'paymentWidgets';
        form.setAttribute('data-brands', 'VISA MASTER AMEX');
        
        const paymentContainer = document.getElementById('payment-form-container');
        if (paymentContainer) {
          paymentContainer.innerHTML = '';
          paymentContainer.appendChild(form);
        } else {
          console.error('Payment form container not found');
        }

        // Add event listener for form submission
        form.addEventListener('submit', handlePaymentResult);
      };
      document.body.appendChild(script);

    } catch (error) {
      console.error('Error initiating payment:', error);
      // Handle error (show error message to user)
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-xl border-[#66cada] border-t-4 overflow-hidden">
        <CardHeader className="bg-[#162851] text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Registration Details</CardTitle>
            <Badge className={`text-sm font-semibold uppercase hover:cursor-default ${getStatusColor(currentRegistration.status)}`}>
              {currentRegistration.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <>
              <RegistrationForm
                initialData={{
                  ...currentRegistration,
                  imageUrl: currentRegistration.imageUrl || undefined
                }}
                onSubmit={handleUpdate}
                isEmailDisabled={true}
              />
              <div className="mt-6 flex justify-end space-x-4">
                <Button 
                  onClick={() => setIsEditing(false)} 
                  className="bg-gray-300 hover:bg-gray-400 text-[#162851] font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={registration.imageUrl || undefined} alt={`${registration.firstName} ${registration.lastName}`} />
                  <AvatarFallback>
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[#162851] dark:text-white text-xl">
                    {currentRegistration.firstName} {currentRegistration.lastName}
                  </p>
                  <p className="text-sm text-[#a2a5ae]">{currentRegistration.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InfoItem icon={Phone} label="Phone" value={currentRegistration.phoneNumber} />
                  <InfoItem icon={MapPin} label="City" value={currentRegistration.city} />
                  <InfoItem icon={Award} label="Registration Type" value={currentRegistration.registrationType} />
                </div>
                <div className="space-y-4">
                  <InfoItem icon={Building} label="Company" value={currentRegistration.company} />
                  <InfoItem icon={Briefcase} label="Designation" value={currentRegistration.designation} />
                </div>
              </div>
              <Separator className="my-6 border-[#66cada]" />
              <div className="mt-4">
                <h3 className="font-semibold text-[#162851] dark:text-white text-lg mb-4">Payment Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner dark:bg-gray-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem 
                      icon={CreditCard} 
                      label="Payment Status" 
                      value={currentRegistration.payment?.status || 'N/A'} 
                    />
                    <InfoItem 
                      icon={Award} 
                      label="Ticket Type" 
                      value={currentRegistration.payment?.ticketType || 'N/A'} 
                    />
                    <InfoItem 
                      icon={DollarSign} 
                      label="Amount" 
                      value={currentRegistration.payment?.amount 
                        ? `${currentRegistration.payment.amount} ${currentRegistration.payment.currency}` 
                        : 'N/A'
                      } 
                    />
                    <InfoItem 
                      icon={Calendar} 
                      label="Payment Date" 
                      value={currentRegistration.payment?.paymentDate 
                        ? new Date(currentRegistration.payment.paymentDate).toLocaleDateString() 
                        : 'N/A'
                      } 
                    />
                  </div>
                </div>
              </div>
              {currentRegistration.status.toLowerCase() === 'approved' && 
               (!currentRegistration.payment || currentRegistration.payment.status.toLowerCase() === 'unpaid') && (
                <CardContent className="p-6">
                  <TicketPaymentCTA
                    ticketType={currentRegistration.payment?.ticketType || 'Standard'}
                    amount={currentRegistration.payment?.amount || 0}
                    currency={currentRegistration.payment?.currency || 'SAR'}
                    paymentStatus="UNPAID"
                    onPayNow={handlePayNow}
                    onDownloadReceipt={() => {}}
                    onDownloadTicket={() => {}}
                    onDownloadQRCode={() => {}}
                  />
                </CardContent>
              )}
              <div id="payment-form-container" className="mt-4"></div>
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-[#66cada] hover:bg-[#4fa8b8] text-[#162851] font-semibold"
                >
                  Edit Registration
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <PaymentConfirmationModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentDetails={paymentDetails}
      />
    </>
  );
}