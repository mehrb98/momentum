import "server-only";
import { db } from "@/lib/db";
import { listBoards, resolveBoardRef } from "@/lib/services/boards";
import type { TaskFormInput, TaskInput, TaskStatus } from "@/types/task.types";
import { listStatuses, ownedStatusId, resolveStatusRef } from "@/lib/services/statuses";

export function taskData<T extends TaskInput & { status?: TaskStatus; boardId?: string }>(task: T) {
    const { boardId, status, ...rest } = task;
    return {
        ...rest,
        dueDate: task.dueDate ? new Date(task.dueDate + "T00:00:00.000Z") : null,
        ...(status !== undefined && { statusId: status }),
        ...(boardId !== undefined && { boardId: boardId || null }),
    };
}

export async function listTasks(userId: string) {
    const tasks = await db.task.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 500,
    });

    return tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.statusId,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString().slice(0, 10) ?? "",
        boardId: t.boardId ?? undefined,
    }));
}

async function ownedBoardId(userId: string, boardId?: string) {
    if (!boardId) return undefined;

    const board = await db.board.findFirst({ where: { id: boardId, userId }, select: { id: true } });

    if (!board) throw new Error("Board not found");

    return board.id;
}

export async function saveOwnedTask(
    userId: string,
    task: TaskInput & { status?: TaskStatus; boardId?: string },
    id?: string,
) {
    const statusId = await ownedStatusId(userId, task.status);
    // a new task without a board goes to the board of its status, like createOwnedTasks
    const boardId =
        (await ownedBoardId(userId, task.boardId)) ??
        (!id && statusId
            ? (
                  await db.board.findFirst({
                      where: { userId, statusId },
                      orderBy: { sortOrder: "asc" },
                      select: { id: true },
                  })
              )?.id
            : undefined);
    const data = taskData({ ...task, status: statusId, boardId });

    if (!id) return db.task.create({ data: { ...data, userId, statusId: statusId! } });

    const result = await db.task.updateMany({
        where: { id, userId },
        data,
    });

    if (!result.count) throw new Error("Task not found");
}

export async function updateOwnedStatus(userId: string, id: string, status: TaskStatus, boardId?: string) {
    const statusId = await ownedStatusId(userId, status);
    const owned = await ownedBoardId(userId, boardId);

    const result = await db.task.updateMany({
        where: { id, userId },
        data: { statusId, ...(owned !== undefined && { boardId: owned }) },
    });

    if (!result.count) throw new Error("Task not found");
}

export async function findTasks(
    userId: string,
    {
        status,
        board,
        priority,
        search,
    }: { status?: TaskStatus; board?: string; priority?: TaskInput["priority"]; search?: string },
) {
    const needle = search?.toLowerCase();
    const [tasks, statuses, boards] = await Promise.all([listTasks(userId), listStatuses(userId), listBoards(userId)]);
    const statusId = status ? await resolveStatusRef(userId, status) : undefined;
    const boardId = board ? await resolveBoardRef(userId, board) : undefined;

    return tasks
        .filter(
            (task) =>
                (!statusId || task.status === statusId) &&
                (!boardId || task.boardId === boardId) &&
                (!priority || task.priority === priority) &&
                (!needle || `${task.title} ${task.description}`.toLowerCase().includes(needle)),
        )
        .map((task) => ({
            ...task,
            statusName: statuses.find((item) => item.id === task.status)?.name ?? task.status,
            boardName: boards.find((item) => item.id === task.boardId)?.name,
        }));
}

export async function createOwnedTasks(userId: string, tasks: TaskFormInput[]) {
    const boards = await listBoards(userId);
    const data = await Promise.all(
        tasks.map(async (t) => {
            const statusId = (await resolveStatusRef(userId, t.status))!;
            const boardId = t.boardId
                ? await resolveBoardRef(userId, t.boardId)
                : boards.find((board) => board.statusId === statusId)?.id;

            return { ...taskData({ ...t, status: statusId, boardId }), userId, statusId };
        }),
    );

    const result = await db.task.createMany({ data });

    return result.count;
}

export async function updateOwnedTask(userId: string, id: string, patch: Partial<TaskFormInput>) {
    const { dueDate, status, boardId, ...rest } = patch;
    const statusId = status ? await resolveStatusRef(userId, status) : undefined;
    const ownedBoard = boardId !== undefined ? (boardId ? await resolveBoardRef(userId, boardId) : null) : undefined;

    const result = await db.task.updateMany({
        where: { id, userId },
        data: {
            ...rest,
            ...(statusId && { statusId }),
            ...(ownedBoard !== undefined && { boardId: ownedBoard }),
            ...(dueDate !== undefined && {
                dueDate: dueDate ? new Date(dueDate + "T00:00:00.000Z") : null,
            }),
        },
    });

    if (!result.count) throw new Error("Task not found");
}

export async function deleteOwnedTasks(userId: string, ids: string[]) {
    const result = await db.task.deleteMany({ where: { id: { in: ids }, userId } });

    return result.count;
}

export async function deleteOwnedTask(userId: string, id: string) {
    const result = await db.task.deleteMany({ where: { id, userId } });

    if (!result.count) throw new Error("Task not found");
}
