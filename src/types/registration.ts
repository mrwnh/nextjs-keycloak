export type Registration = {
  id: string;
  registrationType: "Visitor" | "Sponsor" | "Speaker" | "Media";
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  company: string;
  designation: string;
  city: string;
  status: "pending" | "approved" | "rejected";
  imageUrl: string | null;
  qrCodeUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  payment?: Payment;
  comments?: Comment[];
};

export type Payment = {
  id: string;
  status: 'Unpaid' | 'Paid' | 'Waived';
  ticketType: string | null;
  lastFourDigits: string | null;
  paymentDate: Date | null;
  amount: number | null;
  currency: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  registrationId: string;
  authorId: string;
  authorName: string;
};