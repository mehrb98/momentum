import "server-only";
import { db } from "@/lib/db";
import { processTelegramUpdate } from "@/lib/services/telegram-bot";
import { telegramGetUpdates, telegramUsesWebhook } from "@/lib/telegram/api";

const INTERVAL_MS = 2500;
const offsets = new Map<string, number>();
const busy = new Set<string>();

let timer: ReturnType<typeof setInterval> | undefined;

export function startTelegramPolling() {
    if (telegramUsesWebhook() || timer) return;

    timer = setInterval(() => {
        void pollOnce().catch(() => undefined);
    }, INTERVAL_MS);
}

async function pollOnce() {
    const rows = await db.telegramConnection.findMany({
        select: { userId: true, botToken: true, chatId: true },
    });

    await Promise.all(rows.map(pollBot));
}

async function pollBot(row: { userId: string; botToken: string; chatId: string }) {
    if (busy.has(row.botToken)) return;

    busy.add(row.botToken);

    try {
        const offset = offsets.get(row.botToken) ?? 0;
        const payload = await telegramGetUpdates(row.botToken, offset);

        if (!payload.ok || !payload.result) return;

        for (const update of payload.result) {
            offsets.set(row.botToken, update.update_id + 1);
            await processTelegramUpdate(row, update);
        }
    } catch {
        return;
    } finally {
        busy.delete(row.botToken);
    }
}
