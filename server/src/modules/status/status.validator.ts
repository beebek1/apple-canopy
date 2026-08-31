import { z } from "zod";

export const statusUpsertSchema = z.object({
  params: z.object({
    slot: z.coerce.number().int().min(1).max(3),
  }),
  body: z.object({
    category: z.string().trim().min(1, "Category is required").max(30),
    heading: z
      .string()
      .trim()
      .min(1, "Heading is required")
      .max(50, "Heading can't exceed 50 characters"),
    body: z.string().trim().min(1, "Write something for the body").max(500),
    bodyType: z.enum(["paragraph", "quote"]).default("paragraph"),
  }),
});

export type StatusUpsertInput = z.infer<typeof statusUpsertSchema>;
