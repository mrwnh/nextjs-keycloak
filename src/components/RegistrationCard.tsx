import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RegistrationForm } from '@/components/form';
import { PaymentConfirmationModal } from '@/components/payment-confirmation';
import { Registration, RegistrationStatus, PaymentStatus, TicketType } from '@/lib/schemas';
import { formatDate } from '@/utils/dateFormatter';
import { toast } from '@/hooks/use-toast';
import { User, Phone, MapPin, Award, Building, Briefcase, CreditCard, DollarSign, Calendar, Edit, AlertCircle } from 'lucide-react';

interface RegistrationCardProps {
  registration: Registration;
  onUpdate: (updatedRegistration: Registration) => void;
}

export default function RegistrationCard({ registration: initialRegistration, onUpdate }: RegistrationCardProps) {
  const [currentRegistration, setCurrentRegistration] = useState<Registration>(initialRegistration);
  const [isEditing, setIsEditing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{ amount: number; currency: string; lastFourDigits: string } | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resourcePath = urlParams.get('resourcePath');
    const id = urlParams.get('id');

    if (resourcePath && id) {
      fetch(`/api/payment-result?resourcePath=${resourcePath}&id=${id}`)
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
            toast({
              title: "Payment Failed",
              description: result.error || "An error occurred while processing the payment",
              variant: "destructive",
            });
          }
        })
        .catch(error => {
          console.error('Error processing payment result:', error);
          toast({
            title: "Error",
            description: "An unexpected error occurred while processing the payment",
            variant: "destructive",
          });
        });
    }
  }, [onUpdate]);

  const handleUpdate = async (values: Partial<Registration>) => {
    try {
      const response = await fetch('/api/update-registration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, id: currentRegistration.id }),
      });

      if (response.ok) {
        const updatedRegistration = await response.json();
        setCurrentRegistration(updatedRegistration);
        onUpdate(updatedRegistration);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Registration updated successfully",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update registration",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: typeof RegistrationStatus._type) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
        case 'PENDING':
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
          ticketType: currentRegistration.payment?.ticketType || 'FULL',
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
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment process",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="w-full mx-auto shadow-xl border-[#66cada] border-t-4 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
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
                    imageUrl: currentRegistration.imageUrl || '',
                    qrCodeUrl: currentRegistration.qrCodeUrl || '',
                    registrationType: currentRegistration.registrationType as "SPONSOR" | "SPEAKER" | "MEDIA" | "VISITOR" | "OTHERS"
                  }}
                  onSubmit={(data) => handleUpdate(data as Partial<Registration>)}
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
                    <AvatarImage src={currentRegistration.imageUrl || undefined} alt={`${currentRegistration.firstName} ${currentRegistration.lastName}`} />
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
                          ? formatDate(currentRegistration.payment.paymentDate)
                          : 'N/A'
                        } 
                      />
                    </div>
                  </div>
                </div>
                {currentRegistration.status === 'APPROVED' && currentRegistration.payment?.status === 'UNPAID' && (
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
        isOpen={isPaymentModalOpen && paymentDetails !== null}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentDetails={paymentDetails || { amount: 0, currency: '', lastFourDigits: '' }}
      />
    </>
  );
}