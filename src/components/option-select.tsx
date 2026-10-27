"use client";

import { Label, ListBox, Select } from "@heroui/react";
import type { OptionSelectProps } from "@/types/option-select.types";

export function OptionSelect({ options, value, onChange, label, isDisabled, className, ...aria }: OptionSelectProps) {
    return (
        <Select
            {...aria}
            className={className}
            value={value}
            isDisabled={isDisabled}
            onChange={(key) => key != null && onChange(String(key))}
        >
            {label && <Label>{label}</Label>}
            
            <Select.Trigger>
                <Select.Value className="truncate" />
                <Select.Indicator />
            </Select.Trigger>
            
            <Select.Popover>
                <ListBox>
                    {options.map((option) => (
                        <ListBox.Item key={option.id} id={option.id} textValue={option.title}>
                            {option.title}
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    );
}
