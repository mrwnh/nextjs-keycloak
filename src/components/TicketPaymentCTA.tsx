import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ticket, DollarSign, AlertCircle, Download, QrCode, Receipt } from "lucide-react"

interface TicketPaymentProps {
  ticketType: string
  amount: number
  currency: string
  paymentStatus: 'PAID' | 'UNPAID'
  onPayNow: () => void
  onDownloadReceipt: () => void
  onDownloadTicket: () => void
  onDownloadQRCode: () => void
}

export default function TicketPaymentCTA({ 
  ticketType, 
  amount, 
  currency, 
  paymentStatus, 
  onPayNow,
  onDownloadReceipt,
  onDownloadTicket,
  onDownloadQRCode
}: TicketPaymentProps) {
  return (
    <Card className="w-full">
      <CardHeader className="bg-[#162851] text-white">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="h-6 w-6" />
          Your Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-[#a2a5ae]">Ticket Type</span>
          <span className="font-semibold text-[#162851]">{ticketType}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-[#a2a5ae]">Amount</span>
          <span className="font-semibold text-[#162851] flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-[#66cada]" />
            {amount} {currency}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-[#a2a5ae]">Payment Status</span>
          <Badge 
            variant={paymentStatus === 'PAID' ? 'default' : 'destructive'}
            className={`font-semibold ${
              paymentStatus === 'PAID' 
                ? 'bg-[#66cada] text-[#162851] hover:bg-[#4fa8b8]' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            {paymentStatus.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4 p-6">
        {paymentStatus === 'UNPAID' ? (
          <>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-r-md flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Your ticket is reserved but not yet confirmed. Please complete your payment to secure your spot.
              </p>
            </div>
            <Button 
              onClick={onPayNow} 
              className="w-full bg-[#66cada] hover:bg-[#4fa8b8] text-[#162851] font-semibold"
            >
              Pay Now
            </Button>
          </>
        ) : (
          <>
            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-r-md flex items-start">
              <Ticket className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                Your ticket is confirmed. You can now download your receipt, ticket, and QR code.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={onDownloadReceipt} 
                variant="outline" 
                className="flex flex-col items-center justify-center h-20 text-[#162851] border-[#66cada] hover:bg-[#66cada] hover:text-white"
              >
                <Receipt className="h-6 w-6 mb-1" />
                <span className="text-xs">Receipt</span>
              </Button>
              <Button 
                onClick={onDownloadTicket} 
                variant="outline" 
                className="flex flex-col items-center justify-center h-20 text-[#162851] border-[#66cada] hover:bg-[#66cada] hover:text-white"
              >
                <Download className="h-6 w-6 mb-1" />
                <span className="text-xs">Ticket</span>
              </Button>
              <Button 
                onClick={onDownloadQRCode} 
                variant="outline" 
                className="flex flex-col items-center justify-center h-20 text-[#162851] border-[#66cada] hover:bg-[#66cada] hover:text-white"
              >
                <QrCode className="h-6 w-6 mb-1" />
                <span className="text-xs">QR Code</span>
              </Button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  )
}