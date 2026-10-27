import { z } from "zod";

export const promptSchema = z.object({
    prompt: z.string().trim().min(1, "Type a message").max(3000),
});

export const chatSchema = z.object({
    messages: z
        .array(
            z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().trim().min(1).max(4000),
            }),
        )
        .min(1)
        .max(20)
        .refine((messages) => messages.at(-1)?.role === "user", "The last message must come from the user"),
});
