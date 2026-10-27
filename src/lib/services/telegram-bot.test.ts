import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
    findUnique: vi.fn(),
    telegramGetFile: vi.fn(),
    telegramSendMessage: vi.fn(),
    transcribeAudio: vi.fn(),
    chatWithAssistant: vi.fn(),
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: { telegramConnection: { findUnique: mocks.findUnique } },
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/telegram/api", () => ({
    telegramGetFile: mocks.telegramGetFile,
    telegramSendMessage: mocks.telegramSendMessage,
}));
vi.mock("@/lib/telegram/transcribe", () => ({ transcribeAudio: mocks.transcribeAudio }));
vi.mock("@/lib/services/planner.service", () => ({ chatWithAssistant: mocks.chatWithAssistant }));

import { handleTelegramUpdate, processTelegramUpdate } from "./telegram-bot";

const owner = { userId: "owner", botToken: "1:token", chatId: "42" };

afterEach(() => {
    vi.clearAllMocks();
});

describe("telegram bot", () => {
    it("ignores an unknown webhook secret", async () => {
        mocks.findUnique.mockResolvedValue(null);

        await handleTelegramUpdate("a".repeat(48), {
            update_id: 1,
            message: { message_id: 1, chat: { id: 42 }, text: "list tasks" },
        });

        expect(mocks.chatWithAssistant).not.toHaveBeenCalled();
        expect(mocks.telegramSendMessage).not.toHaveBeenCalled();
    });

    it("ignores messages from another chat", async () => {
        await processTelegramUpdate(owner, {
            update_id: 1,
            message: { message_id: 1, chat: { id: 99 }, text: "delete everything" },
        });

        expect(mocks.chatWithAssistant).not.toHaveBeenCalled();
        expect(mocks.telegramSendMessage).not.toHaveBeenCalled();
    });

    it("answers /start without calling the assistant", async () => {
        await processTelegramUpdate(owner, {
            update_id: 1,
            message: { message_id: 1, chat: { id: 42 }, text: "/start" },
        });

        expect(mocks.chatWithAssistant).not.toHaveBeenCalled();
        expect(mocks.telegramSendMessage).toHaveBeenCalledWith("1:token", "42", expect.stringContaining("voice note"));
    });

    it("manages workspace items from text", async () => {
        mocks.chatWithAssistant.mockResolvedValue({ reply: "Added Review.", changed: true });

        await processTelegramUpdate(owner, {
            update_id: 1,
            message: { message_id: 1, chat: { id: 42 }, text: "Add a Review board" },
        });

        expect(mocks.chatWithAssistant).toHaveBeenCalledWith("owner", [{ role: "user", content: "Add a Review board" }]);
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
        expect(mocks.telegramSendMessage).toHaveBeenCalledWith("1:token", "42", "Added Review.");
    });

    it("transcribes voice and manages items from it", async () => {
        mocks.telegramGetFile.mockResolvedValue({ bytes: new ArrayBuffer(8), filename: "voice.ogg" });
        mocks.transcribeAudio.mockResolvedValue("List my tasks");
        mocks.chatWithAssistant.mockResolvedValue({ reply: "You have 2 tasks.", changed: false });

        await processTelegramUpdate(owner, {
            update_id: 1,
            message: { message_id: 1, chat: { id: 42 }, voice: { file_id: "voice-1" } },
        });

        expect(mocks.telegramGetFile).toHaveBeenCalledWith("1:token", "voice-1");
        expect(mocks.transcribeAudio).toHaveBeenCalled();
        expect(mocks.chatWithAssistant).toHaveBeenCalledWith("owner", [{ role: "user", content: "List my tasks" }]);
        expect(mocks.telegramSendMessage).toHaveBeenCalledWith("1:token", "42", "You have 2 tasks.");
    });
});
