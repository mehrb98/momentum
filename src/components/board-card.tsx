"use client";

import { StatusIcon } from "./task-card";
import type { BoardCardProps } from "@/types/board.types";
import { Card, Chip, Dropdown, Label } from "@heroui/react";
import { Ellipsis, Pencil, TrashBin } from "@gravity-ui/icons";

export function BoardCard({ name, statusName, statusColor, isDisabled, onEdit, onDelete }: BoardCardProps) {
    return (
        <Card className="gap-3 p-5">
            <Card.Header className="items-start gap-2">
                <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {statusColor && <StatusIcon color={statusColor} />}
                        <Card.Title className="cursor-pointer hover:text-accent" onClick={onEdit}>
                            {name}
                        </Card.Title>
                    </div>

                    <Dropdown>
                        <Dropdown.Trigger
                            aria-label={`Actions for ${name}`}
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

                {statusName && (
                    <Chip variant="soft" size="sm">
                        {statusName}
                    </Chip>
                )}
            </Card.Header>
        </Card>
    );
}
