"use client";

import type { FormFieldProps } from "@/types/form.types";
import { Controller, type FieldValues } from "react-hook-form";
import { FieldError, Input, Label, TextArea, TextField } from "@heroui/react";

export function FormField<T extends FieldValues>({
    control,
    name,
    label,
    multiline,
    placeholder,
    ...fieldProps
}: FormFieldProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <TextField
                    {...fieldProps}
                    fullWidth
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    isInvalid={fieldState.invalid}
                    validationBehavior="aria"
                >
                    <Label>{label}</Label>
                    {multiline ? (
                        <TextArea ref={field.ref} placeholder={placeholder} rows={4} />
                    ) : (
                        <Input ref={field.ref} type={fieldProps.type} placeholder={placeholder} />
                    )}
                    <FieldError>{fieldState.error?.message}</FieldError>
                </TextField>
            )}
        />
    );
}
