import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
    statusFindFirst: vi.fn(),
    boardFindFirst: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
    db: {
        task: mocks,
        status: { findFirst: mocks.statusFindFirst },
        board: { findFirst: mocks.boardFindFirst },
    },
}));
import { saveOwnedTask, updateOwnedStatus, deleteOwnedTask, listTasks } from "./tasks";
const task = {
    title: "Private task",
    description: "",
    priority: "HIGH" as const,
    dueDate: "",
};
describe("task ownership boundaries", () => {
    beforeEach(() => {
        mocks.updateMany.mockResolvedValue({ count: 1 });
        mocks.deleteMany.mockResolvedValue({ count: 1 });
        mocks.statusFindFirst.mockImplementation(async ({ where }: { where: { id: string } }) => ({ id: where.id }));
    });
    it("creates tasks under the session owner", async () => {
        await saveOwnedTask("owner", task);
        expect(mocks.create).toHaveBeenCalledWith({
            data: { ...task, dueDate: null, userId: "owner", statusId: undefined },
        });
    });
    it("puts a new task without a board on the board of its status", async () => {
        mocks.boardFindFirst.mockResolvedValueOnce({ id: "done-board" });
        await saveOwnedTask("owner", { ...task, status: "done" });
        expect(mocks.boardFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({ where: { userId: "owner", statusId: "done" } }),
        );
        expect(mocks.create).toHaveBeenLastCalledWith({
            data: { ...task, dueDate: null, statusId: "done", boardId: "done-board", userId: "owner" },
        });
    });
    it("constrains edits by owner and task id", async () => {
        await saveOwnedTask("owner", task, "task-id");
        expect(mocks.updateMany).toHaveBeenCalledWith({
            where: { id: "task-id", userId: "owner" },
            data: { ...task, dueDate: null },
        });
    });
    it("fails when an edit does not match an owned task", async () => {
        mocks.updateMany.mockResolvedValue({ count: 0 });
        await expect(saveOwnedTask("other-user", task, "task-id")).rejects.toThrow("Task not found");
    });
    it("constrains status changes by owner", async () => {
        await updateOwnedStatus("owner", "task-id", "DONE");
        expect(mocks.statusFindFirst).toHaveBeenCalledWith({
            where: { id: "DONE", userId: "owner" },
            select: { id: true },
        });
        expect(mocks.updateMany).toHaveBeenCalledWith({
            where: { id: "task-id", userId: "owner" },
            data: { statusId: "DONE" },
        });
    });
    it("constrains deletion by owner and rejects missing tasks", async () => {
        mocks.deleteMany.mockResolvedValue({ count: 0 });
        await expect(deleteOwnedTask("other-user", "task-id")).rejects.toThrow();
        expect(mocks.deleteMany).toHaveBeenCalledWith({
            where: { id: "task-id", userId: "other-user" },
        });
    });
    it("scopes lists and serializes dates without exposing account fields", async () => {
        mocks.findMany.mockResolvedValue([
            {
                ...task,
                id: "task-id",
                statusId: "TODO",
                dueDate: new Date("2026-12-01"),
                userId: "owner",
            },
        ]);
        const result = await listTasks("owner");
        expect(mocks.findMany.mock.calls[0][0].where).toEqual({
            userId: "owner",
        });
        expect(result[0].dueDate).toBe("2026-12-01");
        expect(result[0].status).toBe("TODO");
        expect(result[0]).not.toHaveProperty("userId");
    });
});
