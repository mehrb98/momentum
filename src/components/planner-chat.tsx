"use client";
import { useEffect, useRef } from "react";
import { Controller } from "react-hook-form";
import { ArrowRotateLeft } from "@gravity-ui/icons";
import type { PlannerChatProps } from "@/types/planner.types";
import { suggestions, useTaskPlanner } from "@/hooks/planner/useTaskPlanner";

import {
    Avatar,
    Button,
    Card,
    CloseButton,
    FieldError,
    Form,
    ScrollShadow,
    Spinner,
    Surface,
    TextArea,
    TextField,
    Typography,
} from "@heroui/react";


export function PlannerChat({ aiEnabled }: PlannerChatProps) {
    const planner = useTaskPlanner();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current?.scrollHeight ?? 0,
            behavior: "smooth",
        });
        
    }, [planner.messages.length, planner.thinking]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {planner.isOpen && (
                <Card
                    role="dialog"
                    aria-label="AI assistant"
                    className="h-[min(620px,calc(100dvh-7.5rem))] w-[min(400px,calc(100vw-3rem))] gap-0 overflow-hidden border border-separator p-0 shadow-2xl"
                >
                    <Card.Header className="flex-row items-center gap-3 border-b border-separator px-5 py-4">
                        <Avatar size="sm" color="accent" variant="soft">
                            <Avatar.Fallback>✧</Avatar.Fallback>
                        </Avatar>
                        
                        <div className="flex flex-1 flex-col">
                            <Card.Title className="font-semibold">Assistant</Card.Title>
                            
                            <Card.Description className="text-xs">
                                {aiEnabled ? "Plans tasks, boards, and statuses" : "Not configured"}
                            </Card.Description>
                        </div>
                        
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label="New chat"
                            isDisabled={planner.thinking || planner.messages.length === 1}
                            onPress={planner.onReset}
                        >
                            <ArrowRotateLeft className="size-4" />
                        </Button>
                        <CloseButton aria-label="Close assistant" onPress={planner.onClose} />
                    </Card.Header>

                    <ScrollShadow ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
                        {planner.messages.map((m) => (
                            <Surface
                                key={m.id}
                                variant="secondary"
                                className={
                                    "max-w-[85%] whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-2.5 text-sm " +
                                    (m.role === "user"
                                        ? "self-end rounded-br-md bg-accent text-accent-foreground"
                                        : m.isError
                                          ? "self-start rounded-bl-md bg-danger-soft text-danger-soft-foreground"
                                          : "self-start rounded-bl-md")
                                }
                            >
                                {m.text}
                            </Surface>
                        ))}

                        {aiEnabled && planner.showSuggestions && (
                            <div className="flex flex-col items-start gap-2">
                                {suggestions.map((text) => (
                                    <Button
                                        key={text}
                                        size="sm"
                                        variant="outline"
                                        className="h-auto whitespace-normal py-1.5 text-left"
                                        onPress={() => planner.onSuggestion(text)}
                                    >
                                        {text}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {planner.thinking && (
                            <Surface
                                variant="secondary"
                                className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-muted"
                            >
                                <Spinner size="sm" />
                                
                                Working on it…
                            </Surface>
                        )}
                    </ScrollShadow>

                    <Card.Footer className="border-t border-separator p-3">
                        {aiEnabled ? (
                            <Form onSubmit={planner.onSend} className="flex w-full items-end gap-2">
                                <Controller
                                    control={planner.control}
                                    name="prompt"
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            fullWidth
                                            aria-label="Message the assistant"
                                            className="flex-1"
                                            name={field.name}
                                            value={field.value}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            isInvalid={fieldState.invalid}
                                            validationBehavior="aria"
                                        >
                                            <TextArea
                                                ref={field.ref}
                                                rows={2}
                                                placeholder="Ask anything or tell me what to change…"
                                                onKeyDown={planner.onPromptKeyDown}
                                            />
                                            
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </TextField>
                                    )}
                                />
                                
                                <Button 
                                    type="submit" 
                                    isIconOnly 
                                    aria-label="Send" 
                                    isDisabled={planner.thinking}
                                >
                                    ↑
                                </Button>
                            </Form>
                        ) : (
                            <Typography type="body-xs" color="muted" align="center" className="w-full px-2 py-1">
                                Add an OpenAI API key to enable the assistant. Manual tasks are ready to use.
                            </Typography>
                        )}
                    </Card.Footer>
                </Card>
            )}

            <Button
                size="lg"
                isIconOnly
                onPress={planner.onToggle}
                aria-expanded={planner.isOpen}
                className="size-14 rounded-full text-xl shadow-lg"
                aria-label={planner.isOpen ? "Close assistant" : "Open AI assistant"}
            >
                {planner.isOpen ? "✕" : "✧"}
            </Button>
        </div>
    );
}
