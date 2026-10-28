"use client";

import * as HeroUI from "@heroui/react";
import { FormField } from "@/components/form-field";
import { useStatusForm } from "@/hooks/tasks/useStatusForm";
import type { StatusFormProps } from "@/types/status.types";
import { ColorFormField } from "@/components/color-form-field";

const FORM_ID = "status-form";

export function StatusForm({ isOpen, formKey, status, onClose }: StatusFormProps) {
    return (
        <HeroUI.Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <HeroUI.Modal.Container size="sm" placement="center">
                <HeroUI.Modal.Dialog aria-label={status ? "Edit status" : "New status"}>
                    <StatusFormBody key={formKey} status={status} onClose={onClose} />
                </HeroUI.Modal.Dialog>
            </HeroUI.Modal.Container>
        </HeroUI.Modal.Backdrop>
    );
}

function StatusFormBody({ status, onClose }: Pick<StatusFormProps, "status" | "onClose">) {
    const { control, errors, isSubmitting, onSubmit } = useStatusForm(onClose, status);

    return (
        <>
            <HeroUI.Modal.CloseTrigger />

            <HeroUI.Modal.Header>
                <HeroUI.Modal.Heading>{status ? "Edit status" : "New status"}</HeroUI.Modal.Heading>
            </HeroUI.Modal.Header>

            <HeroUI.Modal.Body>
                <HeroUI.Form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4">
                    <FormField control={control} name="name" label="Name" autoFocus placeholder="Status name" />

                    <ColorFormField control={control} name="color" label="Color" />

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
                    {isSubmitting ? "Saving…" : status ? "Save" : "Create status"}
                </HeroUI.Button>
            </HeroUI.Modal.Footer>
        </>
    );
}
