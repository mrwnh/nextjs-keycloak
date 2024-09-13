'use client';

import { useSession } from "next-auth/react";
import { SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RegistrationCard from "@/components/RegistrationCard";
import { RegistrationForm } from "@/components/form";
import { RegistrationFormSkeleton } from "@/components/register-skeleton";

export default function Register() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registration, setRegistration] = useState(null);
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin?callbackUrl=/register");
    } else if (status === "authenticated" && session?.user) {
      const [firstName, ...lastNameParts] = (session.user.name || "").split(" ");
      const initialData = {
        registrationType: "Visitor",
        firstName,
        lastName: lastNameParts.join(" "),
        email: session.user.email || "",
        phoneNumber: "",
        imageUrl: "",
        company: "",
        designation: "",
        city: "",
      };

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
        })
        .catch(error => console.error('Error checking registration:', error));
    }
  }, [status, session, router]);

  const formSchema = z.object({
    registrationType: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(),
    imageUrl: z.string().optional(),
    company: z.string(),
    designation: z.string(),
    city: z.string(),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!session) {
        console.error('User session is missing');
        return;
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values), // This now includes the imageUrl
      });

      if (response.ok) {
        router.push('/registration-confirmation');
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData.error);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className={`container mx-auto p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      {status === "loading" ? (
        <RegistrationFormSkeleton />
      ) : status === "unauthenticated" ? (
        null // The useEffect will handle redirection
      ) : registration ? (
        <RegistrationCard 
          registration={registration} 
          onUpdate={(updatedRegistration) => setRegistration(updatedRegistration)}
        />
      ) : (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">Register for RFF 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <RegistrationForm
              initialData={{
                registrationType: "Visitor",
                firstName: session?.user?.name?.split(" ")[0] || "",
                lastName: session?.user?.name?.split(" ").slice(1).join(" ") || "",
                email: session?.user?.email || "",
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