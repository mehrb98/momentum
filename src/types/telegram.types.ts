import type { z } from "zod";
import type { telegramMessageSchema, telegramUpdateSchema } from "@/schemas/telegram.schema";

export type TelegramMessage = z.infer<typeof telegramMessageSchema>;
export type TelegramUpdate = z.infer<typeof telegramUpdateSchema>;

export type TelegramApiResult<T = unknown> = {
    ok?: boolean;
    result?: T;
    description?: string;
};

export type TelegramUserInfo = {
    username?: string;
};

export type TelegramChatInfo = {
    id: number;
    username?: string;
};

export type TelegramFileDownload = {
    bytes: ArrayBuffer;
    filename: string;
};
