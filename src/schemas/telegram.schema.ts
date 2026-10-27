import { z } from "zod";

export const telegramChatSchema = z.object({
    id: z.number(),
    username: z.string().optional(),
});

export const telegramFileSchema = z.object({
    file_id: z.string(),
});

export const telegramMessageSchema = z.object({
    message_id: z.number(),
    chat: telegramChatSchema,
    text: z.string().optional(),
    voice: telegramFileSchema.optional(),
    audio: telegramFileSchema.optional(),
});

export const telegramUpdateSchema = z.object({
    update_id: z.number(),
    message: telegramMessageSchema.optional(),
});
