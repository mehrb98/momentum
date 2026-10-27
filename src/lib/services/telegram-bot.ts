import "server-only";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { telegramUpdateSchema } from "@/schemas/telegram.schema";
import { chatWithAssistant } from "@/lib/services/planner.service";
import { transcribeAudio } from "@/lib/telegram/transcribe";
import type { TelegramLinkedChat } from "@/types/connection.types";
import type { TelegramMessage } from "@/types/telegram.types";
import { telegramGetFile, telegramSendMessage } from "@/lib/telegram/api";

const HELP = `Momentum can manage your workspace from this chat.

Send text or a voice note to:
- list, add, edit, or delete tasks
- create or update boards
- add or change statuses

Examples:
- Add a task to review the proposal tomorrow
- List my boards
- Move the design task to In progress`;

const HEAR_AGAIN = "I could not hear that voice message. Try again or send text.";

function sameChat(configured: string, chat: TelegramMessage["chat"]) {
    if (configured === String(chat.id)) return true;

    return Boolean(chat.username && configured.toLowerCase() === `@${chat.username.toLowerCase()}`);
}

export async function handleTelegramUpdate(secret: string, body: unknown) {
    const connection = await db.telegramConnection.findUnique({
        where: { webhookSecret: secret },
        select: { userId: true, botToken: true, chatId: true },
    });

    if (!connection) return;

    await processTelegramUpdate(connection, body);
}

export async function processTelegramUpdate(connection: TelegramLinkedChat, body: unknown) {
    const parsed = telegramUpdateSchema.safeParse(body);

    if (!parsed.success || !parsed.data.message) return;

    const { message } = parsed.data;

    if (!sameChat(connection.chatId, message.chat)) return;

    const reply = await replyForMessage(connection, message);

    if (!reply) return;

    await telegramSendMessage(connection.botToken, String(message.chat.id), reply);
}

async function replyForMessage(connection: TelegramLinkedChat, message: TelegramMessage) {
    const command = message.text?.trim();

    if (command === "/start" || command === "/help") return HELP;

    let prompt = command;

    if (!prompt && (message.voice || message.audio)) {
        try {
            const file = await telegramGetFile(connection.botToken, (message.voice ?? message.audio)!.file_id);
            prompt = await transcribeAudio(file.bytes, file.filename);
        } catch (error) {
            const detail = error instanceof Error ? error.message : "";

            if (detail.includes("not configured")) return "AI assistant is not configured on the server.";

            return HEAR_AGAIN;
        }

        if (!prompt) return HEAR_AGAIN;
    }

    if (!prompt) return;

    try {
        const { reply, changed } = await chatWithAssistant(connection.userId, [{ role: "user", content: prompt }]);

        if (changed) revalidatePath("/");

        return reply;
    } catch (error) {
        const detail = error instanceof Error ? error.message : "";

        if (detail.includes("limit")) return "AI request limit reached. Try again in an hour.";
        if (detail.includes("not configured")) return "AI assistant is not configured on the server.";

        return "Something went wrong. Try again.";
    }
}
