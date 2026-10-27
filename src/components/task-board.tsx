"use client";

import { useState } from "react";
import { StatusIcon, TaskCard } from "./task-card";
import { readPayload, setPayload } from "@/utils/drag";
import type { BoardDragState, TaskBoardProps } from "@/types/board.types";
import { Ellipsis, GripHorizontal, Pencil, TrashBin } from "@gravity-ui/icons";
import { Button, Card, Chip, Dropdown, EmptyState, Label, ScrollShadow, Typography } from "@heroui/react";

export function TaskBoard({ columns, pending, onMoveTask, onReorderColumns }: TaskBoardProps) {
    const [drag, setDrag] = useState<BoardDragState>(null);
    const [over, setOver] = useState<string | null>(null);

    function onDropColumn(boardId: string, event: React.DragEvent) {
        event.preventDefault();
        
        const payload = readPayload(event) ?? drag;
        
        setOver(null);
        setDrag(null);
        
        if (!payload) return;

        if (payload.kind === "task") onMoveTask(payload.id, boardId);
        if (payload.kind === "column") onReorderColumns(payload.id, boardId);
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-2">
            {columns.map((col) => {
                const isOver = over === col.id && drag?.id !== col.id;

                return (
                    <Card
                        key={col.id}
                        variant="secondary"
                        className={`w-72 shrink-0 max-h-130 min-h-72 gap-0 overflow-hidden p-0 md:h-[min(640px,calc(100dvh-10rem))] md:max-h-none ${
                            isOver ? "ring-2 ring-accent" : ""
                        } ${drag?.kind === "column" && drag.id === col.id ? "opacity-60" : ""}`}
                        onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "move";
                            setOver(col.id);
                        }}
                        onDragLeave={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget as Node)) setOver(null);
                        }}
                        onDrop={(event) => onDropColumn(col.id, event)}
                    >
                        <Card.Header className="flex-row items-center gap-2 bg-surface-secondary px-3 py-2">
                            <span
                                draggable
                                aria-label={`Move ${col.title} column`}
                                className="cursor-grab text-muted active:cursor-grabbing"
                                onDragStart={(event) => {
                                    setPayload(event, "column", col.id);
                                    setDrag({ kind: "column", id: col.id });
                                }}
                                onDragEnd={() => {
                                    setDrag(null);
                                    setOver(null);
                                }}
                            >
                                <GripHorizontal className="size-4" />
                            </span>
                            
                            <StatusIcon color={col.status.color} />
                            
                            <Typography type="body-sm" weight="semibold">
                                {col.title}
                            </Typography>
                            
                            <Chip size="sm">{col.tasks.length}</Chip>
                            
                            <Button variant="ghost" size="sm" className="ml-auto" onPress={col.onAdd}>
                                ＋ Add
                            </Button>

                            <Dropdown>
                                <Dropdown.Trigger
                                    aria-label={`Actions for ${col.title}`}
                                    className="flex size-8 items-center justify-center rounded-field text-muted hover:bg-default"
                                    isDisabled={pending}
                                >
                                    <Ellipsis className="size-4" />
                                </Dropdown.Trigger>
                                <Dropdown.Popover placement="bottom end" className="min-w-40">
                                    <Dropdown.Menu
                                        onAction={(key) => {
                                            if (key === "edit") col.onEdit();
                                            if (key === "delete") col.onDelete();
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
                        </Card.Header>

                        <ScrollShadow
                            aria-label={`${col.title} tasks`}
                            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3"
                        >
                            {col.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={drag?.kind === "task" && drag.id === task.id ? "opacity-50" : ""}
                                >
                                    <TaskCard
                                        title={task.title}
                                        description={task.description}
                                        priority={task.priorityOption}
                                        dueLabel={task.dueLabel}
                                        isOverdue={task.isOverdue}
                                        isDisabled={pending}
                                        onEdit={task.onEdit}
                                        onDelete={task.onDelete}
                                        onDragStart={(event) => {
                                            setPayload(event, "task", task.id);
                                            setDrag({ kind: "task", id: task.id });
                                        }}
                                        onDragEnd={() => {
                                            setDrag(null);
                                            setOver(null);
                                        }}
                                    />
                                </div>
                            ))}

                            {!col.tasks.length && (
                                <EmptyState className="py-10 text-center text-xs text-muted">
                                    {col.emptyText}
                                </EmptyState>
                            )}
                        </ScrollShadow>
                    </Card>
                );
            })}
        </div>
    );
}
