export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    const { startTelegramPolling } = await import("./lib/telegram/poll");
    startTelegramPolling();
}
