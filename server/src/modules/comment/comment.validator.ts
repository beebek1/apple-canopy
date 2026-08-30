import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    postId: z.string().min(1),
    authorName: z.string().min(1),
    content: z
      .string()
      .trim()
      .min(1, "Comment can't be empty")
      .max(2000, "Comment is too long"),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>["body"];
