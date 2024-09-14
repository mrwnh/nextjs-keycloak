'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RegistrationForm } from './form';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MapPin, Briefcase, Award, Building, AlertCircle, CreditCard, Calendar, DollarSign, Edit, Ticket, Receipt, Download, QrCode } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Registration } from '@/lib/schemas';
import { Separator } from '@/components/ui/separator';
import { PaymentConfirmationModal } from './payment-confirmation';
import { motion, AnimatePresence } from 'framer-motion'

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

      if (result.updatedRegistration) {
        setCurrentRegistration(result.updatedRegistration);
        setPaymentDetails({
          amount: result.updatedRegistration.payment?.amount || 0,
          currency: result.updatedRegistration.payment?.currency || '',
          lastFourDigits: result.updatedRegistration.payment?.lastFourDigits || '',
        });
        setIsPaymentModalOpen(true);
        onUpdate(result.updatedRegistration);
      } else {
        console.error('Payment failed:', result.error);
      }
    } catch (error) {
      console.error('Error processing payment result:', error);
    }
  }, [setCurrentRegistration, setPaymentDetails, setIsPaymentModalOpen, onUpdate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const resourcePath = urlParams.get('resourcePath');

    if (id && resourcePath) {
      fetch('/api/payment-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resourcePath }),
      })
      .then(response => response.json())
      .then(result => {
        if (result.updatedRegistration) {
          setCurrentRegistration(result.updatedRegistration);
          setPaymentDetails({
            amount: result.updatedRegistration.payment?.amount || 0,
            currency: result.updatedRegistration.payment?.currency || '',
            lastFourDigits: result.updatedRegistration.payment?.lastFourDigits || '',
          });
          setIsPaymentModalOpen(true);
          onUpdate(result.updatedRegistration);
        } else {
          console.error('Payment failed:', result.error);
        }
      })
      .catch(error => {
        console.error('Error processing payment result:', error);
      });
    }
  }, []);

  const handleUpdate = async (values: any) => {
    try {
      const response = await fetch('/api/update-registration', {
        method: 'PUT',
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
        return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <motion.div 
      className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="text-[#66cada] h-5 w-5" />
      <div>
        <p className="text-sm text-[#a2a5ae]">{label}</p>
        <p className="font-semibold text-[#162851] dark:text-white">{value}</p>
      </div>
    </motion.div>
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
      window.location.href = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-xl border-[#66cada] border-t-4 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="bg-[#162851] text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Registration Details</CardTitle>
            <Badge className={`text-sm font-semibold uppercase hover:cursor-default ${getStatusColor(currentRegistration.status)}`}>
              {currentRegistration.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            ) : (
              <motion.div
                key="viewing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="w-20 h-20 border-2 border-[#66cada]">
                    <AvatarImage src={registration.imageUrl || undefined} alt={`${registration.firstName} ${registration.lastName}`} />
                    <AvatarFallback className="bg-[#66cada] text-[#162851]">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem icon={Phone} label="Phone" value={currentRegistration.phoneNumber} />
                  <InfoItem icon={MapPin} label="City" value={currentRegistration.city} />
                  <InfoItem icon={Award} label="Registration Type" value={currentRegistration.registrationType} />
                  <InfoItem icon={Building} label="Company" value={currentRegistration.company} />
                  <InfoItem icon={Briefcase} label="Designation" value={currentRegistration.designation} />
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
                {currentRegistration.status.toLowerCase() === 'approved' && currentRegistration.payment?.status.toLowerCase() === 'unpaid' && (
                  <motion.div 
                    className="mt-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-r-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center">
                      <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
                      <p className="font-semibold text-[#162851]">Payment Required</p>
                    </div>
                    <p className="mt-2 text-[#162851]">Your registration has been approved. Please complete your payment to secure your spot.</p>
                    <Button onClick={handlePayNow} className="mt-4 bg-[#66cada] hover:bg-[#4fa8b8] text-[#162851] font-semibold transition-colors duration-200">
                      Pay Now
                    </Button>
                  </motion.div>
                )}
                <div id="payment-form-container" className="mt-4"></div>
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    className="bg-[#66cada] hover:bg-[#4fa8b8] text-[#162851] font-semibold transition-colors duration-200 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Registration
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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