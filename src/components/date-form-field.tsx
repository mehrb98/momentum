"use client";

import { toDate } from "@/utils/date";
import type { DateFormFieldProps } from "@/types/form.types";
import { Controller, type FieldValues } from "react-hook-form";
import { Calendar, DateField, DatePicker, FieldError, Label } from "@heroui/react";

export function DateFormField<T extends FieldValues>({ control, name, label }: DateFormFieldProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <DatePicker
                    className="w-full"
                    name={field.name}
                    value={toDate(field.value ?? "")}
                    onChange={(date) => field.onChange(date?.toString() ?? "")}
                    onBlur={field.onBlur}
                    isInvalid={fieldState.invalid}
                    validationBehavior="aria"
                    granularity="day"
                >
                    <Label>{label}</Label>
                    
                    <DateField.Group fullWidth>
                        <DateField.Input>
                            {(segment) => <DateField.Segment segment={segment} />}
                        </DateField.Input>
                        <DateField.Suffix>
                            <DatePicker.Trigger aria-label="Open calendar">
                                <DatePicker.TriggerIndicator />
                            </DatePicker.Trigger>
                        </DateField.Suffix>
                    </DateField.Group>
                    
                    <FieldError>{fieldState.error?.message}</FieldError>
                    
                    <DatePicker.Popover>
                        <Calendar aria-label={label}>
                            <Calendar.Header>
                                <Calendar.NavButton slot="previous" />
                                <Calendar.Heading />
                                <Calendar.NavButton slot="next" />
                            </Calendar.Header>
                            
                            <Calendar.Grid>
                                <Calendar.GridHeader>
                                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                                </Calendar.GridHeader>
                                <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                            </Calendar.Grid>
                            
                        </Calendar>
                    </DatePicker.Popover>
                </DatePicker>
            )}
        />
    );
}
