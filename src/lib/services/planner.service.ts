import "server-only";
import { db } from "@/lib/db";
import { createAssistant } from "@/lib/ai/assistant";
import type { PlannerHistoryMessage } from "@/types/planner.types";

export async function chatWithAssistant(userId: string, messages: PlannerHistoryMessage[]) {
    const count = await db.$executeRaw`
            INSERT INTO "AiUsage" ("userId", "windowStart", "count") 
            VALUES (${userId}, NOW(), 1) ON CONFLICT ("userId") 
            DO UPDATE SET "count" = CASE WHEN "AiUsage"."windowStart" < NOW() - INTERVAL '1 hour' THEN 1 ELSE "AiUsage"."count" + 1 END, 
            "windowStart" = CASE WHEN "AiUsage"."windowStart" < NOW() - INTERVAL '1 hour' THEN NOW() ELSE "AiUsage"."windowStart" 
            END WHERE "AiUsage"."count" < 30 OR "AiUsage"."windowStart" < NOW() - INTERVAL '1 hour'
    `;

    if (!count) throw new Error("AI request limit reached");

    let changed = false;
    
    const assistant = createAssistant(userId, () => {
        changed = true;
    });

    const result = await assistant.invoke({ messages }, { recursionLimit: 16 });
    
    const last = result.messages.at(-1);
    const reply = typeof last?.content === "string" ? last.content.trim() : "";

    return { reply: reply || "Done.", changed };
}
