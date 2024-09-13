'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RegistrationForm } from './form';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Briefcase, Award, Building } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-[#66cada] text-[#162851] hover:cursor-default hover:bg-[#4fa8b8]';
      case 'rejected':
        return 'bg-red-100 text-black-800 hover:cursor-default hover:bg-red-200';
      case 'pending':
        return 'bg-yellow-100 text-[#162851] hover:cursor-default hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-[#162851] hover:cursor-default hover:bg-gray-200';
    }
  };

  return (
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
              initialData={currentRegistration}
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
                <AvatarImage src={currentRegistration.imageUrl} alt="Profile" />
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
                <div className="flex items-center space-x-3">
                  <Phone className="text-[#66cada]" />
                  <div>
                    <p className="text-sm text-[#a2a5ae]">Phone</p>
                    <p className="font-semibold text-[#162851] dark:text-white">{currentRegistration.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="text-[#66cada]" />
                  <div>
                    <p className="text-sm text-[#a2a5ae]">City</p>
                    <p className="font-semibold text-[#162851] dark:text-white">{currentRegistration.city}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Award className="text-[#66cada]" />
                  <div>
                    <p className="text-sm text-[#a2a5ae]">Registration Type</p>
                    <p className="font-semibold text-[#162851] dark:text-white">{currentRegistration.registrationType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="text-[#66cada]" />
                  <div>
                    <p className="text-sm text-[#a2a5ae]">Company</p>
                    <p className="font-semibold text-[#162851] dark:text-white">{currentRegistration.company}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="text-[#66cada]" />
                  <div>
                    <p className="text-sm text-[#a2a5ae]">Designation</p>
                    <p className="font-semibold text-[#162851] dark:text-white">{currentRegistration.designation}</p>
                  </div>
                </div>
              </div>
            </div>
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
  );
}