"use client";

import * as HeroUI from "@heroui/react";
import { OptionSelect } from "./option-select";
import { Controller } from "react-hook-form";
import { FormField } from "@/components/form-field";
import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import { DateFormField } from "@/components/date-form-field";
import type { TaskFormBodyProps, TaskFormProps } from "@/types/task.types";
import { priorities } from "@/hooks/tasks/useTaskBoard";

const FORM_ID = "task-form";

export function TaskForm({ isOpen, formKey, status, statuses, boardId, task, onClose }: TaskFormProps) {
    return (
        <HeroUI.Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <HeroUI.Modal.Container size="md" placement="center" scroll="inside">
                <HeroUI.Modal.Dialog aria-label={task ? "Edit task" : "New task"}>
                    <TaskFormBody
                        key={formKey}
                        task={task}
                        status={status}
                        statuses={statuses}
                        boardId={boardId}
                        onClose={onClose}
                    />
                </HeroUI.Modal.Dialog>
            </HeroUI.Modal.Container>
        </HeroUI.Modal.Backdrop>
    );
}

function TaskFormBody({ task, status, statuses, boardId, onClose }: TaskFormBodyProps) {
    const { control, errors, isSubmitting, onSubmit } = useTaskForm(task, status, onClose, boardId);

    return (
        <>
            <HeroUI.Modal.CloseTrigger />

            <HeroUI.Modal.Header>
                <HeroUI.Modal.Heading>{task ? "Edit task" : "New task"}</HeroUI.Modal.Heading>
            </HeroUI.Modal.Header>

            <HeroUI.Modal.Body>
                <HeroUI.Form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4">
                    <FormField control={control} name="title" label="Title" autoFocus placeholder="Task title" />

                    <FormField
                        control={control}
                        name="description"
                        label="Description"
                        multiline
                        placeholder="What needs to be done?"
                    />

                    <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                            <OptionSelect
                                label="Status"
                                options={statuses.map((item) => ({ id: item.id, title: item.name }))}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="priority"
                        render={({ field }) => (
                            <OptionSelect
                                label="Priority"
                                options={priorities}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    <DateFormField control={control} name="dueDate" label="Due date" />

                    {errors.root?.message && (
                        <HeroUI.Alert status="danger">
                            <HeroUI.Alert.Indicator />
                            <HeroUI.Alert.Content>
                                <HeroUI.Alert.Title>{errors.root.message}</HeroUI.Alert.Title>
                            </HeroUI.Alert.Content>
                        </HeroUI.Alert>
                    )}
                </HeroUI.Form>
            </HeroUI.Modal.Body>

            <HeroUI.Modal.Footer>
                <HeroUI.Button variant="tertiary" onPress={onClose}>
                    Cancel
                </HeroUI.Button>

                <HeroUI.Button type="submit" form={FORM_ID} isDisabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : task ? "Save" : "Create task"}
                </HeroUI.Button>
            </HeroUI.Modal.Footer>
        </>
    );
}
