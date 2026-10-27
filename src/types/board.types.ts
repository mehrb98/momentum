import type { z } from "zod";
import type { StatusView } from "./status.types";
import type { boardFormSchema } from "@/schemas/board.schema";

export type BoardFormInput = z.infer<typeof boardFormSchema>;

export type BoardView = {
    id: string;
    name: string;
    statusId: string;
    sortOrder: number;
};

export type BoardFormProps = {
    isOpen: boolean;
    formKey: number;
    statuses: StatusView[];
    board?: BoardView;
    onClose: () => void;
};

export type BoardCardProps = {
    name: string;
    statusName?: string;
    statusColor?: string;
    isDisabled?: boolean;
    onEdit: () => void;
    onDelete: () => void;
};

export type BoardEditor = {
    isOpen: boolean;
    key: number;
    board?: BoardView;
};

export type BoardTask = {
    id: string;
    title: string;
    description: string;
    priorityOption: { title: string; color: "success" | "default" | "danger" };
    dueLabel: string;
    isOverdue: boolean;
    onEdit: () => void;
    onDelete: () => void;
};

export type BoardColumn = {
    id: string;
    title: string;
    status: StatusView;
    emptyText: string;
    tasks: BoardTask[];
    onAdd: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export type TaskBoardProps = {
    columns: BoardColumn[];
    pending: boolean;
    onMoveTask: (id: string, boardId: string) => void;
    onReorderColumns: (from: string, to: string) => void;
};

export type BoardDragState =
    | { kind: "task"; id: string }
    | { kind: "column"; id: string }
    | null;
