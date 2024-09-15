'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import RegistrationCard from "@/components/RegistrationCard";
import { RegistrationForm } from "@/components/form";
import { RegistrationFormSkeleton } from "@/components/register-skeleton";
import { Registration, registrationSchema, RegistrationStatus, PaymentStatus, TicketType } from "@/lib/schemas";
import TicketPaymentCTA from "@/components/TicketPaymentCTA";
import { toast } from "@/hooks/use-toast";
import { formSchema } from "@/components/form";

export default function Register() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isRTL, setIsRTL] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin?callbackUrl=/register");
    } else if (status === "authenticated" && session?.user) {
      fetch('/api/check-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.registration) {
            setRegistration(data.registration);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error checking registration:', error);
          setIsLoading(false);
        });
    } else if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status, session, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!session) {
        console.error('User session is missing');
        return;
      }

      const registrationData = {
        ...values,
        qrCodeUrl: values.qrCodeUrl || null, // Set to null if not provided
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        const data = await response.json();
        setRegistration(data);
        router.push('/registration-confirmation');
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData.error);
        toast({
          title: "Registration Failed",
          description: errorData.error || "An error occurred during registration",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during registration:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`container mx-auto p-4 min-h-screen flex items-center justify-center bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
        <RegistrationFormSkeleton />
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4 min-h-screen flex items-center justify-center bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {status === "unauthenticated" ? (
        null 
      ) : registration ? (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
          <RegistrationCard 
            registration={registration} 
            onUpdate={(updatedRegistration) => setRegistration(updatedRegistration as Registration)}
          />
          <TicketPaymentCTA
            ticketType={registration.payment?.ticketType || null}
            amount={registration.payment?.amount || null}
            currency={registration.payment?.currency || null}
            paymentStatus={registration.payment?.status || 'UNPAID'}
            registrationStatus={registration.status}
            registrationId={registration.id}
            onPayNow={() => {/* Implement payment logic */}}
            onDownloadReceipt={() => {/* Implement receipt download */}}
            onDownloadTicket={() => {/* Implement ticket download */}}
            onDownloadQRCode={() => {/* Implement QR code download */}}
          />
        </div>
      ) : (
        <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-primary mb-2">Register for RFF 2025</CardTitle>
            <CardDescription className="text-xl text-muted-foreground">
              Real Estate Future Forum: Shaping Dreams into Reality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegistrationForm
              initialData={{
                registrationType: "VISITOR",
                firstName: session?.user?.name?.split(" ")[0] || "",
                lastName: session?.user?.name?.split(" ").slice(1).join(" ") || "",
                email: session?.user?.email || "",
                imageUrl: "", // Added missing property
                phoneNumber: "",
                company: "",
                designation: "",
                city: "",
              }}
              onSubmit={onSubmit}
              isEmailDisabled={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}