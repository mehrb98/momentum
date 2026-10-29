import "server-only";
import { db } from "@/lib/db";
import type { BoardFormInput, BoardView } from "@/types/board.types";
import { ownedStatusId } from "@/lib/services/statuses";

function toBoardView(board: { id: string; name: string; statusId: string; sortOrder: number }): BoardView {
    return { id: board.id, name: board.name, statusId: board.statusId, sortOrder: board.sortOrder };
}

export async function listBoards(userId: string): Promise<BoardView[]> {
    const boards = await db.board.findMany({
        where: { userId },
        orderBy: { sortOrder: "asc" },
    });

    return boards.map(toBoardView);
}

export async function createOwnedBoard(userId: string, board: BoardFormInput) {
    const statusId = await ownedStatusId(userId, board.statusId);
    const last = await db.board.findFirst({
        where: { userId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
    });

    return db.board.create({
        data: {
            name: board.name,
            statusId: statusId!,
            sortOrder: (last?.sortOrder ?? -1) + 1,
            userId,
        },
    });
}

export async function updateOwnedBoard(userId: string, id: string, board: BoardFormInput) {
    const statusId = await ownedStatusId(userId, board.statusId);

    const result = await db.board.updateMany({
        where: { id, userId },
        data: { name: board.name, statusId },
    });

    if (!result.count) throw new Error("Board not found");
}

export async function deleteOwnedBoard(userId: string, id: string) {
    const result = await db.board.deleteMany({ where: { id, userId } });

    if (!result.count) throw new Error("Board not found");
}

export async function deleteOwnedBoards(userId: string, ids: string[]) {
    const result = await db.board.deleteMany({ where: { id: { in: ids }, userId } });

    return result.count;
}

export async function resolveBoardRef(userId: string, ref?: string) {
    if (!ref) return undefined;

    const boards = await listBoards(userId);
    const needle = ref.trim().toLowerCase();
    const match =
        boards.find((board) => board.id === ref) ?? boards.find((board) => board.name.toLowerCase() === needle);

    if (!match) throw new Error("Board not found");

    return match.id;
}
