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

export type Registration = z.infer<typeof registrationSchema>;
export type Payment = z.infer<typeof paymentSchema>;

export const commentSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  registrationId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
});

export type Comment = z.infer<typeof commentSchema>;