import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
    taskUpdateMany: vi.fn(),
    boardUpdateMany: vi.fn(),
    $transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        status: { findFirst: mocks.findFirst, deleteMany: mocks.deleteMany },
        task: { updateMany: mocks.taskUpdateMany },
        board: { updateMany: mocks.boardUpdateMany },
        $transaction: mocks.$transaction,
    },
}));

import { deleteOwnedStatus } from "./statuses";

describe("status ownership boundaries", () => {
    beforeEach(() => {
        mocks.findFirst.mockReset();
        mocks.$transaction.mockResolvedValue([]);
    });

    it("rejects deleting a status that is not owned", async () => {
        mocks.findFirst.mockResolvedValueOnce(null);

        await expect(deleteOwnedStatus("other-user", "status-id")).rejects.toThrow("Status not found");
        expect(mocks.$transaction).not.toHaveBeenCalled();
    });

    it("keeps the last status", async () => {
        mocks.findFirst.mockResolvedValueOnce({ id: "status-id" }).mockResolvedValueOnce(null);

        await expect(deleteOwnedStatus("owner", "status-id")).rejects.toThrow("Keep at least one status");
        expect(mocks.$transaction).not.toHaveBeenCalled();
    });

    it("moves owned tasks and boards before deleting the status", async () => {
        mocks.findFirst.mockResolvedValueOnce({ id: "status-id" }).mockResolvedValueOnce({ id: "fallback-id" });

        await deleteOwnedStatus("owner", "status-id");

        expect(mocks.$transaction).toHaveBeenCalled();
    });
});
