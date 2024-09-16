"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, CheckCircle, XCircle, Edit, Save, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Registration,
  PaymentStatusType,
  RegistrationStatusType,
  TicketTypeType,
} from "@/lib/schemas";
import { PhoneInput } from "@/components/ui/phone-input";
import { formatDate } from "@/utils/dateFormatter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

type SlideoverProps = {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<Registration>;
  onReject: (id: string) => Promise<Registration>;
  onUpdate: (updatedRegistration: Registration) => void;
  isLoading: boolean;
  registration: Registration | null;
};

export const Slideover = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  onUpdate,
  isLoading,
  registration,
}: SlideoverProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRegistration, setEditedRegistration] =
    useState<Registration | null>(null);
  const [newComment, setNewComment] = useState("");
  const [selectedTicketType, setSelectedTicketType] =
    useState<TicketTypeType | null>(null);

  useEffect(() => {
    if (registration && isOpen) {
      console.log("Fetching payment info for registration:", registration.id);
      fetchPaymentInfo(registration.id);
    }
  }, [registration, isOpen]);

  const fetchPaymentInfo = async (registrationId: string) => {
    try {
      const response = await fetch(`/api/payments/${registrationId}`);
      if (response.ok) {
        const paymentData = await response.json();
        if (paymentData) {
          console.log("Fetched payment data:", paymentData);
          setEditedRegistration((prev) =>
            prev ? { ...prev, payment: paymentData } : null
          );
        }
      }
    } catch (error) {
      console.error("Error fetching payment info:", error);
    }
  };

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
      const { payment, ...registrationData } = editedRegistration;
      await onUpdate(registrationData);
      setEditedRegistration(editedRegistration);
      setIsEditing(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditedRegistration((prev) =>
      prev ? { ...prev, [e.target.name]: e.target.value } : null
    );
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedRegistration((prev) => {
      if (!prev) return null;
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Registration] as object),
            [child]: value,
          },
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
        authorName: "Current User",
        createdAt: new Date(),
        updatedAt: new Date(),
        registrationId: editedRegistration.id,
        authorId: "current-user-id",
      };
      setEditedRegistration((prev) =>
        prev
          ? {
              ...prev,
              comments: [...(prev.comments || []), newCommentObj],
            }
          : null
      );
      setNewComment("");
    }
  };

  const handlePaymentRequest = async () => {
    if (!selectedTicketType || !editedRegistration) return;

    try {
      const checkResponse = await fetch(
        `/api/payments/${editedRegistration.id}`
      );
      if (checkResponse.ok) {
        const existingPayment = await checkResponse.json();
        if (existingPayment) {
          setEditedRegistration((prev) =>
            prev ? { ...prev, payment: existingPayment } : null
          );
          toast({
            title: "Existing Payment Found",
            description:
              "A payment request already exists for this registration.",
            type: "background",
            variant: "destructive",
          });
          return;
        }
      }

      const response = await fetch("/api/create-payment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: editedRegistration.id,
          ticketType: selectedTicketType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment request");
      }

      const data = await response.json();
      setEditedRegistration((prev) =>
        prev
          ? {
              ...prev,
              payment: data.payment,
            }
          : null
      );
      setSelectedTicketType(null);
      toast({
        title: "Success",
        description: "Payment request created successfully",
      });
    } catch (error) {
      console.error("Error handling payment request:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to handle payment request",
        variant: "destructive",
      });
    }
  };

  const handleEditPayment = async () => {
    if (!editedRegistration || !selectedTicketType) return;
    try {
      const response = await fetch(`/api/payments/${editedRegistration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketType: selectedTicketType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update payment request");
      }

      const updatedPayment = await response.json();
      setEditedRegistration((prev) =>
        prev
          ? {
              ...prev,
              payment: updatedPayment,
            }
          : null
      );
      setSelectedTicketType(null);
      toast({
        title: "Success",
        description: "Payment request updated successfully",
      });
    } catch (error) {
      console.error("Error updating payment request:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update payment request",
        variant: "destructive",
      });
    }
  };

  if (!registration) return null;

  const getStatusColor = (status: RegistrationStatusType) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatusType) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-red-100 text-red-800";
      case "WAIVED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl dark:bg-slate-900">
                    <div className="sticky top-0 z-10 px-4 sm:px-6 py-6 bg-gray-50 dark:bg-slate-800">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                          Registration Details
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center gap-4">
                          {isEditing ? (
                            <Button
                              onClick={handleSave}
                              variant="outline"
                              className="flex items-center"
                            >
                              <Save className="mr-2 h-4 w-4" />
                              Save
                            </Button>
                          ) : (
                            <Button
                              onClick={handleEdit}
                              variant="outline"
                              className="flex items-center"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          )}
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
                    <div className="flex-1 px-4 sm:px-6 py-6">
                      <Card className="mb-6">
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-4 z-0">
                            <Avatar className="h-24 w-24">
                              <AvatarImage
                                src={registration.imageUrl ?? ""}
                                alt={`${registration.firstName} ${registration.lastName}`}
                              />
                              <AvatarFallback className="text-2xl font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                                {registration.firstName[0]}
                                {registration.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
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
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {registration.email}
                              </p>
                              <div className="mt-2 flex space-x-2">
                                <Badge
                                  variant="secondary"
                                  className={getStatusColor(
                                    registration.status
                                  )}
                                >
                                  {registration.status}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className={getPaymentStatusColor(
                                    editedRegistration?.payment?.status ??
                                      "UNPAID"
                                  )}
                                >
                                  {editedRegistration?.payment
                                    ? `${editedRegistration.payment.status} - ${editedRegistration.payment.ticketType}`
                                    : "NO PAYMENT"}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              {registration.qrCodeUrl ? (
                                <Image
                                  src={registration.qrCodeUrl}
                                  alt="QR Code"
                                  width={100}
                                  height={100}
                                  className="rounded-md"
                                />
                              ) : (
                                <div className="w-[100px] h-[100px] bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    No QR Code
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Registration Information</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                              {[
                                {
                                  label: "Registration Type",
                                  name: "registrationType" as keyof Registration,
                                },
                                {
                                  label: "Company",
                                  name: "company" as keyof Registration,
                                },
                                {
                                  label: "Designation",
                                  name: "designation" as keyof Registration,
                                },
                                {
                                  label: "City",
                                  name: "city" as keyof Registration,
                                },
                                {
                                  label: "Phone Number",
                                  name: "phoneNumber" as keyof Registration,
                                },
                                {
                                  label: "Created At",
                                  name: "createdAt" as keyof Registration,
                                  readOnly: true,
                                },
                              ].map((field) => (
                                <div key={field.name} className="space-y-2">
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {field.label}
                                  </label>
                                  {isEditing && !field.readOnly ? (
                                    field.name === "registrationType" ? (
                                      <Select
                                        name={field.name}
                                        value={
                                          editedRegistration?.[
                                            field.name
                                          ] as string
                                        }
                                        onValueChange={(value) =>
                                          handleSelectChange(field.name, value)
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue
                                            placeholder={`Select ${field.label.toLowerCase()}`}
                                          />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {[
                                            "SPONSOR",
                                            "SPEAKER",
                                            "MEDIA",
                                            "VISITOR",
                                            "OTHERS",
                                          ].map((type) => (
                                            <SelectItem key={type} value={type}>
                                              {type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : field.name === "phoneNumber" ? (
                                      <PhoneInput
                                        name={field.name}
                                        value={
                                          editedRegistration?.[
                                            field.name
                                          ] as string
                                        }
                                        onChange={(value) =>
                                          handleSelectChange(field.name, value)
                                        }
                                      />
                                    ) : (
                                      <Input
                                        name={field.name}
                                        value={
                                          editedRegistration?.[
                                            field.name
                                          ] as string
                                        }
                                        onChange={handleInputChange}
                                      />
                                    )
                                  ) : (
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                      {field.name === "createdAt"
                                        ? formatDate(
                                            registration[field.name] as Date
                                          )
                                        : (registration[field.name] as string)}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                            <CardDescription>
                              Manage payment status and ticket type
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {editedRegistration?.payment ? (
                                <>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                      Payment Status
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                      {editedRegistration.payment.status}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                      Ticket Type
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                      {editedRegistration.payment.ticketType}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                      Amount
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                      {editedRegistration.payment.amount}{" "}
                                      {editedRegistration.payment.currency}
                                    </p>
                                  </div>
                                  <Select
                                    value={selectedTicketType || ""}
                                    onValueChange={(value) =>
                                      setSelectedTicketType(
                                        value as TicketTypeType
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select new ticket type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[
                                        "ONE_DAY",
                                        "TWO_DAY",
                                        "FULL",
                                        "FREE",
                                        "VVIP",
                                        "VIP",
                                        "PASS",
                                      ].map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type.replace("_", " ")}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    onClick={handleEditPayment}
                                    disabled={!selectedTicketType}
                                  >
                                    Update Payment Request
                                  </Button>
                                </>
                              ) : (
                                <div className="space-y-4">
                                  <Select
                                    value={selectedTicketType || ""}
                                    onValueChange={(value) =>
                                      setSelectedTicketType(
                                        value as TicketTypeType
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select ticket type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[
                                        "ONE_DAY",
                                        "TWO_DAY",
                                        "FULL",
                                        "FREE",
                                        "VVIP",
                                        "VIP",
                                        "PASS",
                                      ].map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type.replace("_", " ")}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    onClick={handlePaymentRequest}
                                    disabled={
                                      !selectedTicketType ||
                                      editedRegistration?.status !== "APPROVED"
                                    }
                                  >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    {editedRegistration?.payment
                                      ? "View Payment Request"
                                      : "Create Payment Request"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Comments</CardTitle>
                            <CardDescription>
                              Add or view comments about this registration
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {editedRegistration?.comments?.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="bg-gray-50 p-3 rounded-lg"
                                >
                                  <p className="text-sm">{comment.content}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    By {comment.authorName} on{" "}
                                    {formatDate(comment.createdAt)}
                                  </p>
                                </div>
                              ))}
                              <div className="mt-4">
                                <Textarea
                                  value={newComment}
                                  onChange={(e) =>
                                    setNewComment(e.target.value)
                                  }
                                  placeholder="Add a comment..."
                                  className="mb-2"
                                />
                                <Button
                                  onClick={handleAddComment}
                                  variant="outline"
                                >
                                  Add Comment
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    <div className="sticky bottom-0 z-10">
                    <div className="flex flex-shrink-0 justify-end items-center px-4 py-4 bg-gray-50 space-x-3 dark:bg-slate-800">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={async () => {
                                if (editedRegistration) {
                                  const updatedRegistration = await onApprove(
                                    editedRegistration.id
                                  );
                                  setEditedRegistration(updatedRegistration);
                                }
                              }}
                              variant="default"
                              disabled={
                                isLoading || registration.status === "APPROVED"
                              }
                              className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-900 dark:hover:bg-green-800 dark:text-white"
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
                          </TooltipTrigger>
                          <TooltipContent>
                            {registration.status === "APPROVED"
                              ? "Registration already approved"
                              : "Approve this registration"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={async () => {
                                if (editedRegistration) {
                                  const updatedRegistration = await onReject(
                                    editedRegistration.id
                                  );
                                  setEditedRegistration(updatedRegistration);
                                }
                              }}
                              variant="destructive"
                              disabled={
                                isLoading || registration.status === "REJECTED"
                              }
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
                          </TooltipTrigger>
                          <TooltipContent>
                            {registration.status === "REJECTED"
                              ? "Registration already rejected"
                              : "Reject this registration"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
  );
};
