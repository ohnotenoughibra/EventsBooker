import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
});

export const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  duration_minutes: z.coerce
    .number()
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration cannot exceed 8 hours"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  max_capacity: z.coerce.number().min(1).optional().nullable(),
  instructor: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type MagicLinkFormData = z.infer<typeof magicLinkSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
