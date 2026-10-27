import { z } from "zod";

export const statusColorSchema = z
    .string()
    .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/, "Pick a color");

export const statusIdSchema = z.string().min(1);

export const statusRefSchema = z.string().trim().min(1).max(80);

export const statusFormSchema = z.object({
    name: z.string().trim().min(1, "Add a name").max(80),
    color: statusColorSchema,
});

export const saveStatusSchema = z.object({
    id: z.string().min(1).optional(),
    status: statusFormSchema,
});

export const createStatusSchema = z.object({
    name: statusFormSchema.shape.name,
    color: statusColorSchema.optional(),
});

export const updateStatusSchema = z
    .object({
        id: statusIdSchema,
        name: statusFormSchema.shape.name.optional(),
        color: statusColorSchema.optional(),
    })
    .refine((value) => value.name !== undefined || value.color !== undefined, "Change a name or color");

export const deleteStatusesSchema = z.object({
    ids: z.array(statusIdSchema).min(1).max(20),
});
