'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function RegistrationConfirmation() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-lg text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Registration Successful</CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-2">
            Thank you for registering for the Real Estate Future Forum 2025!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            We&apos;re excited to have you join us, {session?.user?.name}!
          </p>
          <p className="text-lg text-muted-foreground">
            A confirmation email has been sent to {session?.user?.email}.
          </p>
          <p className="text-lg text-muted-foreground">
            Please check your inbox for further details and next steps.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push('/')} size="lg">
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}