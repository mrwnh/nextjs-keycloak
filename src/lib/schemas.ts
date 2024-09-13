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
  id: z.string(),
  registrationType: z.enum(["Visitor", "Sponsor", "Speaker", "Media"]),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  company: z.string(),
  designation: z.string(),
  city: z.string(),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  imageUrl: z.string().nullable(),
  qrCodeUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  payment: paymentSchema.nullable(),
  comments: z.array(z.object({
    id: z.string(),
    content: z.string(),
    authorName: z.string(),
    createdAt: z.date(),
  })).optional(),
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