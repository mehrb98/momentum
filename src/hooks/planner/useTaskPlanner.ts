"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendMessage } from "@/actions/planner.actions";
import { promptSchema } from "@/schemas/planner.schema";
import { useState, useRef, type KeyboardEvent } from "react";
import type { ChatMessage, PromptInput } from "@/types/planner.types";

const HISTORY_LIMIT = 20;

const greeting: ChatMessage = {
    id: 0,
    role: "assistant",
    text: "Hi! I can plan goals, and create, edit, move, or delete tasks, boards, and statuses. What do you need?",
};

export const suggestions = [
    "Plan launching my portfolio next week",
    "What should I focus on today?",
    "Add a Review board with an In progress status",
];

export function useTaskPlanner() {
    const router = useRouter();

    const [isOpen, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
    const [thinking, setThinking] = useState(false);

    const nextId = useRef(1);

    const form = useForm<PromptInput>({
        resolver: zodResolver(promptSchema),
        defaultValues: { prompt: "" },
    });

    async function send(prompt: string) {
        if (thinking) return;

        const userMessage: ChatMessage = { id: nextId.current++, role: "user", text: prompt };
        
        const history = [...messages, userMessage]
            .filter((m) => m.id !== greeting.id && !m.isError)
            .slice(-HISTORY_LIMIT)
            .map((m) => ({ role: m.role, content: m.text }));

        setMessages((items) => [...items, userMessage]);
        
        form.reset();
        setThinking(true);

        const reply = (text: string, isError = false) =>
            setMessages((items) => [...items, { id: nextId.current++, role: "assistant", text, isError }]);

        try {
            const result = await sendMessage({ messages: history });

            if (!result.ok) {
                reply(result.error, true);
            } else {
                reply(result.data.reply);
                if (result.data.changed) router.refresh();
            }
        } catch {
            reply("Unable to reach the assistant. Try again.", true);
        } finally {
            setThinking(false);
        }
    }

    const onSend = form.handleSubmit(({ prompt }) => send(prompt));

    return {
        control: form.control,
        isOpen,
        messages,
        thinking,
        showSuggestions: messages.length === 1 && !thinking,
        onSend,
        onSuggestion: (text: string) => send(text),
        onToggle: () => setOpen((open) => !open),
        onClose: () => setOpen(false),
        onReset: () => setMessages([greeting]),

        onPromptKeyDown: (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
            }
        },
    };
}
