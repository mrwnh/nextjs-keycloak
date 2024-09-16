import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, XCircle, ArrowUpDown, Copy } from "lucide-react"
import { formatDate } from "@/utils/dateFormatter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"

export type RegistrationStatus = "APPROVED" | "REJECTED" | "PENDING"
export type PaymentStatus = "PAID" | "UNPAID" | "WAIVED" | "REFUNDED"

export type Registration = {
  imageUrl: string
  id: string
  registrationType: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  company: string
  designation: string
  city: string
  status: RegistrationStatus
  paymentStatus: PaymentStatus
  createdAt: Date
  onNameClick: (registration: Registration) => void
  onStatusUpdate: (status: RegistrationStatus) => void
}

const getStatusColor = (status: RegistrationStatus) => {
  switch (status) {
    case "APPROVED":
      return "default"
    case "REJECTED":
      return "destructive"
    case "PENDING":
      return "secondary"
    default:
      return "default"
  }
}

export const columns: ColumnDef<Registration>[] = [
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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const registration = row.original
      return (
        <div className="flex items-center space-x-2">
          <Avatar className="h-4 w-4">
            <AvatarImage src={registration.imageUrl || ''} alt={`${registration.firstName} ${registration.lastName}`} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <Button 
            variant="link" 
            onClick={() => registration.onNameClick(registration)}
            className="p-0 h-auto font-normal capitalize"
          >
            {registration.firstName} {registration.lastName}
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="link" 
                className="p-0 font-normal"
                onClick={(e) => {
                  e.stopPropagation() // Prevent row click
                  navigator.clipboard.writeText(email)
                  toast({
                    title: "Email Copied",
                    description: "The email address has been copied to your clipboard.",
                  })
                }}
              >
                <span className="flex items-center">
                  {email}
                  <Copy className="ml-2 h-4 w-4 text-muted-foreground" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to copy email</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => {
      const phoneNumber = row.getValue("phoneNumber") as string
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className="p-0 font-normal"
                onClick={(e) => {
                  e.stopPropagation() // Prevent row click
                  navigator.clipboard.writeText(phoneNumber)
                  toast({
                    title: "Phone Number Copied",
                    description: "The phone number has been copied to your clipboard.",
                  })
                }}
              >
                <span className="flex items-center">
                  {phoneNumber}
                  <Copy className="ml-2 h-4 w-4 text-muted-foreground" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to copy phone number</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },{
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => {
      const city = row.getValue("city") as string
      return <div>{city}</div>
    },
  },
  {
    accessorKey: "registrationType",
    header: "Type",
    cell: ({ row }) => {
      const registrationType = row.getValue("registrationType") as string
      return (
        <Badge variant="secondary">
          <span className="capitalize-first">{registrationType}</span>
          </Badge>
      )
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
      const status = row.getValue("status") as RegistrationStatus
      return (
        <Badge  variant={getStatusColor(status) as "default" | "secondary" | "destructive" | "outline" | null | undefined}>
          <span className="capitalize-first">{status}</span>
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date
      return <div>{formatDate(createdAt)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const registration = row.original

      return (
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(registration.id)}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Copy ID</span>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy registration ID</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => registration.onStatusUpdate("APPROVED")}
                  className="h-8 w-8 p-0"
                  disabled={registration.status === "APPROVED"}
                >
                  <span className="sr-only">Approve</span>
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Approve registration</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => registration.onStatusUpdate("REJECTED")}
                  className="h-8 w-8 p-0"
                  disabled={registration.status === "REJECTED"}
                >
                  <span className="sr-only">Reject</span>
                  <XCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reject registration</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
  },
]