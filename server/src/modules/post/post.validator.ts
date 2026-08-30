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

export const postStatusUpdateSchema = z.object({
  body: z.object({
    status: z.enum(["published", "draft"]),
  }),
});

export const publicPostListQuerySchema = z.object({
  body: z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(["newest", "oldest"]).default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(5),
  }),
});

export type PostSaveInput = z.infer<typeof postSaveSchema>["body"];
export type PostStatusUpdateInput = z.infer<typeof postStatusUpdateSchema>["body"];
export type PublicPostListQuery = z.infer<typeof publicPostListQuerySchema>["body"];

