"use server";

import { requireUser } from "@/lib/auth";
import { run } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { saveStatusSchema, statusIdSchema } from "@/schemas/status.schema";
import { createOwnedStatus, deleteOwnedStatus, updateOwnedStatus } from "@/lib/services/statuses";

export async function saveStatus(input: unknown) {
    return run(async () => {
        const user = await requireUser();
        const { id, status } = saveStatusSchema.parse(input);

        if (id) await updateOwnedStatus(user.id, id, status);
        else await createOwnedStatus(user.id, status);

        revalidatePath("/");
    });
}

export async function deleteStatus(input: unknown) {
    return run(async () => {
        const user = await requireUser();

        await deleteOwnedStatus(user.id, statusIdSchema.parse(input));

        revalidatePath("/");
    });
}
