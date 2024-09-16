import React, { forwardRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PaymentStatus, TicketType } from '@prisma/client'

const formSchema = z.object({
  registrationId: z.string(),
  status: z.nativeEnum(PaymentStatus),
  ticketType: z.nativeEnum(TicketType).optional(),
  lastFourDigits: z.string().length(4).optional(),
  paymentDate: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
})

export type FormData = z.infer<typeof formSchema>

export const PaymentForm = forwardRef<HTMLFormElement, { onSubmit: (data: FormData) => void, initialData?: Partial<FormData> }>(
  ({ onSubmit, initialData }, ref) => {
    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData || {
        status: PaymentStatus.UNPAID,
      },
    })

    return (
      <Form {...form}>
        <form ref={ref} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="registrationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(PaymentStatus).map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    )
  }
)

PaymentForm.displayName = 'PaymentForm'