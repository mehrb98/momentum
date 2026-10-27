import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { randomBytes } from "node:crypto";
import { telegramBotTokenSchema } from "@/schemas/connection.schema";
import type { TelegramConnectionInput, TelegramConnectionView } from "@/types/connection.types";
import {
    telegramDeleteWebhook,
    telegramGetChat,
    telegramGetMe,
    telegramSetWebhook,
    telegramWebhookUrl,
} from "@/lib/telegram/api";

function maskToken(token: string) {
    return `••••${token.slice(-4)}`;
}

function toView(row: { chatId: string; botToken: string; botUsername: string | null } | null): TelegramConnectionView {
    if (!row) return { connected: false, chatId: "", tokenMasked: "" };

    return {
        connected: true,
        chatId: row.chatId,
        tokenMasked: maskToken(row.botToken),
        botUsername: row.botUsername ?? undefined,
    };
}

function newWebhookSecret() {
    return randomBytes(24).toString("hex");
}

export async function getTelegramConnection(userId: string): Promise<TelegramConnectionView> {
    const row = await db.telegramConnection.findUnique({
        where: { userId },
        select: { chatId: true, botToken: true, botUsername: true },
    });

    return toView(row);
}

async function syncWebhook(token: string, secret: string) {
    const url = telegramWebhookUrl();

    if (!url) return;

    const result = await telegramSetWebhook(token, url, secret);

    if (!result.ok) {
        throw new z.ZodError([
            { code: "custom", path: ["botToken"], message: "Could not register the Telegram webhook" },
        ]);
    }
}

export async function saveTelegramConnection(userId: string, input: TelegramConnectionInput) {
    const existing = await db.telegramConnection.findUnique({
        where: { userId },
        select: { botToken: true, webhookSecret: true },
    });

    const botToken = input.botToken ? telegramBotTokenSchema.parse(input.botToken) : existing?.botToken;

    if (!botToken) {
        throw new z.ZodError([{ code: "custom", path: ["botToken"], message: "Add a bot token" }]);
    }

    const bot = await telegramGetMe(botToken);

    if (!bot) {
        throw new z.ZodError([{ code: "custom", path: ["botToken"], message: "Telegram rejected this bot token" }]);
    }

    const chat = await telegramGetChat(botToken, input.chatId);

    if (!chat) {
        throw new z.ZodError([
            {
                code: "custom",
                path: ["chatId"],
                message: "Open the bot, send a message, then save this chat id",
            },
        ]);
    }

    if (existing?.botToken && existing.botToken !== botToken) {
        await telegramDeleteWebhook(existing.botToken);
    }

    const webhookSecret = existing?.webhookSecret ?? newWebhookSecret();
    const chatId = String(chat.id);
    const botUsername = bot.username ?? null;

    await syncWebhook(botToken, webhookSecret);

    await db.telegramConnection.upsert({
        where: { userId },
        create: { userId, botToken, chatId, botUsername, webhookSecret },
        update: { botToken, chatId, botUsername, webhookSecret },
    });

    return toView({ botToken, chatId, botUsername });
}

export async function deleteTelegramConnection(userId: string) {
    const row = await db.telegramConnection.findUnique({
        where: { userId },
        select: { botToken: true },
    });

    if (row) await telegramDeleteWebhook(row.botToken);

    await db.telegramConnection.deleteMany({ where: { userId } });
}
