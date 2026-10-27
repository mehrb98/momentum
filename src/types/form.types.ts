import type { Control, FieldPath, FieldValues } from "react-hook-form";

export type FormFieldProps<T extends FieldValues> = {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    type?: "text" | "email" | "password";
    autoComplete?: string;
    autoFocus?: boolean;
    placeholder?: string;
    multiline?: boolean;
};

export type DateFormFieldProps<T extends FieldValues> = {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
};

export type ColorFormFieldProps<T extends FieldValues> = {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
};
