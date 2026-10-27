"use server";

import { requireUser } from "@/lib/auth";
import { run } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { telegramConnectionFormSchema } from "@/schemas/connection.schema";
import { deleteTelegramConnection, saveTelegramConnection } from "@/lib/services/connections";

export async function saveTelegram(input: unknown) {
    return run(async () => {
        const user = await requireUser();

        await saveTelegramConnection(user.id, telegramConnectionFormSchema.parse(input));

        revalidatePath("/");
    });
}

export async function disconnectTelegram() {
    return run(async () => {
        const user = await requireUser();

        await deleteTelegramConnection(user.id);

        revalidatePath("/");
    });
}
