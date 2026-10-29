"use client";

import * as HeroUI from "@heroui/react";
import { Controller } from "react-hook-form";
import { OptionSelect } from "./option-select";
import { FormField } from "@/components/form-field";
import { useUserForm } from "@/hooks/users/useUserForm";
import type { UserFormProps } from "@/types/user.types";

const FORM_ID = "user-form";

const roleOptions = [
    { id: "customer", title: "Customer" },
    { id: "admin", title: "Admin" },
];

export function UserForm({ isOpen, formKey, user, onClose }: UserFormProps) {
    return (
        <HeroUI.Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <HeroUI.Modal.Container size="sm" placement="center">
                <HeroUI.Modal.Dialog aria-label={user ? "Edit user" : "New user"}>
                    <UserFormBody key={formKey} user={user} onClose={onClose} />
                </HeroUI.Modal.Dialog>
            </HeroUI.Modal.Container>
        </HeroUI.Modal.Backdrop>
    );
}

function UserFormBody({ user, onClose }: Pick<UserFormProps, "user" | "onClose">) {
    const { control, errors, isSubmitting, onSubmit } = useUserForm(onClose, user);

    return (
        <>
            <HeroUI.Modal.CloseTrigger />

            <HeroUI.Modal.Header>
                <HeroUI.Modal.Heading>{user ? "Edit user" : "New user"}</HeroUI.Modal.Heading>
            </HeroUI.Modal.Header>

            <HeroUI.Modal.Body>
                <HeroUI.Form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-4">
                    <FormField control={control} name="name" label="Name" autoFocus placeholder="Full name" />
                    <FormField
                        control={control}
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="name@example.com"
                    />

                    <Controller
                        control={control}
                        name="role"
                        render={({ field }) => (
                            <OptionSelect
                                label="Role"
                                options={roleOptions}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    <FormField
                        control={control}
                        name="password"
                        type="password"
                        label={user ? "New password" : "Password"}
                        placeholder={user ? "Leave empty to keep the current one" : "At least 12 characters"}
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
                    {isSubmitting ? "Saving…" : user ? "Save" : "Create user"}
                </HeroUI.Button>
            </HeroUI.Modal.Footer>
        </>
    );
}
