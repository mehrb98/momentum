"use client";

import { createContext, use } from "react";
import { ColorPickerStateContext } from "react-aria-components";

import {
    cn,
    ColorArea,
    ColorField,
    ColorPicker,
    ColorSlider,
    ColorSwatch,
    ColorSwatchPicker,
    Label,
} from "@heroui/react";

import type {
    CellColorPickerLabelProps,
    CellColorPickerPopoverProps,
    CellColorPickerRootProps,
    CellColorPickerSwatchProps,
    CellColorPickerTriggerProps,
    CellColorPickerValueDisplayProps,
} from "@/types/cell-color-picker.types";

const presets = ["#71717a", "#f5a524", "#17c964", "#f31260", "#006FEE", "#8b5cf6", "#06b6d4", "#f97316"];

const CellColorPickerContext = createContext<{ variant: "default" | "secondary" }>({ variant: "default" });

function Root({ children, className, variant = "default", ...props }: CellColorPickerRootProps) {
    return (
        <CellColorPickerContext value={{ variant }}>
            <ColorPicker
                {...props}
                className={cn("relative grid w-full grid-cols-[minmax(0,1fr)_auto_1.5rem] items-center fo", className)}
            >
                {children}
            </ColorPicker>
        </CellColorPickerContext>
    );
}

function CellLabel({ children, className, ...props }: CellColorPickerLabelProps) {
    return (
        <span {...props} className={cn("col-start-1 row-start-1 z-1 px-3 text-sm pointer-events-none", className)}>
            {children}
        </span>
    );
}

function Trigger({ children, className, ...props }: CellColorPickerTriggerProps) {
    const { variant } = use(CellColorPickerContext);

    return (
        <ColorPicker.Trigger
            {...props}
            className={cn(
                "col-span-full row-start-1 z-0 flex h-10 w-full items-center justify-end rounded-field border border-field-border px-3",
                "outline-none transition-[background-color,border-color,box-shadow] duration-150",
                "data-hovered:border-field-border-hover",
                "data-focus-visible:border-field-border-focus data-focus-visible:bg-field-focus data-focus-visible:ring-2 data-focus-visible:ring-focus data-focus-visible:ring-offset-2 data-focus-visible:ring-offset-background",
                "aria-expanded:border-field-border-focus",
                variant === "secondary" ? "bg-surface-secondary" : "bg-field-background",
                className,
            )}
        >
            {children ?? <Swatch size="sm" />}
        </ColorPicker.Trigger>
    );
}

function ValueDisplay({ className, ...props }: CellColorPickerValueDisplayProps) {
    const state = use(ColorPickerStateContext);
    const hex = state?.color.toString("hex") ?? "";

    return (
        <span
            {...props}
            className={cn(
                "col-start-2 row-start-1 z-1 pr-6 font-mono text-xs text-muted pointer-events-none",
                className,
            )}
        >
            {hex}
        </span>
    );
}

function Swatch({ className, size = "sm", shape = "circle", ...props }: CellColorPickerSwatchProps) {
    return <ColorSwatch {...props} size={size} shape={shape} className={cn("rounded-full", className)} />;
}

function Popover({ children, className, placement = "bottom end", ...props }: CellColorPickerPopoverProps) {
    return (
        <ColorPicker.Popover {...props} placement={placement} className={cn("z-(--z-index-overlay) gap-2", className)}>
            {children}

            <ColorSwatchPicker className="justify-center pt-2" size="xs">
                {presets.map((preset) => (
                    <ColorSwatchPicker.Item key={preset} color={preset}>
                        <ColorSwatchPicker.Swatch />
                    </ColorSwatchPicker.Item>
                ))}
            </ColorSwatchPicker>

            <ColorArea
                aria-label="Color area"
                className="max-w-full"
                colorSpace="hsb"
                xChannel="saturation"
                yChannel="brightness"
            >
                <ColorArea.Thumb />
            </ColorArea>

            <ColorSlider aria-label="Hue slider" channel="hue" className="gap-1 px-1" colorSpace="hsb">
                <Label>Hue</Label>

                <ColorSlider.Output className="text-muted" />
                <ColorSlider.Track>
                    <ColorSlider.Thumb />
                </ColorSlider.Track>
            </ColorSlider>

            <ColorField aria-label="Hex color">
                <ColorField.Group variant="secondary">
                    <ColorField.Prefix>
                        <ColorSwatch size="xs" shape="circle" className="rounded-full" />
                    </ColorField.Prefix>
                    <ColorField.Input />
                </ColorField.Group>
            </ColorField>
        </ColorPicker.Popover>
    );
}

export const CellColorPicker = Object.assign(Root, {
    Label: CellLabel,
    Trigger,
    ValueDisplay,
    Popover,
    Swatch,
});
