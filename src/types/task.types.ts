import type { z } from "zod";
import type { DragEvent } from "react";
import type { StatusView } from "./status.types";
import type { taskSchema, taskFormSchema } from "@/schemas/task.schema";

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskStatus = string;
export type TaskFormInput = z.infer<typeof taskFormSchema>;

export type TaskView = TaskFormInput & {
    id: string;
    boardId?: string;
};

export type TaskCardProps = {
    title: string;
    description: string;
    priority: { title: string; color: "success" | "default" | "danger" };
    dueLabel: string;
    isOverdue: boolean;
    isDisabled: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onDragStart: (event: DragEvent<HTMLElement>) => void;
    onDragEnd: () => void;
};

export type TaskFormProps = {
    isOpen: boolean;
    formKey: number;
    status: TaskStatus;
    statuses: StatusView[];
    boardId?: string;
    task?: TaskView;
    onClose: () => void;
};

export type TaskFormBodyProps = Omit<TaskFormProps, "isOpen" | "formKey">;

export type DeleteItemKind = "task" | "board" | "status" | "user";

export type DeleteTaskDialogProps = {
    isOpen: boolean;
    kind: DeleteItemKind;
    name?: string;
    onCancel: () => void;
    onConfirm: () => void;
};

export type TaskEditor = {
    isOpen: boolean;
    key: number;
    status: TaskStatus;
    boardId?: string;
    task?: TaskView;
};

export type TaskPlacement = {
    status: TaskStatus;
    boardId: string;
};

export type TaskFilters = {
    query: string;
    priority: string;
    sort: string;
};
