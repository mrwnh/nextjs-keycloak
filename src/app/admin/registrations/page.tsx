"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useToast } from "@/hooks/use-toast"
import { Slideover } from "@/components/Slideover"
import { Registration } from "@/lib/schemas"
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
import { RegistrationForm, FormData } from "@/components/AdminForm"

export default function AdminRegistrations() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [slideoverOpen, setSlideoverOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleStatusUpdate = useCallback(async (id: string, action: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/update-registration-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: action }),
      });

      if (response.ok) {
        const updatedRegistration = await response.json();
        setRegistrations(prevRegistrations =>
          prevRegistrations.map(reg =>
            reg.id === updatedRegistration.id ? { ...reg, status: updatedRegistration.status } : reg
          )
        );
        toast({
          title: "Success",
          description: `Registration status updated to ${updatedRegistration.status}`,
        });
      } else {
        throw new Error('Failed to update registration status');
      }
    } catch (error) {
      console.error('Error updating registration status:', error);
      toast({
        title: "Error",
        description: "Failed to update registration status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchRegistrations = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/registrations')
      if (response.ok) {
        const data = await response.json()
        const registrationsWithHandlers = data.map((reg: Registration) => ({
          ...reg,
          createdAt: new Date(reg.createdAt), // Convert string to Date object
          onNameClick: (registration: Registration) => {
            setSelectedRegistration(registration)
            setSlideoverOpen(true)
          },
          onStatusUpdate: (action: string) => handleStatusUpdate(reg.id, action),
          onDelete: (id: string) => handleDelete(id)
        }))
        setRegistrations(registrationsWithHandlers)
      } else {
        throw new Error('Failed to fetch registrations')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      })
    }
  }, [toast, handleStatusUpdate])

  const handleRegistrationUpdate = useCallback((updatedRegistration: Omit<Registration, 'payment'>) => {
    setIsLoading(true);
    fetch(`/api/admin/registrations/${updatedRegistration.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRegistration),
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update registration');
        return response.json();
      })
      .then((updated: Registration) => {
        setRegistrations(prevRegistrations =>
          prevRegistrations.map(reg =>
            reg.id === updated.id ? { ...reg, ...updated } : reg
          )
        );
        setSelectedRegistration(updated);
        toast({
          title: "Success",
          description: "Registration updated successfully",
        });
      })
      .catch(error => {
        console.error('Error updating registration:', error);
        toast({
          title: "Error",
          description: "Failed to update registration",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [toast]);

  const handleApprove = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/update-registration-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED' }),
      });
      if (!response.ok) throw new Error('Failed to approve registration');
      const updatedRegistration = await response.json();
      setRegistrations(prev => prev.map(reg => reg.id === id ? updatedRegistration : reg));
      return updatedRegistration;
    } catch (error) {
      console.error('Error approving registration:', error);
      toast({
        title: "Error",
        description: "Failed to approve registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleReject = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/update-registration-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'REJECTED' }),
      });
      if (!response.ok) throw new Error('Failed to reject registration');
      const updatedRegistration = await response.json();
      setRegistrations(prev => prev.map(reg => reg.id === id ? updatedRegistration : reg));
      return updatedRegistration;
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast({
        title: "Error",
        description: "Failed to reject registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleNewRegistration = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newRegistration = await response.json();
        setRegistrations(prev => [...prev, newRegistration]);
        toast({
          title: "Success",
          description: "New registration added successfully",
        });
        setIsModalOpen(false);
        fetchRegistrations(); // Refresh the registrations list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add new registration');
      }
    } catch (error) {
      console.error('Error adding new registration:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add new registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/admin/login');
    } else if (status === "authenticated" && session?.user) {
      fetchRegistrations();
    }
  }, [status, session, router, fetchRegistrations]);

  const handleBulkAction = async (action: string, selectedRows: Registration[]) => {
    setIsLoading(true)
    try {
      if (action === "delete") {
        const promises = selectedRows.map(row => handleDelete(row.id))
        await Promise.all(promises)
        toast({
          title: "Success",
          description: "Selected registrations deleted successfully",
        })
      } else {
        const promises = selectedRows.map(row => 
          fetch('/api/admin/update-registration-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: row.id, status: action }),
          })
        )
        
        const results = await Promise.all(promises)
        const allSuccessful = results.every(response => response.ok)

        if (allSuccessful) {
          toast({
            title: "Success",
            description: `Bulk action '${action}' completed successfully`,
          })
          fetchRegistrations() // Refresh the data
        } else {
          throw new Error('Failed to perform bulk action')
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to perform bulk action: ${action}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/delete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete registration');
      }
      setRegistrations(prev => prev.filter(reg => reg.id !== id));
      toast({
        title: "Success",
        description: "Registration deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Registrations</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New Registration</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Registration</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new registration. Click submit when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto py-4">
              <RegistrationForm onSubmit={handleNewRegistration} ref={formRef} />
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
        columns={columns as ColumnDef<Registration, unknown>[]} 
        data={registrations} 
        onBulkAction={handleBulkAction} 
      />
      <Slideover 
        isOpen={slideoverOpen} 
        onClose={() => setSlideoverOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onUpdate={(updatedRegistration: any) => handleRegistrationUpdate(updatedRegistration)}
        isLoading={isLoading}
        registration={selectedRegistration as Registration}
      />
    </div>
  )
}