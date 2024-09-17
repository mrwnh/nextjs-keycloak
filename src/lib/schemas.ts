import { z } from "zod";

export const PaymentStatus = z.enum(["UNPAID", "PAID", "WAIVED", "REFUNDED"]);

export const RegistrationStatus = z.enum(["APPROVED", "REJECTED", "PENDING"]);

export const TicketType = z.enum(["FULL", "FREE", "VVIP", "VIP", "PASS", "ONE_DAY", "TWO_DAY"]);

export const RegistrationType = z.enum(["SPEAKER", "SPONSOR", "VISITOR", "MEDIA", "OTHERS"]);

export const paymentSchema = z.object({
  id: z.string(),
  status: PaymentStatus,
  ticketType: TicketType.nullable(),
  lastFourDigits: z.string().nullable(),
  paymentDate: z.date().nullable(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const registrationSchema = z.object({
  registrationType: z.enum(['SPEAKER', 'SPONSOR', 'VISITOR', 'MEDIA', 'OTHERS']),
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits."),
  company: z.string().min(2, "Company name must be at least 2 characters."),
  designation: z.string().min(2, "Designation must be at least 2 characters."),
  city: z.string().min(2, "City must be at least 2 characters."),
  status: RegistrationStatus.default("PENDING"),
  imageUrl: z.string().nullable(),
  qrCodeUrl: z.string().nullable(),
});

export const commentSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  registrationId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type CommentInput = z.infer<typeof commentSchema>;

export type Registration = RegistrationInput & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  payment?: Payment | null;
  comments?: Comment[];
};

export type Payment = PaymentInput & {
  registrationId: string;
  statusHistory?: PaymentStatusHistory[];
};

export type Comment = CommentInput;

export type RegistrationStatusHistory = {
  id: string;
  registrationId: string;
  status: z.infer<typeof RegistrationStatus>;
  changedAt: Date;
};

export type PaymentStatusHistory = {
  id: string;
  paymentId: string;
  status: z.infer<typeof PaymentStatus>;
  changedAt: Date;
};

export type PaymentStatusType = z.infer<typeof PaymentStatus>;
export type RegistrationStatusType = z.infer<typeof RegistrationStatus>;
export type TicketTypeType = z.infer<typeof TicketType>;
export type RegistrationTypeType = z.infer<typeof RegistrationType>;