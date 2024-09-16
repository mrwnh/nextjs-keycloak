import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, Trash } from "lucide-react"
import { formatDate } from "@/utils/dateFormatter"
import { PaymentStatus, TicketType } from "@prisma/client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"

export type Payment = {
  id: string
  registrationId: string
  status: PaymentStatus
  ticketType: TicketType | null
  lastFourDigits: string | null
  paymentDate: Date | null
  amount: number | null
  currency: string | null
  createdAt: Date
  updatedAt: Date
  onEdit: (payment: Payment) => void
  onDelete: (paymentId: string) => void
  registration: {
    firstName: string
    lastName: string
    email: string
  }
}

const getStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case "PAID":
      return "default"
    case "UNPAID":
      return "outline"
    case "WAIVED":
      return "secondary"
    case "REFUNDED":
      return "destructive"
    default:
      return "default"
  }
}

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorFn: (row) => `${row.registration.firstName} ${row.registration.lastName}`,
    header: "Name",
  },
  {
    accessorKey: "registration.email",
    header: "Email",
  },
  {
    accessorKey: "registrationId",
    header: "Registration ID",
    cell: ({ row }) => {
      const registrationId = row.getValue("registrationId") as string
      return registrationId.slice(0, 5)
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as PaymentStatus
      return (
        <Badge variant={getStatusColor(status)}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "ticketType",
    header: "Ticket Type",
    cell: ({ row }) => {
      const ticketType = row.getValue("ticketType") as TicketType | null
      return ticketType ? <div>{ticketType}</div> : <div>-</div>
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number | null
      const currency = row.getValue("currency") as string | null
      return amount && currency ? <div>{amount.toFixed(2)} {currency}</div> : <div>-</div>
    },
  },
  {
    accessorKey: "paymentDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Payment Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const paymentDate = row.getValue("paymentDate") as Date | null
      return paymentDate ? <div>{formatDate(paymentDate)}</div> : <div>-</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original
      return (
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => payment.onEdit(payment)}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Edit</span>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit payment</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => payment.onDelete(payment.id)}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Delete</span>
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete payment</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
  },
]