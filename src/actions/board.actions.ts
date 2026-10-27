"use server";

import { requireUser } from "@/lib/auth";
import { run } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { boardIdSchema, saveBoardSchema } from "@/schemas/board.schema";
import { createOwnedBoard, deleteOwnedBoard, updateOwnedBoard } from "@/lib/services/boards";

export async function saveBoard(input: unknown) {
    return run(async () => {
        const user = await requireUser();
        const { id, board } = saveBoardSchema.parse(input);

        if (id) await updateOwnedBoard(user.id, id, board);
        else await createOwnedBoard(user.id, board);

        revalidatePath("/");
    });
}

export async function deleteBoard(input: unknown) {
    return run(async () => {
        const user = await requireUser();

        await deleteOwnedBoard(user.id, boardIdSchema.parse(input));

        revalidatePath("/");
    });
}
