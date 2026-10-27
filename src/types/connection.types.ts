import type { z } from "zod";
import type { telegramConnectionFormSchema } from "@/schemas/connection.schema";

export type TelegramConnectionInput = z.infer<typeof telegramConnectionFormSchema>;

export type TelegramConnectionView = {
    connected: boolean;
    chatId: string;
    tokenMasked: string;
    botUsername?: string;
};

export type TelegramLinkedChat = {
    userId: string;
    botToken: string;
    chatId: string;
};

export type TelegramConnectionFieldsProps = {
    connection: TelegramConnectionView;
};
