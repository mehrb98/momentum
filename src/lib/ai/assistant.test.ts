import { afterEach, describe, expect, it, vi } from "vitest";
import { AIMessage } from "@langchain/core/messages";
vi.mock("server-only", () => ({}));
const { invoke, services } = vi.hoisted(() => ({
    invoke: vi.fn(),
    services: {
        findTasks: vi.fn(),
        createOwnedTasks: vi.fn(),
        updateOwnedTask: vi.fn(),
        deleteOwnedTasks: vi.fn(),
    },
}));
vi.mock("@langchain/openai", () => ({
    ChatOpenAI: class {
        bindTools() {
            return { invoke };
        }
    },
}));
vi.mock("@/lib/services/tasks", () => services);
vi.mock("@/lib/services/boards", () => ({
    listBoards: vi.fn(),
    createOwnedBoard: vi.fn(),
    updateOwnedBoard: vi.fn(),
    deleteOwnedBoards: vi.fn(),
}));
vi.mock("@/lib/services/statuses", () => ({
    listStatuses: vi.fn(),
    createOwnedStatus: vi.fn(),
    updateOwnedStatus: vi.fn(),
    deleteOwnedStatus: vi.fn(),
    resolveStatusRef: vi.fn(),
}));
import { createOwnedBoard } from "@/lib/services/boards";
import { resolveStatusRef } from "@/lib/services/statuses";
import { createAssistant } from "./assistant";

const ask = (content: string) => ({ messages: [{ role: "user" as const, content }] });

afterEach(() => {
    vi.unstubAllEnvs();
    invoke.mockReset();
});

describe("task assistant agent", () => {
    it("runs tools scoped to the user, then answers", async () => {
        vi.stubEnv("OPENAI_API_KEY", "test-key");
        const onChange = vi.fn();
        invoke
            .mockResolvedValueOnce(
                new AIMessage({
                    content: "",
                    tool_calls: [{ id: "call-1", name: "update_task", args: { id: "task-1", status: "DONE" } }],
                }),
            )
            .mockResolvedValueOnce(new AIMessage("Marked it as done."));

        const result = await createAssistant("owner", onChange).invoke(ask("Finish task 1"));

        expect(services.updateOwnedTask).toHaveBeenCalledWith("owner", "task-1", { status: "DONE" });
        expect(onChange).toHaveBeenCalledOnce();
        expect(result.messages.at(-1)?.content).toBe("Marked it as done.");
    });

    it("answers questions without reporting changes", async () => {
        vi.stubEnv("OPENAI_API_KEY", "test-key");
        const onChange = vi.fn();
        services.findTasks.mockResolvedValue([]);
        invoke
            .mockResolvedValueOnce(
                new AIMessage({ content: "", tool_calls: [{ id: "call-1", name: "list_tasks", args: {} }] }),
            )
            .mockResolvedValueOnce(new AIMessage("Your board is empty."));

        await createAssistant("owner", onChange).invoke(ask("What is on my board?"));

        expect(services.findTasks).toHaveBeenCalledWith("owner", {});
        expect(onChange).not.toHaveBeenCalled();
    });

    it("rejects invalid tool input before touching data", async () => {
        vi.stubEnv("OPENAI_API_KEY", "test-key");
        invoke
            .mockResolvedValueOnce(
                new AIMessage({
                    content: "",
                    tool_calls: [{ id: "call-1", name: "update_task", args: { id: "task-1", dueDate: "2026-02-30" } }],
                }),
            )
            .mockResolvedValueOnce(new AIMessage("That date is invalid."));

        await createAssistant("owner").invoke(ask("Move it to Feb 30"));

        expect(services.updateOwnedTask).not.toHaveBeenCalled();
    });

    it("requires server-side model configuration", () => {
        vi.stubEnv("OPENAI_API_KEY", "");
        expect(() => createAssistant("owner")).toThrow("not configured");
    });

    it("creates boards under the session owner", async () => {
        vi.stubEnv("OPENAI_API_KEY", "test-key");
        const onChange = vi.fn();
        vi.mocked(resolveStatusRef).mockResolvedValue("status-1");
        vi.mocked(createOwnedBoard).mockResolvedValue({ id: "board-1" } as never);
        invoke
            .mockResolvedValueOnce(
                new AIMessage({
                    content: "",
                    tool_calls: [{ id: "call-1", name: "create_board", args: { name: "Review", status: "In progress" } }],
                }),
            )
            .mockResolvedValueOnce(new AIMessage("Added a Review board."));

        await createAssistant("owner", onChange).invoke(ask("Add a Review board"));

        expect(createOwnedBoard).toHaveBeenCalledWith("owner", { name: "Review", statusId: "status-1" });
        expect(onChange).toHaveBeenCalledOnce();
    });
});
