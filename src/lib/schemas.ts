import { z } from "zod";

export const paymentSchema = z.object({
  id: z.string(),
  status: z.enum(["UNPAID", "PAID", "WAIVED"]),
  ticketType: z.string().nullable(),
  lastFourDigits: z.string().nullable(),
  paymentDate: z.date().nullable(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const registrationSchema = z.object({
  registrationType: z.enum(["Sponsor", "Speaker", "Media", "Visitor"]),
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits."),
  company: z.string().min(2, "Company name must be at least 2 characters."),
  designation: z.string().min(2, "Designation must be at least 2 characters."),
  city: z.string().min(2, "City must be at least 2 characters."),
  imageUrl: z.string().optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type Registration = RegistrationInput & {
  id: string;
  status: string;
  qrCodeUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  payment?: Payment;
  comments?: Comment[];
};

export type Payment = {
  id: string;
  status: 'UNPAID' | 'PAID' | 'WAIVED';
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