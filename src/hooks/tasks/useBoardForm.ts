"use client";

import { useForm } from "react-hook-form";
import { saveBoard } from "@/actions/board.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { boardFormSchema } from "@/schemas/board.schema";
import type { BoardFormInput, BoardView } from "@/types/board.types";

export function useBoardForm(onClose: () => void, board?: BoardView, defaultStatusId?: string) {
    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<BoardFormInput>({
        resolver: zodResolver(boardFormSchema),
        defaultValues: board
            ? { name: board.name, statusId: board.statusId }
            : { name: "", statusId: defaultStatusId ?? "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            const result = await saveBoard({ id: board?.id, board: values });

            if (!result.ok) setError("root", { message: result.error });
            else onClose();
        } catch {
            setError("root", { message: "Connection failed. Try again." });
        }
    });

    return { control, errors, isSubmitting, onSubmit };
}
