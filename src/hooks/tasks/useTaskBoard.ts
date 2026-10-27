"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { BoardEditor, BoardView } from "@/types/board.types";
import type { StatusEditor, StatusView } from "@/types/status.types";
import { deleteBoard } from "@/actions/board.actions";
import { deleteStatus } from "@/actions/status.actions";
import { changeTaskStatus, deleteTask } from "@/actions/task.actions";
import type { DeleteItemKind, DeleteTaskDialogProps, TaskEditor, TaskFilters, TaskPlacement, TaskStatus, TaskView } from "@/types/task.types";

export const priorities = [
    { id: "LOW", title: "Low", color: "success" },
    { id: "MEDIUM", title: "Medium", color: "default" },
    { id: "HIGH", title: "High", color: "danger" },
] as const;

const priorityFilters = [{ id: "ALL", title: "All priorities" }, ...priorities];

const sortOptions = [
    { id: "NEWEST", title: "Newest first" },
    { id: "DUE", title: "Due date" },
    { id: "PRIORITY", title: "Priority" },
] as const;

const COLUMN_ORDER_KEY = "momentum.column-order";

function parseColumnOrder(raw: string | null): string[] {
    try {
        const ids = JSON.parse(raw ?? "") as unknown;
        return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
    } catch {
        return [];
    }
}

function orderBoards(boards: BoardView[], stored: string[]) {
    const ids = boards.map((board) => board.id);
    const valid = stored.filter((id) => ids.includes(id));
    const missing = ids.filter((id) => !valid.includes(id));
    return valid.length ? [...valid, ...missing] : ids;
}

function boardIdForTask(task: TaskView, boards: BoardView[]) {
    if (task.boardId && boards.some((board) => board.id === task.boardId)) return task.boardId;
    return boards.find((board) => board.statusId === task.status)?.id;
}

function statusOf(statuses: StatusView[], id?: string) {
    return statuses.find((status) => status.id === id) ?? statuses[0];
}

const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function compareTasks(sort: string) {
    return (a: TaskView, b: TaskView) => {
        if (sort === "DUE") return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
        if (sort === "PRIORITY") return priorityRank[a.priority] - priorityRank[b.priority];
        return 0;
    };
}

