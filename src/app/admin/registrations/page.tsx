"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { columns } from "./columns/page"
import { DataTable } from "./data-table/page"
import { useToast } from "@/hooks/use-toast"
import { Slideover } from "@/components/Slideover"
import { type Registration } from "@/types/registration";
import { ColumnDef } from '@tanstack/react-table'


export default function AdminRegistrations() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [slideoverOpen, setSlideoverOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
          description: `Registration ${action}d successfully`,
        });
      } else {
        throw new Error('Failed to update registration status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} registration`,
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
          onNameClick: (registration: Registration) => {
            setSelectedRegistration(registration)
            setSlideoverOpen(true)
          },
          onStatusUpdate: (action: string) => handleStatusUpdate(reg.id, action)
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

  const handleRegistrationUpdate = useCallback((updatedRegistration: Registration) => {
    setIsLoading(true);
    fetch(`/api/admin/registrations/${updatedRegistration.id}`, {
      method: 'PUT',
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/api/auth/signin?callbackUrl=/admin/registrations')
    } else if (status === "authenticated" && session?.user) {
      fetchRegistrations()
    }
  }, [status, session, router, fetchRegistrations])

  const handleBulkAction = async (action: string, selectedRows: Registration[]) => {
    setIsLoading(true)
    try {
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

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">All Registrations</h1>
      <DataTable columns={columns as ColumnDef<Registration, unknown>[]} data={registrations} onBulkAction={handleBulkAction} />
      <Slideover 
        isOpen={slideoverOpen} 
        onClose={() => setSlideoverOpen(false)}
        onApprove={() => handleStatusUpdate(selectedRegistration?.id ?? "", "approve")}
        onReject={() => handleStatusUpdate(selectedRegistration?.id ?? "", "reject")}
        onUpdate={(updatedRegistration: any) => handleRegistrationUpdate(updatedRegistration)}
        isLoading={isLoading}
        registration={selectedRegistration}
      />
    </div>
  )
}