"use server";

import { requireUser } from "@/lib/auth";
import { run } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { chatSchema } from "@/schemas/planner.schema";
import { chatWithAssistant } from "@/lib/services/planner.service";

export async function sendMessage(input: unknown) {
    return run(async () => {
        const user = await requireUser();
        
        const { messages } = chatSchema.parse(input);
        const result = await chatWithAssistant(user.id, messages);

        if (result.changed) revalidatePath("/");

        return result;
    });
}
