import type { z } from "zod";
import type { ReactNode } from "react";
import type { statusColorSchema, statusFormSchema } from "@/schemas/status.schema";

export type StatusColor = z.infer<typeof statusColorSchema>;
export type StatusFormInput = z.infer<typeof statusFormSchema>;

export type StatusView = {
    id: string;
    name: string;
    color: StatusColor;
    closes: boolean;
    key?: string;
    sortOrder: number;
};

export type StatusFormProps = {
    isOpen: boolean;
    formKey: number;
    status?: StatusView;
    onClose: () => void;
};

export type StatusCardProps = {
    name: string;
    color: StatusColor;
    taskCount: number;
    isDisabled?: boolean;
    onEdit: () => void;
    onDelete: () => void;
};

export type StatusIconProps = {
    color: StatusColor;
    className?: string;
};

export type StatusChipProps = {
    color: StatusColor;
    children: ReactNode;
};

export type StatusEditor = {
    isOpen: boolean;
    key: number;
    status?: StatusView;
};
