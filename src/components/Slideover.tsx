import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, CheckCircle, XCircle, User, Briefcase, MapPin, Phone, Calendar, CreditCard, Edit, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Registration, PaymentStatusType, RegistrationStatusType, TicketTypeType, RegistrationType } from "@/lib/schemas"
import { PhoneInput } from "@/components/ui/phone-input"
import { formatDate } from "@/utils/dateFormatter"

type SlideoverProps = {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onUpdate: (updatedRegistration: Registration) => void;
  isLoading: boolean;
  registration: Registration | null;
};

export const Slideover = ({ isOpen, onClose, onApprove, onReject, onUpdate, isLoading, registration }: SlideoverProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRegistration, setEditedRegistration] = useState<Registration | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showPaymentRequest, setShowPaymentRequest] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketTypeType | null>(null);

  useEffect(() => {
    if (registration) {
      setEditedRegistration({ ...registration });
    }
  }, [registration]);

  const handleEdit = () => {
    if (registration) {
      setEditedRegistration({ ...registration });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (editedRegistration) {
      const updatedRegistration = {
        ...editedRegistration,
        status: editedRegistration.status as RegistrationStatusType,
      };
      await onUpdate(updatedRegistration);
      setIsEditing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedRegistration(prev => prev ? { ...prev, [e.target.name]: e.target.value } : null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedRegistration(prev => {
      if (!prev) return null;
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Registration] as object),
            [child]: value
          }
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleAddComment = () => {
    if (newComment.trim() && editedRegistration) {
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment,
        authorName: 'Current User', 
        createdAt: new Date(),
        updatedAt: new Date(),
        registrationId: editedRegistration.id,
        authorId: 'current-user-id', // Replace with actual user ID
      };
      setEditedRegistration(prev => prev ? {
        ...prev,
        comments: [...(prev.comments || []), newCommentObj],
      } : null);
      setNewComment('');
    }
  };

  const handlePaymentRequest = async () => {
    if (!selectedTicketType) return;

    try {
      const response = await fetch('/api/create-payment-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: editedRegistration?.id,
          ticketType: selectedTicketType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment request');
      }

      const updatedRegistration = await response.json();
      setEditedRegistration(updatedRegistration);
      setShowPaymentRequest(false);
      setSelectedTicketType(null);
    } catch (error) {
      console.error('Error creating payment request:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  if (!registration) return null;

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'UNPAID': return 'bg-red-100 text-red-800';
      case 'WAIVED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col overflow-hidden bg-white shadow-xl">
                    <div className="px-4 sm:px-6 py-6 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-xl font-semibold leading-6 text-gray-900">
                          Registration Details
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="px-4 sm:px-6 py-6">
                        <Card className="mb-6">
                          <CardContent className="pt-6">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-24 w-24">
                                <AvatarImage src={registration.imageUrl ?? ''} alt={`${registration.firstName} ${registration.lastName}`} />
                                <AvatarFallback className="text-2xl font-semibold bg-indigo-100 text-indigo-800">
                                  {registration.firstName[0]}{registration.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                  {isEditing ? (
                                    <div className="flex space-x-2">
                                      <Input
                                        name="firstName"
                                        value={editedRegistration?.firstName}
                                        onChange={handleInputChange}
                                        className="w-1/2"
                                      />
                                      <Input
                                        name="lastName"
                                        value={editedRegistration?.lastName}
                                        onChange={handleInputChange}
                                        className="w-1/2"
                                      />
                                    </div>
                                  ) : (
                                    `${registration.firstName} ${registration.lastName}`
                                  )}
                                </h2>
                                <p className="text-sm text-gray-500">{registration.email}</p>
                                <div className="mt-2 flex space-x-2">
                                  <Badge variant="secondary" className={getStatusColor(registration.status)}>
                                    {registration.status.toUpperCase()}
                                  </Badge>
                                  <Badge variant="secondary" className={getPaymentStatusColor(editedRegistration?.payment?.status ?? 'UNPAID')}>
                                    {editedRegistration?.payment ? `${editedRegistration.payment.status} - ${editedRegistration.payment.ticketType}` : 'NO PAYMENT'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Tabs defaultValue="details" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="comments">Comments</TabsTrigger>
                          </TabsList>
                          <TabsContent value="details">
                            <Card>
                              <CardHeader>
                                <CardTitle>Registration Information</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Registration Type</label>
                                    {isEditing ? (
                                      <Select
                                        name="registrationType"
                                        value={editedRegistration?.registrationType}
                                        onValueChange={(value) => handleSelectChange('registrationType', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select registration type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="SPONSOR">Sponsor</SelectItem>
                                          <SelectItem value="SPEAKER">Speaker</SelectItem>
                                          <SelectItem value="MEDIA">Media</SelectItem>
                                          <SelectItem value="VISITOR">Visitor</SelectItem>
                                          <SelectItem value="OTHERS">Others</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <p className="text-sm text-gray-900">{registration.registrationType}</p>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Company</label>
                                    {isEditing ? (
                                      <Input
                                        name="company"
                                        value={editedRegistration?.company}
                                        onChange={handleInputChange}
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-900">{registration.company}</p>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Designation</label>
                                    {isEditing ? (
                                      <Input
                                        name="designation"
                                        value={editedRegistration?.designation}
                                        onChange={handleInputChange}
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-900">{registration.designation}</p>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">City</label>
                                    {isEditing ? (
                                      <Input
                                        name="city"
                                        value={editedRegistration?.city}
                                        onChange={handleInputChange}
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-900">{registration.city}</p>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                                    {isEditing ? (
                                      <PhoneInput
                                        name="phoneNumber"
                                        value={editedRegistration?.phoneNumber}
                                        onChange={(value) => handleInputChange({ target: { name: 'phoneNumber', value } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-900">{registration.phoneNumber}</p>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label htmlFor="payment.status" className="block text-sm font-medium text-gray-700">
                                        Payment Status
                                      </label>
                                      <Select
                                        name="payment.status"
                                        value={editedRegistration?.payment?.status || ''}
                                        onValueChange={(value) => handleSelectChange('payment.status', value)}
                                        disabled={!isEditing}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select payment status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="UNPAID">Unpaid</SelectItem>
                                          <SelectItem value="PAID">Paid</SelectItem>
                                          <SelectItem value="WAIVED">Waived</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label htmlFor="payment.ticketType" className="block text-sm font-medium text-gray-700">
                                        Ticket Type
                                      </label>
                                      <Select
                                        name="payment.ticketType"
                                        value={editedRegistration?.payment?.ticketType || ''}
                                        onValueChange={(value) => handleSelectChange('payment.ticketType', value)}
                                        disabled={!isEditing}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select ticket type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Full Access">Full Access</SelectItem>
                                          <SelectItem value="2 days">2 days</SelectItem>
                                          <SelectItem value="1 day">1 day</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Created At</label>
                                    <p className="text-sm text-gray-900">{formatDate(registration.createdAt)}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Updated At</label>
                                    <p className="text-sm text-gray-900">{formatDate(registration.updatedAt)}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          <TabsContent value="comments">
                            <Card>
                              <CardHeader>
                                <CardTitle>Comments</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {editedRegistration?.comments?.map((comment: { id: string; content: string; authorName: string; createdAt: Date }) => (
                                    <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                      <p className="text-sm">{comment.content}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        By {comment.authorName} on {formatDate(comment.createdAt)}
                                      </p>
                                    </div>
                                  ))}
                                  <div className="mt-4">
                                    <Textarea
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      placeholder="Add a comment..."
                                      className="mb-2"
                                    />
                                    <Button onClick={handleAddComment} variant="outline">
                                      Add Comment
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                        {editedRegistration?.status === 'APPROVED' && !editedRegistration.payment && (
                          <Card className="mt-6">
                            <CardHeader>
                              <CardTitle>Issue Payment Request</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {!showPaymentRequest ? (
                                <Button onClick={() => setShowPaymentRequest(true)}>
                                  Issue Payment Request
                                </Button>
                              ) : (
                                <div className="space-y-4">
                                  <Select
                                    value={selectedTicketType || ''}
                                    onValueChange={(value) => setSelectedTicketType(value as TicketTypeType)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select ticket type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1 day">1 day</SelectItem>
                                      <SelectItem value="2 days">2 days</SelectItem>
                                      <SelectItem value="Full Access">Full Access</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button onClick={handlePaymentRequest} disabled={!selectedTicketType}>
                                    Create Payment Request
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </ScrollArea>
                    <div className="flex flex-shrink-0 justify-between items-center px-4 py-4 bg-gray-50">
                      {isEditing ? (
                        <Button onClick={handleSave} variant="outline" className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      ) : (
                        <Button onClick={handleEdit} variant="outline" className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                      <div className="flex space-x-3">
                        <Button 
                          onClick={onApprove} 
                          variant="default"
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </span>
                          )}
                        </Button>
                        <Button 
                          onClick={onReject} 
                          variant="destructive"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}