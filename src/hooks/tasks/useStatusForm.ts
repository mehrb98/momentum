"use client";

import { useForm } from "react-hook-form";
import { saveStatus } from "@/actions/status.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultStatusColor } from "@/utils/color";
import { statusFormSchema } from "@/schemas/status.schema";
import type { StatusFormInput, StatusView } from "@/types/status.types";

export function useStatusForm(onClose: () => void, status?: StatusView) {
    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<StatusFormInput>({
        resolver: zodResolver(statusFormSchema),
        defaultValues: status
            ? { name: status.name, color: status.color }
            : { name: "", color: defaultStatusColor },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            const result = await saveStatus({ id: status?.id, status: values });

            if (!result.ok) setError("root", { message: result.error });
            else onClose();
        } catch {
            setError("root", { message: "Connection failed. Try again." });
        }
    });

    return { control, errors, isSubmitting, onSubmit };
}
