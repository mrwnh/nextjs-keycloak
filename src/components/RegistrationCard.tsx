'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RegistrationForm } from './form';

export default function RegistrationCard({ registration, onUpdate }: { registration: any, onUpdate: (updatedRegistration: any) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState(registration);

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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Registration Details</CardTitle>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <RegistrationForm
            initialData={currentRegistration}
            onSubmit={handleUpdate}
            isEmailDisabled={true}
          />
        ) : (
          <div className="space-y-2">
            <p><strong>Registration Type:</strong> {currentRegistration.registrationType}</p>
            <p><strong>Name:</strong> {currentRegistration.firstName} {currentRegistration.lastName}</p>
            <p><strong>Email:</strong> {currentRegistration.email}</p>
            <p><strong>Phone Number:</strong> {currentRegistration.phoneNumber}</p>
            <p><strong>Company:</strong> {currentRegistration.company}</p>
            <p><strong>Designation:</strong> {currentRegistration.designation}</p>
            <p><strong>City:</strong> {currentRegistration.city}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}