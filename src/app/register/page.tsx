'use client';

import { useSession } from "next-auth/react";
import { SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import RegistrationCard from "@/components/RegistrationCard";
import { RegistrationForm } from "@/components/form";

export default function Register() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [registration, setRegistration] = useState(null);
  const { theme, setTheme } = useTheme();
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const [firstName, ...lastNameParts] = (session.user.name || "").split(" ");
      const initialData = {
        registrationType: "Visitor",
        firstName,
        lastName: lastNameParts.join(" "),
        email: session.user.email || "",
        phoneNumber: "",
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
  }, [status, session]);

  const formSchema = z.object({
    registrationType: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(),
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

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (status !== "authenticated") {
    router.push("/api/auth/signin");
    return null;
  }

  if (registration) {
    return (
      <div className={`container mx-auto p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <RegistrationCard 
          registration={registration} 
          onUpdate={(updatedRegistration: SetStateAction<null>) => setRegistration(updatedRegistration)}
        />
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Register for Event</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRTL(!isRTL)}
            >
              {isRTL ? "LTR" : "RTL"}
            </Button>
          </div>
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
    </div>
  );
}