import type { z } from "zod";
import type { promptSchema } from "@/schemas/planner.schema";

export type PromptInput = z.infer<typeof promptSchema>;

export type PlannerChatProps = {
    aiEnabled: boolean;
};

export type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    text: string;
    isError?: boolean;
};

export type PlannerHistoryMessage = {
    role: "user" | "assistant";
    content: string;
};
