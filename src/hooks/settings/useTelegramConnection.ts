"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { disconnectTelegram, saveTelegram } from "@/actions/connection.actions";
import { telegramConnectionFormSchema } from "@/schemas/connection.schema";
import type { TelegramConnectionInput, TelegramConnectionView } from "@/types/connection.types";

export function useTelegramConnection(connection: TelegramConnectionView) {
    const router = useRouter();
    const {
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<TelegramConnectionInput>({
        resolver: zodResolver(telegramConnectionFormSchema),
        defaultValues: { botToken: "", chatId: connection.chatId },
    });

    const onSubmit = handleSubmit(async (values) => {
        if (!connection.connected && !values.botToken) {
            setError("botToken", { message: "Add a bot token" });
            return;
        }

        try {
            const result = await saveTelegram(values);

            if (!result.ok) setError("root", { message: result.error });
            else {
                reset({ botToken: "", chatId: values.chatId });
                router.refresh();
            }
        } catch {
            setError("root", { message: "Connection failed. Try again." });
        }
    });

    const onDisconnect = async () => {
        try {
            const result = await disconnectTelegram();

            if (!result.ok) setError("root", { message: result.error });
            else {
                reset({ botToken: "", chatId: "" });
                router.refresh();
            }
        } catch {
            setError("root", { message: "Connection failed. Try again." });
        }
    };

    return { control, errors, isSubmitting, onSubmit, onDisconnect };
}
