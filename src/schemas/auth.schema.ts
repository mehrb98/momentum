import { z } from "zod";

export const signInSchema = z.object({
    email: z.email(),
    password: z.string().min(1).max(128),
});

export const signUpSchema = signInSchema.extend({
    name: z.string().trim().min(1, "Enter your name").max(100),
    password: z.string().min(12, "Use at least 12 characters").max(128),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
