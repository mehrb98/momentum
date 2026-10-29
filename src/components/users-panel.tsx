"use client";

import { useState, useTransition } from "react";
import { UserForm } from "./user-form";
import { DeleteTaskDialog } from "./delete-task-dialog";
import type { Result } from "@/types/action.types";
import { deleteUser, setUserBan } from "@/actions/user.actions";
import type { UserView, UsersPanelProps } from "@/types/user.types";
import { Ban, Ellipsis, LockOpen, Pencil, TrashBin } from "@gravity-ui/icons";
import { Alert, Avatar, Button, Card, Chip, Dropdown, Label, Typography } from "@heroui/react";

export function UsersPanel({ users, currentUserId }: UsersPanelProps) {
    const [editor, setEditor] = useState<{ isOpen: boolean; key: number; user?: UserView }>({ isOpen: false, key: 0 });
    const [deleting, setDeleting] = useState<UserView>();
    const [error, setError] = useState("");
    const [pending, startTransition] = useTransition();

    const openEditor = (user?: UserView) => setEditor((prev) => ({ isOpen: true, key: prev.key + 1, user }));

    const act = (action: () => Promise<Result<unknown>>) =>
        startTransition(async () => {
            const result = await action();
            setError(result.ok ? "" : result.error);
        });

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <Typography type="body-sm" color="muted">
                    {users.length} {users.length === 1 ? "account" : "accounts"}
                </Typography>
                <Button onPress={() => openEditor()}>＋ New user</Button>
            </div>

            {error && (
                <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>{error}</Alert.Title>
                    </Alert.Content>
                </Alert>
            )}

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {users.map((user) => {
                    const isSelf = user.id === currentUserId;

                    return (
                        <Card key={user.id} className="flex-row items-center gap-3 p-4">
                            <Avatar size="sm">
                                <Avatar.Fallback>{user.name.slice(0, 1).toUpperCase()}</Avatar.Fallback>
                            </Avatar>

                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <span className="truncate text-sm font-semibold">
                                    {user.name}
                                    {isSelf && <span className="font-normal text-muted"> (you)</span>}
                                </span>
                                <span className="truncate text-xs text-muted">{user.email}</span>
                                <div className="flex gap-1">
                                    <Chip size="sm" variant="soft" color={user.role === "admin" ? "accent" : "default"}>
                                        {user.role === "admin" ? "Admin" : "Customer"}
                                    </Chip>
                                    {user.banned && (
                                        <Chip size="sm" variant="soft" color="danger">
                                            Banned
                                        </Chip>
                                    )}
                                </div>
                            </div>

                            <Dropdown>
                                <Dropdown.Trigger
                                    aria-label={`Actions for ${user.name}`}
                                    className="flex size-8 items-center justify-center rounded-field text-muted hover:bg-default"
                                    isDisabled={pending}
                                >
                                    <Ellipsis className="size-4" />
                                </Dropdown.Trigger>
                                <Dropdown.Popover placement="bottom end" className="min-w-40">
                                    <Dropdown.Menu
                                        disabledKeys={isSelf ? ["ban", "delete"] : []}
                                        onAction={(key) => {
                                            if (key === "edit") openEditor(user);
                                            if (key === "ban")
                                                act(() => setUserBan({ id: user.id, banned: !user.banned }));
                                            if (key === "delete") setDeleting(user);
                                        }}
                                    >
                                        <Dropdown.Item id="edit" textValue="Edit">
                                            <Pencil className="size-4 text-muted" />
                                            <Label>Edit</Label>
                                        </Dropdown.Item>
                                        <Dropdown.Item id="ban" textValue={user.banned ? "Unban" : "Ban"}>
                                            {user.banned ? (
                                                <LockOpen className="size-4 text-muted" />
                                            ) : (
                                                <Ban className="size-4 text-muted" />
                                            )}
                                            <Label>{user.banned ? "Unban" : "Ban"}</Label>
                                        </Dropdown.Item>
                                        <Dropdown.Item id="delete" textValue="Delete" variant="danger">
                                            <TrashBin className="size-4" />
                                            <Label>Delete</Label>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown.Popover>
                            </Dropdown>
                        </Card>
                    );
                })}
            </div>

            <UserForm
                isOpen={editor.isOpen}
                formKey={editor.key}
                user={editor.user}
                onClose={() => setEditor((prev) => ({ ...prev, isOpen: false }))}
            />

            <DeleteTaskDialog
                isOpen={Boolean(deleting)}
                kind="user"
                name={deleting?.name}
                onCancel={() => setDeleting(undefined)}
                onConfirm={() => {
                    const id = deleting!.id;
                    setDeleting(undefined);
                    act(() => deleteUser(id));
                }}
            />
        </section>
    );
}
