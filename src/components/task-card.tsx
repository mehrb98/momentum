"use client";

import { toCssColor } from "@/utils/color";
import type { TaskCardProps } from "@/types/task.types";
import { Card, Chip, cn, Dropdown, Label, Typography } from "@heroui/react";
import type { StatusChipProps, StatusIconProps } from "@/types/status.types";
import { Calendar, Ellipsis, Grip, Pencil, TrashBin } from "@gravity-ui/icons";

export function StatusIcon({ color, className = "" }: StatusIconProps) {
    return (
        <span
            aria-hidden
            className={cn("inline-block size-2.5 shrink-0 rounded-full", className)}
            style={{ backgroundColor: toCssColor(color) }}
        />
    );
}

export function StatusChip({ color, children }: StatusChipProps) {
    return (
        <Chip variant="soft" size="sm">
            <StatusIcon color={color} />
            <Chip.Label>{children}</Chip.Label>
        </Chip>
    );
}

export function TaskCard({
    title,
    description,
    priority,
    dueLabel,
    isOverdue,
    isDisabled,
    onEdit,
    onDelete,
    onDragStart,
    onDragEnd,
}: TaskCardProps) {
    return (
        <Card className="gap-3 p-4">
            <Card.Header className="items-start gap-2">
                <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span
                            draggable
                            aria-label={`Move ${title}`}
                            className="cursor-grab text-muted active:cursor-grabbing"
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        >
                            <Grip className="size-4" />
                        </span>

                        <Chip variant="soft" size="sm" color={priority.color}>
                            {priority.title}
                        </Chip>
                    </div>

                    <Dropdown>
                        <Dropdown.Trigger
                            aria-label={`Actions for ${title}`}
                            className="-mr-2 -mt-1 flex size-8 items-center justify-center rounded-field text-muted hover:bg-default"
                            isDisabled={isDisabled}
                        >
                            <Ellipsis className="size-4" />
                        </Dropdown.Trigger>
                        <Dropdown.Popover placement="bottom end" className="min-w-40">
                            <Dropdown.Menu
                                onAction={(key) => {
                                    if (key === "edit") onEdit();
                                    if (key === "delete") onDelete();
                                }}
                            >
                                <Dropdown.Item id="edit" textValue="Edit">
                                    <Pencil className="size-4 text-muted" />
                                    <Label>Edit</Label>
                                </Dropdown.Item>
                                <Dropdown.Item id="delete" textValue="Delete" variant="danger">
                                    <TrashBin className="size-4" />
                                    <Label>Delete</Label>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                </div>

                <Card.Title
                    className="cursor-pointer wrap-break-word font-semibold hover:text-accent"
                    onClick={onEdit}
                >
                    {title}
                </Card.Title>

                {description && (
                    <Card.Description className="whitespace-pre-wrap wrap-break-word text-xs">
                        {description}
                    </Card.Description>
                )}

                <Typography
                    type="body-xs"
                    color="muted"
                    className={`flex items-center gap-1.5 ${isOverdue ? "text-danger" : ""}`}
                >
                    <Calendar className="size-3.5 shrink-0" />
                    {dueLabel ? (isOverdue ? `Overdue ${dueLabel}` : dueLabel) : "No due date"}
                </Typography>
            </Card.Header>
        </Card>
    );
}
