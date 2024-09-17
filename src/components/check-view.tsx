'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, Edit, Save, UserIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

type CheckIn = {
  id: string
  checkedInAt: Date
  checkedInBy: string
}

type Registration = {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  company: string
  designation: string
  city: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  imageUrl?: string | null
  registrationType: string
  payment?: {
    status: 'PAID' | 'UNPAID' | 'WAIVED'
    ticketType: string | null
    amount: number | null
    currency: string | null
    paymentDate: string | null
  } | null
  checkIns: CheckIn[]
}

export default function CheckView({ registration: initialRegistration }: { registration: Registration }) {
  const [registration, setRegistration] = useState<Registration>(initialRegistration)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    setRegistration(initialRegistration)
  }, [initialRegistration])

  const canCheckIn = registration.status !== 'REJECTED' && 
    (registration.payment?.status === 'PAID' || registration.payment?.status === 'WAIVED')

  const getCheckInErrors = () => {
    const errors = []
    if (registration.payment?.status === 'UNPAID') {
      errors.push('Their ticket is unpaid')
    }
    if (registration.status === 'REJECTED') {
      errors.push('Their registration has been rejected')
    }
    return errors
  }

  const checkInErrors = getCheckInErrors()

  const isCheckedInToday = registration.checkIns.some(checkIn => 
    format(new Date(checkIn.checkedInAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  )

  const handleEdit = () => setIsEditing(true)

  const handleSave = async () => {
    setIsLoading(true)
    // Simulating API call to save changes
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsEditing(false)
    setIsLoading(false)
    toast({
      title: "Changes saved",
      description: "Registration details have been updated.",
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistration(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCheckIn = async (force = false) => {
    if ((!canCheckIn && !force) || !session?.user?.email) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: registration.id,
          userEmail: session.user.email,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to check in')
      }

      const newCheckIn = await response.json()
      setRegistration(prev => ({
        ...prev,
        status: 'APPROVED',
        checkIns: [...prev.checkIns, newCheckIn],
      }))
      toast({
        title: "Checked In",
        description: "Registration has been approved and checked in.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: Registration['status']) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTicketTypeColor = (ticketType: string | null) => {
    switch (ticketType) {
      case 'VIP': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'VVIP': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'VISITOR': return 'bg-green-100 text-green-800 border-green-300'
      case 'MEDIA': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-grow overflow-y-auto pb-20">
        <div className="container mx-auto p-4 space-y-6">
          {isCheckedInToday && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Checked In</AlertTitle>
              <AlertDescription>
                This user has already been checked in today.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardContent className="pt-6 relative">
              <div className="flex  items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={registration.imageUrl ?? ''} alt={`${registration.firstName} ${registration.lastName}`} />
                    <AvatarFallback>
                      <UserIcon className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <Input
                            name="firstName"
                            value={registration.firstName}
                            onChange={handleInputChange}
                            className="w-1/2"
                          />
                          <Input
                            name="lastName"
                            value={registration.lastName}
                            onChange={handleInputChange}
                            className="w-1/2"
                          />
                        </div>
                      ) : (
                        `${registration.firstName} ${registration.lastName}`
                      )}
                    </h2>
                    <p className="text-sm text-gray-500">{registration.email}</p>
                    <div className="mt-2">
                      <Badge variant="secondary" className={getStatusColor(registration.status)}>
                        {registration.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className={`absolute top-2 right-2 text-sm font-bold px-1 py-1 rounded-sm ${getTicketTypeColor(registration.registrationType ?? null)}`}>
                  {registration.registrationType || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          {checkInErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Check-in not allowed</AlertTitle>
              <AlertDescription>
                This user cannot be checked in because:
                <ul className="list-disc list-inside mt-2">
                  {checkInErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Registration Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Registration Type", name: "registrationType" },
                  { label: "Company", name: "company" },
                  { label: "Designation", name: "designation" },
                  { label: "City", name: "city" },
                  { label: "Phone Number", name: "phoneNumber" },
                ].map((field) => (
                  <div key={field.name} className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">{field.label}</label>
                    {isEditing ? (
                      <Input
                        name={field.name}
                        value={registration[field.name as keyof Registration] as string}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm">{registration[field.name as keyof Registration] as string}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {registration.payment && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Payment Status</label>
                    <p className="text-sm">{registration.payment.status}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Ticket Type</label>
                    <p className="text-sm">{registration.payment.ticketType || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-sm">
                      {registration.payment.amount 
                        ? `${registration.payment.amount} ${registration.payment.currency}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Payment Date</label>
                    <p className="text-sm">{registration.payment.paymentDate || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t">
        <div className="container mx-auto flex justify-between items-center">
          {isEditing ? (
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={handleEdit} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          <div className="flex space-x-2 w-2/3">
            {isCheckedInToday ? (
              <Button 
                disabled
                className="flex-grow h-12 text-lg"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Already Checked In
              </Button>
            ) : registration.payment?.status === 'UNPAID' ? (
              <Button 
                onClick={() => handleCheckIn(true)}
                variant="destructive"
                className="flex-grow h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full"></span>
                    Processing...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Check In Anyway
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => handleCheckIn()}
                disabled={isLoading || !canCheckIn}
                className="flex-grow h-12 text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full"></span>
                    Processing...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Check In
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}