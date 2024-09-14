'use client';

import { useSession } from "next-auth/react";
import { SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import RegistrationCard from "@/components/RegistrationCard";
import { RegistrationForm } from "@/components/form";
import { RegistrationFormSkeleton } from "@/components/register-skeleton";
import { Registration } from "@/lib/schemas";

export default function Register() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registration, setRegistration] = useState<Registration | null>(null);
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
        body: JSON.stringify(values),
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
    <div className={`container mx-auto p-4 min-h-screen flex items-center justify-center bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {status === "loading" ? (
        <RegistrationFormSkeleton />
      ) : status === "unauthenticated" ? (
        null // The useEffect will handle redirection
      ) : registration ? (
        <RegistrationCard 
          registration={registration} 
          onUpdate={(updatedRegistration) => setRegistration(updatedRegistration as Registration)}
        />
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