export function useTaskBoard(tasks: TaskView[], boards: BoardView[], statuses: StatusView[]) {
    const router = useRouter();
    const firstStatusId = statuses[0]?.id ?? "";

    const [error, setError] = useState("");
    const [pending, start] = useTransition();
    const [editor, setEditor] = useState<TaskEditor>({ isOpen: false, key: 0, status: firstStatusId });
    const [boardEditor, setBoardEditor] = useState<BoardEditor>({ isOpen: false, key: 0 });
    const [statusEditor, setStatusEditor] = useState<StatusEditor>({ isOpen: false, key: 0 });
    const [deleting, setDeleting] = useState<Pick<DeleteTaskDialogProps, "isOpen" | "kind" | "name"> & { id?: string }>({
        isOpen: false,
        kind: "task",
    });
    const [today, setToday] = useState("");
    const [placements, setPlacements] = useState<Record<string, TaskPlacement>>({});
    const [columnOrder, setColumnOrder] = useState<string[]>([]);

    useEffect(() => {
        setToday(new Date().toLocaleDateString("en-CA"));
        setColumnOrder(orderBoards(boards, parseColumnOrder(localStorage.getItem(COLUMN_ORDER_KEY))));
    }, [boards]);

    useEffect(() => {
        setPlacements((prev) => {
            const next = { ...prev };
            let changed = false;

            for (const id of Object.keys(next)) {
                const task = tasks.find((item) => item.id === id);
                if (!task || (task.status === next[id].status && task.boardId === next[id].boardId)) {
                    delete next[id];
                    changed = true;
                }
            }

            return changed ? next : prev;
        });
    }, [tasks]);

    const { watch, setValue } = useForm<TaskFilters>({ defaultValues: { query: "", priority: "ALL", sort: "NEWEST" } });

    const { query, priority, sort } = watch();

    function openEditor(status: TaskStatus, task?: TaskView, boardId?: string) {
        setEditor((prev) => ({ isOpen: true, key: prev.key + 1, status, task, boardId: boardId ?? task?.boardId }));
    }

    function askDelete(kind: DeleteItemKind, id: string, name: string) {
        window.setTimeout(() => setDeleting({ isOpen: true, kind, id, name }), 0);
    }

    function mutate(fn: () => Promise<{ ok: boolean; error?: string }>) {
        setError("");

        start(async () => {
            try {
                const result = await fn();

                if (!result.ok) setError(result.error ?? "Request failed");
                else router.refresh();
            } catch {
                setError("Connection failed. Please try again.");
            }
        });
    }

    const visibleTasks = tasks.map((task) => ({
        ...task,
        ...(placements[task.id] ?? {}),
    }));

    const filtered = visibleTasks.filter(
        (t) =>
            (priority === "ALL" || t.priority === priority) &&
            (t.title + " " + t.description).toLowerCase().includes(query.toLowerCase()),
    );

    const done = visibleTasks.filter((t) => statusOf(statuses, t.status)?.closes).length;

    const orderedBoards = orderBoards(boards, columnOrder);

    const columns = orderedBoards
        .map((id) => boards.find((board) => board.id === id))
        .filter((board): board is BoardView => Boolean(board))
        .map((board) => {
            const status = statusOf(statuses, board.statusId);

            return {
                id: board.id,
                title: board.name,
                status,
                emptyText: status?.closes ? "Your wins will land here." : "Room for your next step.",
                tasks: filtered
                    .filter((task) => boardIdForTask(task, boards) === board.id)
                    .sort(compareTasks(sort))
                    .map((task) => ({
                        ...task,
                        priorityOption: priorities.find((p) => p.id === task.priority) ?? priorities[1],
                        dueLabel: task.dueDate
                            ? new Intl.DateTimeFormat("en", {
                                  month: "short",
                                  day: "numeric",
                                  timeZone: "UTC",
                              }).format(new Date(task.dueDate))
                            : "",
                        isOverdue:
                            !!today &&
                            !!task.dueDate &&
                            !statusOf(statuses, task.status)?.closes &&
                            task.dueDate < today,
                        onEdit: () => openEditor(task.status, task, task.boardId),
                        onDelete: () => askDelete("task", task.id, task.title),
                    })),
                onAdd: () => openEditor(board.statusId, undefined, board.id),
                onEdit: () => setBoardEditor((prev) => ({ isOpen: true, key: prev.key + 1, board })),
                onDelete: () => askDelete("board", board.id, board.name),
            };
        });

    return {
        query,
        priority,
        editor,
        boardEditor,
        statusEditor,
        error,
        pending,
        columns,
        statusCounts: statuses.map((s) => ({
            ...s,
            title: s.name,
            count: visibleTasks.filter((t) => t.status === s.id).length,
        })),
        priorityFilters,
        total: tasks.length,
        filteredCount: filtered.length,
        done,
        inProgress: visibleTasks.filter((t) => {
            const status = statusOf(statuses, t.status);
            return status && !status.closes && status.sortOrder > 0;
        }).length,
        completion: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
        onNewTask: () => openEditor(boards[0]?.statusId ?? firstStatusId, undefined, boards[0]?.id),
        onNewBoard: () => setBoardEditor((prev) => ({ isOpen: true, key: prev.key + 1 })),
        onEditBoard: (board: BoardView) => setBoardEditor((prev) => ({ isOpen: true, key: prev.key + 1, board })),
        onDeleteBoard: (board: BoardView) => askDelete("board", board.id, board.name),
        onNewStatus: () => setStatusEditor((prev) => ({ isOpen: true, key: prev.key + 1, status: undefined })),
        onEditStatus: (status: StatusView) => setStatusEditor((prev) => ({ isOpen: true, key: prev.key + 1, status })),
        onDeleteStatus: (status: StatusView) => askDelete("status", status.id, status.name),
        onCloseEditor: () => {
            setEditor((prev) => ({ ...prev, isOpen: false }));
            router.refresh();
        },
        onCloseBoardEditor: () => {
            setBoardEditor((prev) => ({ ...prev, isOpen: false, board: undefined }));
            router.refresh();
        },
        onCloseStatusEditor: () => {
            setStatusEditor((prev) => ({ ...prev, isOpen: false, status: undefined }));
            router.refresh();
        },
        deleting,
        onCancelDelete: () => setDeleting((prev) => ({ ...prev, isOpen: false })),
        onConfirmDelete: () => {
            const { kind, id } = deleting;

            if (kind === "task" && id) mutate(() => deleteTask(id));
            if (kind === "board" && id) mutate(() => deleteBoard(id));
            if (kind === "status" && id) mutate(() => deleteStatus(id));

            setDeleting((prev) => ({ ...prev, isOpen: false }));
        },
        onSearch: (value: string) => setValue("query", value),
        onPriorityChange: (value: string) => setValue("priority", value),
        sort,
        sortOptions,
        onSortChange: (value: string) => setValue("sort", value),
        onMoveTask: (id: string, boardId: string) => {
            const task = visibleTasks.find((item) => item.id === id);
            const board = boards.find((item) => item.id === boardId);
            if (!task || !board || (task.status === board.statusId && task.boardId === board.id)) return;

            setPlacements((prev) => ({ ...prev, [id]: { status: board.statusId, boardId: board.id } }));

            mutate(async () => {
                const result = await changeTaskStatus({ id, status: board.statusId, boardId: board.id });

                if (!result.ok) {
                    setPlacements((prev) => {
                        const next = { ...prev };
                        delete next[id];
                        return next;
                    });
                }

                return result;
            });
        },
        onReorderColumns: (from: string, to: string) => {
            if (from === to) return;

            setColumnOrder((prev) => {
                const next = [...prev];
                const fromIndex = next.indexOf(from);
                const toIndex = next.indexOf(to);

                if (fromIndex < 0 || toIndex < 0) return prev;

                next.splice(fromIndex, 1);
                next.splice(toIndex, 0, from);

                localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(next));

                return next;
            });
        },
    };
}
