"use client";
import { useForm } from "react-hook-form";
import { saveTask } from "@/actions/task.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskFormSchema } from "@/schemas/task.schema";
import type { TaskFormInput, TaskStatus, TaskView } from "@/types/task.types";

export function useTaskForm(task: TaskView | undefined, status: TaskStatus, onClose: () => void, boardId?: string) {
    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<TaskFormInput>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: task ?? {
            title: "",
            description: "",
            status,
            priority: "MEDIUM",
            dueDate: "",
            boardId,
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            const result = await saveTask({
                id: task?.id,
                task: { ...values, boardId: boardId ?? task?.boardId ?? values.boardId },
            });

            if (!result.ok) setError("root", { message: result.error });
            else onClose();
        } catch {
            setError("root", { message: "Connection failed. Try again." });
        }
    });

    return { control, errors, isSubmitting, onSubmit };
}
