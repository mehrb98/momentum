"use client";

import { FormField } from "./form-field";
import { LogoTelegram } from "@gravity-ui/icons";
import { useTelegramConnection } from "@/hooks/settings/useTelegramConnection";
import type { TelegramConnectionFieldsProps } from "@/types/connection.types";
import { Alert, Button, Chip, Form, Typography } from "@heroui/react";

const FORM_ID = "telegram-connection-form";

export function TelegramConnectionFields({ connection }: TelegramConnectionFieldsProps) {
    const { control, errors, isSubmitting, onSubmit, onDisconnect } = useTelegramConnection(connection);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <LogoTelegram className="size-4 text-muted" />
                    <Typography type="body-sm" weight="medium">
                        Telegram bot
                    </Typography>
                </div>

                {connection.connected && (
                    <Chip size="sm" color="success" variant="soft">
                        {connection.botUsername ? `@${connection.botUsername}` : "Connected"}
                    </Chip>
                )}
            </div>

            <Typography type="body-xs" color="muted">
                Paste the token from @BotFather and the chat id this bot should use. After connecting,
                send the bot a text or voice message to list, create, edit, or delete tasks, boards, and
                statuses.
            </Typography>

            <Form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4">
                <FormField
                    control={control}
                    name="botToken"
                    label="Bot token"
                    type="password"
                    autoComplete="off"
                    placeholder={connection.tokenMasked || "123456:ABC…"}
                />

                <FormField
                    control={control}
                    name="chatId"
                    label="Chat id"
                    placeholder="@username or -100…"
                />

                {errors.root?.message && (
                    <Alert status="danger">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>{errors.root.message}</Alert.Title>
                        </Alert.Content>
                    </Alert>
                )}

                <div className="flex justify-end gap-2">
                    {connection.connected && (
                        <Button variant="tertiary" isDisabled={isSubmitting} onPress={onDisconnect}>
                            Disconnect
                        </Button>
                    )}

                    <Button type="submit" form={FORM_ID} isDisabled={isSubmitting}>
                        {isSubmitting ? "Saving…" : connection.connected ? "Update" : "Connect"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}
