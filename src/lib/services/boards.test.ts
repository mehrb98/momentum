import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
    deleteMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        board: mocks,
    },
}));

import { deleteOwnedBoard } from "./boards";

describe("board ownership boundaries", () => {
    beforeEach(() => {
        mocks.deleteMany.mockResolvedValue({ count: 1 });
    });

    it("constrains deletion by owner and rejects missing boards", async () => {
        mocks.deleteMany.mockResolvedValue({ count: 0 });

        await expect(deleteOwnedBoard("other-user", "board-id")).rejects.toThrow("Board not found");

        expect(mocks.deleteMany).toHaveBeenCalledWith({
            where: { id: "board-id", userId: "other-user" },
        });
    });
});
