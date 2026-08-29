import { z } from "zod";

export const postSaveSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    title: z.string(),
    dek: z.string(),
    category: z.string(),
    status: z.enum(["draft", "published"]),
    heroImage: z.string().optional(),
    content: z.string(), // JSON.stringify'd ContentBlock[] from the frontend
  }),
});

export type PostSaveInput = z.infer<typeof postSaveSchema>["body"];
