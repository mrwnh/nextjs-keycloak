"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useToast } from "@/hooks/use-toast"
import { Payment as PrismaPayment } from "@prisma/client"
import { ColumnDef } from '@tanstack/react-table'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { PaymentForm, FormData } from "@/components/PaymentForm"

type Payment = PrismaPayment & {
  onEdit: (payment: Payment) => void;
  onDelete: (paymentId: string) => void;
  registration: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminPayments() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const fetchPayments = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        const paymentsWithHandlers = data.map((payment: PrismaPayment & { registration: { firstName: string; lastName: string; email: string } }) => ({
          ...payment,
          onEdit: (payment: Payment) => {
            setSelectedPayment(payment)
            setIsEditModalOpen(true)
          },
          onDelete: (paymentId: string) => {
            // Handle delete action here
            console.log('Delete payment:', paymentId)
            // You can implement the delete logic here
          }
        }))
        setPayments(paymentsWithHandlers)
      } else {
        throw new Error('Failed to fetch payments')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleNewPayment = async (data: FormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const newPayment = await response.json()
        setPayments(prev => [...prev, newPayment])
        toast({
          title: "Success",
          description: "New payment added successfully",
        })
        setIsModalOpen(false)
        fetchPayments() // Refresh the payments list
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add new payment')
      }
    } catch (error) {
      console.error('Error adding new payment:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add new payment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditPayment = async (data: FormData) => {
    if (!selectedPayment) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedPayment = await response.json()
        setPayments(prev => prev.map(p => p.id === updatedPayment.id ? {...updatedPayment, onEdit: p.onEdit, onDelete: p.onDelete} : p))
        toast({
          title: "Success",
          description: "Payment updated successfully",
        })
        setIsEditModalOpen(false)
        fetchPayments() // Refresh the payments list
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update payment')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update payment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkAction = async (action: string, selectedRows: Payment[]) => {
    setIsLoading(true);
    try {
      const promises = selectedRows.map(payment =>
        fetch(`/api/admin/payments/${payment.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: action }),
        })
      );
      
      const results = await Promise.all(promises);
      const allSuccessful = results.every(response => response.ok);

      if (allSuccessful) {
        toast({
          title: "Success",
          description: `Bulk action '${action}' completed successfully`,
        });
        fetchPayments(); // Refresh the data
      } else {
        throw new Error('Failed to perform bulk action');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to perform bulk action: ${action}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/admin/login')
    } else if (status === "authenticated" && session?.user) {
      fetchPayments()
    }
  }, [status, session, router, fetchPayments])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Payments</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New Payment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Payment</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new payment. Click submit when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto py-4">
              <PaymentForm onSubmit={handleNewPayment} ref={formRef} />
            </div>
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                onClick={() => formRef.current?.requestSubmit()}
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable 
        columns={columns as ColumnDef<Payment, unknown>[]} 
        data={payments} 
        onBulkAction={handleBulkAction}
      />
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>
              Update the payment details. Click submit when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto py-4">
            <PaymentForm onSubmit={handleEditPayment} ref={formRef} initialData={selectedPayment ? {
              registrationId: selectedPayment.registrationId,
              status: selectedPayment.status,
              ticketType: selectedPayment.ticketType ?? undefined,
              lastFourDigits: selectedPayment.lastFourDigits ?? undefined,
              paymentDate: selectedPayment.paymentDate?.toISOString().split('T')[0],
              amount: selectedPayment.amount?.toNumber(),
              currency: selectedPayment.currency ?? undefined,
            } : undefined} />
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}