import "server-only";
import { z } from "zod";
import type { Result } from "@/types/action.types";

export async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
        return { ok: true, data: await fn() };
    } catch (error) {
        if (error instanceof z.ZodError)
            return {
                ok: false,
                error: error.issues[0]?.message ?? "Invalid input.",
            };

        console.error("Task action failed", error instanceof Error ? error.name : "Unknown");
        
        return {
            ok: false,
            error: "Unable to complete this request. Check your session and try again.",
        };
    }
}
