"use server";

import { requireUser } from "@/lib/auth";
import { run } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { saveOwnedTask, deleteOwnedTask, updateOwnedStatus } from "@/lib/services/tasks";
import { changeStatusSchema, saveTaskSchema, taskIdSchema } from "@/schemas/task.schema";

export async function saveTask(input: unknown) {
    return run(async () => {
        const user = await requireUser();

        const { id, task } = saveTaskSchema.parse(input);

        await saveOwnedTask(user.id, task, id);

        revalidatePath("/");
    });
}

export async function changeTaskStatus(input: unknown) {
    return run(async () => {
        const user = await requireUser();

        const { id, status, boardId } = changeStatusSchema.parse(input);

        await updateOwnedStatus(user.id, id, status, boardId);

        revalidatePath("/");
    });
}

export async function deleteTask(input: unknown) {
    return run(async () => {
        const user = await requireUser();

        const id = taskIdSchema.parse(input);

        await deleteOwnedTask(user.id, id);

        revalidatePath("/");
    });
}
