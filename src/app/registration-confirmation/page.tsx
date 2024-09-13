'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RegistrationConfirmation() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registration Successful</h1>
      <p className="mb-4">Thank you for registering for the event, {session?.user?.name}!</p>
      <p className="mb-4">We&apos;ve sent a confirmation email to {session?.user?.email}.</p>
      <Button onClick={() => router.push('/')}>Return to Home</Button>
    </div>
  );
}