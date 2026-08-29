import { z } from "zod";


export const authLoginSchema = z.object({
  body: z.object({
    username: z.string(),
    password: z
      .string()
      .min(8, "password too short")
      .max(30, "password too long"),
  }),
});

export const authRegisterUserSchema = z.object({
  body: z.object({
    password: z.string(),
    username: z.string()
  }),
});

export type LoginInput = z.infer<typeof authLoginSchema>["body"];
export type RegisterInput = z.infer<typeof authRegisterUserSchema>["body"];

