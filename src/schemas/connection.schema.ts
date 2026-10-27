import { z } from "zod";

export const telegramBotTokenSchema = z
    .string()
    .trim()
    .regex(/^\d+:[A-Za-z0-9_-]{20,}$/, "Enter a bot token from @BotFather");

export const telegramChatIdSchema = z
    .string()
    .trim()
    .regex(/^(@[A-Za-z0-9_]{5,32}|-?\d{5,20})$/, "Enter a chat id");

export const telegramConnectionFormSchema = z.object({
    botToken: z.string().trim(),
    chatId: telegramChatIdSchema,
});
