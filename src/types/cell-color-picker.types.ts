import type { ComponentProps, ReactNode } from "react";
import type { ColorPicker, ColorSwatch } from "@heroui/react";

export type CellColorPickerRootProps = Omit<ComponentProps<typeof ColorPicker>, "children"> & {
    variant?: "default" | "secondary";
    children: ReactNode;
};

export type CellColorPickerLabelProps = ComponentProps<"span">;

export type CellColorPickerTriggerProps = ComponentProps<typeof ColorPicker.Trigger>;

export type CellColorPickerValueDisplayProps = ComponentProps<"span">;

export type CellColorPickerPopoverProps = ComponentProps<typeof ColorPicker.Popover>;

export type CellColorPickerSwatchProps = ComponentProps<typeof ColorSwatch>;
