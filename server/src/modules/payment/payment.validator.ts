import { z } from "zod";

const MAX_AMOUNT_CENTS = 99_999_999;

export const createCheckoutSessionSchema = z.object({
  body: z.object({
    donorName: z
      .string("donorName is required")
      .trim()
      .min(1, "donorName is required")
      .max(255, "donorName is too long"),

    amount: z
      .number("Amount must be a number")
      .int("Amount must be an integer (in cents)")
      .min(50, "Amount is below Stripe minimum")
      .max(MAX_AMOUNT_CENTS, "Amount exceeds the maximum allowed donation"),

    currency: z.string().optional().default("usd"),

    donorEmail: z.string().email("donorEmail must be a valid email").optional(),

    note: z
      .string()
      .trim()
      .max(50, "note must be 50 characters or less")
      .optional(),
  }),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>["body"];