import "server-only";
import { db } from "@/lib/db";
import { toCssColor } from "@/utils/color";
import type { StatusFormInput, StatusView } from "@/types/status.types";

const defaultStatuses: { name: string; color: StatusView["color"]; closes: boolean; key: string; sortOrder: number }[] =
    [
        { name: "To do", color: "#71717a", closes: false, key: "TODO", sortOrder: 0 },
        { name: "In progress", color: "#f5a524", closes: false, key: "IN_PROGRESS", sortOrder: 1 },
        { name: "Done", color: "#17c964", closes: true, key: "DONE", sortOrder: 2 },
    ];

function toStatusView(status: {
    id: string;
    name: string;
    color: string;
    closes: boolean;
    key: string | null;
    sortOrder: number;
}): StatusView {
    return {
        id: status.id,
        name: status.name,
        color: toCssColor(status.color),
        closes: status.closes,
        key: status.key ?? undefined,
        sortOrder: status.sortOrder,
    };
}

export async function listStatuses(userId: string): Promise<StatusView[]> {
    const statuses = await db.status.findMany({
        where: { userId },
        orderBy: { sortOrder: "asc" },
    });

    return statuses.map(toStatusView);
}

// called once from the sign-up hook; one transaction so parallel page loads can't seed twice
export async function createDefaultWorkspace(userId: string) {
    await db.$transaction(async (tx) => {
        if (await tx.status.count({ where: { userId } })) return;

        for (const status of defaultStatuses) {
            const created = await tx.status.create({ data: { ...status, userId } });

            await tx.board.create({
                data: { name: status.name, statusId: created.id, sortOrder: status.sortOrder, userId },
            });
        }
    });
}

export async function updateOwnedStatus(userId: string, id: string, status: StatusFormInput) {
    const result = await db.status.updateMany({
        where: { id, userId },
        data: { name: status.name, color: status.color },
    });

    if (!result.count) throw new Error("Status not found");
}

export async function createOwnedStatus(userId: string, status: StatusFormInput) {
    const last = await db.status.findFirst({
        where: { userId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
    });

    return db.status.create({
        data: {
            name: status.name,
            color: status.color,
            sortOrder: (last?.sortOrder ?? -1) + 1,
            userId,
        },
    });
}

export async function deleteOwnedStatus(userId: string, id: string) {
    const owned = await db.status.findFirst({ where: { id, userId }, select: { id: true } });

    if (!owned) throw new Error("Status not found");

    const fallback = await db.status.findFirst({
        where: { userId, id: { not: id } },
        orderBy: { sortOrder: "asc" },
        select: { id: true },
    });

    if (!fallback) throw new Error("Keep at least one status");

    await db.$transaction([
        db.task.updateMany({ where: { userId, statusId: id }, data: { statusId: fallback.id } }),
        db.board.updateMany({ where: { userId, statusId: id }, data: { statusId: fallback.id } }),
        db.status.deleteMany({ where: { id, userId } }),
    ]);
}

export async function ownedStatusId(userId: string, statusId?: string) {
    if (!statusId) return undefined;

    const status = await db.status.findFirst({ where: { id: statusId, userId }, select: { id: true } });

    if (!status) throw new Error("Status not found");

    return status.id;
}

export async function resolveStatusRef(userId: string, ref?: string) {
    if (!ref) return undefined;

    const statuses = await listStatuses(userId);
    const needle = ref.trim().toLowerCase();
    const match =
        statuses.find((status) => status.id === ref) ??
        statuses.find((status) => status.key?.toLowerCase() === needle) ??
        statuses.find((status) => status.name.toLowerCase() === needle);

    if (!match) throw new Error("Status not found");

    return match.id;
}
