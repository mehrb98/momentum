"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSignOut } from "@/hooks/auth/useSignOut";
import { TelegramConnectionFields } from "./settings-form";
import type { SettingsModalProps, ThemeToggleProps, UserMenuProps } from "@/types/user-menu.types";
import { ArrowRightFromSquare, ChevronsExpandVertical, Display, Gear, Moon, Sun } from "@gravity-ui/icons";
import { Avatar, Dropdown, Label, Modal, Separator, ToggleButton, ToggleButtonGroup, Typography } from "@heroui/react";

const themes = [
    { id: "light", title: "Light", Icon: Sun },
    { id: "dark", title: "Dark", Icon: Moon },
    { id: "system", title: "System", Icon: Display },
] as const;

export function UserMenu({ name, compact = false, telegram }: UserMenuProps) {
    const { signOut, error } = useSignOut();
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <>
            <Dropdown>
                <Dropdown.Trigger
                    aria-label="Account menu"
                    className={
                        compact
                            ? "rounded-full"
                            : "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-default"
                    }
                >
                    <Avatar size="sm">
                        <Avatar.Fallback>{name.slice(0, 1).toUpperCase()}</Avatar.Fallback>
                    </Avatar>

                    {!compact && (
                        <>
                            <span className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate text-sm font-semibold">{name}</span>
                                <span className="text-xs text-muted">{error || "Personal account"}</span>
                            </span>
                            <ChevronsExpandVertical className="size-4 text-muted" />
                        </>
                    )}
                </Dropdown.Trigger>

                <Dropdown.Popover placement={compact ? "bottom end" : "top start"} className="min-w-56">
                    <div className="w-full px-3 pt-3 pb-1">
                        <ThemeToggle />
                    </div>

                    <Separator className="my-1" />

                    <Dropdown.Menu
                        onAction={(key) => {
                            if (key === "settings") setSettingsOpen(true);
                            if (key === "sign-out") signOut();
                        }}
                    >
                        <Dropdown.Item id="settings" textValue="Settings">
                            <Gear className="size-4 text-muted" />
                            <Label>Settings</Label>
                        </Dropdown.Item>
                        <Dropdown.Item id="sign-out" textValue="Sign out" variant="danger">
                            <ArrowRightFromSquare className="size-4" />
                            <Label>Sign out</Label>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>

            <SettingsModal isOpen={settingsOpen} telegram={telegram} onClose={() => setSettingsOpen(false)} />
        </>
    );
}

function ThemeToggle({ fullWidth = true }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <ToggleButtonGroup
            aria-label="Theme"
            size="sm"
            fullWidth={fullWidth}
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={mounted && theme ? new Set([theme]) : new Set()}
            onSelectionChange={(keys) => {
                const [next] = [...keys];
                if (next) setTheme(String(next));
            }}
        >
            {themes.map(({ id, title, Icon }, index) => (
                <ToggleButton key={id} id={id} isIconOnly aria-label={title}>
                    {index > 0 && <ToggleButtonGroup.Separator />}
                    <Icon className="size-4" />
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}

function SettingsModal({ isOpen, telegram, onClose }: SettingsModalProps) {
    if (!isOpen) return null;

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Modal.Container size="md" placement="center">
                <Modal.Dialog aria-label="Settings">
                    <Modal.CloseTrigger />

                    <Modal.Header>
                        <Modal.Heading>Settings</Modal.Heading>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-3">
                                <Typography type="body-sm" weight="medium">
                                    Theme
                                </Typography>
                                <ThemeToggle />
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-3">
                                <Typography type="body-sm" weight="medium">
                                    Connections
                                </Typography>
                                <TelegramConnectionFields connection={telegram} />
                            </div>
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
