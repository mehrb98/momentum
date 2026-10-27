import "server-only";
import type { TelegramApiResult, TelegramChatInfo, TelegramFileDownload, TelegramUserInfo } from "@/types/telegram.types";

const TELEGRAM = "https://api.telegram.org";
const MESSAGE_LIMIT = 4096;

export function telegramWebhookUrl() {
    const base = (process.env.BETTER_AUTH_URL ?? "").replace(/\/$/, "");

    if (!base.startsWith("https://")) return null;

    return `${base}/api/telegram/webhook`;
}

export function telegramUsesWebhook() {
    return Boolean(telegramWebhookUrl());
}

async function telegramCall<T>(token: string, method: string, body?: Record<string, unknown>) {
    const response = await fetch(`${TELEGRAM}/bot${token}/${method}`, {
        method: body ? "POST" : "GET",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });

    try {
        return (await response.json()) as TelegramApiResult<T>;
    } catch {
        return { ok: false };
    }
}

export async function telegramGetMe(token: string) {
    const payload = await telegramCall<TelegramUserInfo>(token, "getMe");

    return payload.ok ? (payload.result ?? null) : null;
}

export async function telegramGetChat(token: string, chatId: string) {
    const payload = await telegramCall<TelegramChatInfo>(token, "getChat", { chat_id: chatId });

    return payload.ok && payload.result ? payload.result : null;
}

export async function telegramSetWebhook(token: string, url: string, secret: string) {
    return telegramCall(token, "setWebhook", {
        url,
        allowed_updates: ["message"],
        secret_token: secret,
    });
}

export async function telegramDeleteWebhook(token: string) {
    return telegramCall(token, "deleteWebhook");
}

export async function telegramGetUpdates(token: string, offset: number) {
    return telegramCall<Array<{ update_id: number } & Record<string, unknown>>>(token, "getUpdates", {
        offset,
        timeout: 0,
        allowed_updates: ["message"],
    });
}

export async function telegramSendMessage(token: string, chatId: string, text: string) {
    const chunks = chunkMessage(text);

    for (const chunk of chunks) {
        await telegramCall(token, "sendMessage", { chat_id: chatId, text: chunk });
    }
}

export async function telegramGetFile(token: string, fileId: string): Promise<TelegramFileDownload> {
    const payload = await telegramCall<{ file_path?: string }>(token, "getFile", { file_id: fileId });
    const path = payload.result?.file_path;

    if (!payload.ok || !path) throw new Error("Could not download the voice message");

    const response = await fetch(`${TELEGRAM}/file/bot${token}/${path}`, { cache: "no-store" });

    if (!response.ok) throw new Error("Could not download the voice message");

    return {
        bytes: await response.arrayBuffer(),
        filename: path.split("/").pop() ?? "voice.ogg",
    };
}

function chunkMessage(text: string) {
    const value = text.trim() || "Done.";

    if (value.length <= MESSAGE_LIMIT) return [value];

    const chunks: string[] = [];

    for (let index = 0; index < value.length; index += MESSAGE_LIMIT) {
        chunks.push(value.slice(index, index + MESSAGE_LIMIT));
    }

    return chunks;
}
