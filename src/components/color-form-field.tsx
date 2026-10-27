"use client";

import { toCssColor } from "@/utils/color";
import { FieldError } from "@heroui/react";
import { CellColorPicker } from "./cell-color-picker";
import type { ColorFormFieldProps } from "@/types/form.types";
import { Controller, type FieldValues } from "react-hook-form";

export function ColorFormField<T extends FieldValues>({ control, name, label }: ColorFormFieldProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <div className="flex flex-col gap-2">
                    <CellColorPicker
                        value={toCssColor(field.value ?? "")}
                        onChange={(color) => field.onChange(color.toString("hex"))}
                    >
                        <CellColorPicker.Label>{label}</CellColorPicker.Label>
                        <CellColorPicker.Trigger aria-label={label} />
                        <CellColorPicker.ValueDisplay />
                        <CellColorPicker.Popover>
                            <CellColorPicker.Swatch />
                        </CellColorPicker.Popover>
                    </CellColorPicker>
                    <FieldError>{fieldState.error?.message}</FieldError>
                </div>
            )}
        />
    );
}
