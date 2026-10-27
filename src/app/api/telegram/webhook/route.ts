import { handleTelegramUpdate } from "@/lib/services/telegram-bot";

export const runtime = "nodejs";
export const maxDuration = 60;

const SECRET = /^[a-f0-9]{48}$/;

export async function POST(request: Request) {
    const secret = request.headers.get("x-telegram-bot-api-secret-token") ?? "";

    if (!SECRET.test(secret)) return new Response("Unauthorized", { status: 401 });

    try {
        await handleTelegramUpdate(secret, await request.json());
    } catch {
        // Always ack so Telegram does not retry forever.
    }

    return Response.json({ ok: true });
}
