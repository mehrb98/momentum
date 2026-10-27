"use client";

import * as HeroUI from "@heroui/react";
import { Controller } from "react-hook-form";
import { OptionSelect } from "./option-select";
import { FormField } from "@/components/form-field";
import type { BoardFormProps } from "@/types/board.types";
import { useBoardForm } from "@/hooks/tasks/useBoardForm";

const FORM_ID = "board-form";

export function BoardForm({ isOpen, formKey, statuses, board, onClose }: BoardFormProps) {
    return (
        <HeroUI.Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <HeroUI.Modal.Container size="sm" placement="center">
                <HeroUI.Modal.Dialog aria-label={board ? "Edit board" : "New board"}>
                    <BoardFormBody key={formKey} statuses={statuses} board={board} onClose={onClose} />
                </HeroUI.Modal.Dialog>
            </HeroUI.Modal.Container>
        </HeroUI.Modal.Backdrop>
    );
}

function BoardFormBody({ statuses, board, onClose }: Pick<BoardFormProps, "statuses" | "board" | "onClose">) {
    const { control, errors, isSubmitting, onSubmit } = useBoardForm(onClose, board, statuses[0]?.id);

    return (
        <>
            <HeroUI.Modal.CloseTrigger />

            <HeroUI.Modal.Header>
                <HeroUI.Modal.Heading>{board ? "Edit board" : "New board"}</HeroUI.Modal.Heading>
            </HeroUI.Modal.Header>

            <HeroUI.Modal.Body>
                <HeroUI.Form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4">
                    <FormField control={control} name="name" label="Name" autoFocus placeholder="Board name" />

                    <Controller
                        control={control}
                        name="statusId"
                        render={({ field }) => (
                            <OptionSelect
                                label="Status"
                                options={statuses.map((status) => ({ id: status.id, title: status.name }))}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />

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
                    {isSubmitting ? "Saving…" : board ? "Save" : "Create board"}
                </HeroUI.Button>
            </HeroUI.Modal.Footer>
        </>
    );
}
