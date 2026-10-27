import { z } from "zod";
import { statusIdSchema, statusRefSchema } from "./status.schema";

export const boardIdSchema = z.string().min(1);
export const boardRefSchema = z.string().trim().min(1).max(80);

export const boardFormSchema = z.object({
    name: z.string().trim().min(1, "Add a name").max(80),
    statusId: statusIdSchema,
});

export const createBoardSchema = z.object({
    name: boardFormSchema.shape.name,
    status: statusRefSchema,
});

export const updateBoardSchema = z
    .object({
        id: boardIdSchema,
        name: boardFormSchema.shape.name.optional(),
        status: statusRefSchema.optional(),
    })
    .refine((value) => value.name !== undefined || value.status !== undefined, "Change a name or status");

export const deleteBoardsSchema = z.object({
    ids: z.array(boardIdSchema).min(1).max(20),
});

export const saveBoardSchema = z.object({
    id: z.string().min(1).optional(),
    board: boardFormSchema,
});
