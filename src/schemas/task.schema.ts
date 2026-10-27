import { z } from "zod";
import { boardRefSchema } from "./board.schema";
import { statusIdSchema, statusRefSchema } from "./status.schema";

export const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const taskIdSchema = z.string().min(1);

export const taskSchema = z.object({
    title: z.string().trim().min(1, "Add a title").max(160),
    description: z.string().trim().max(2000),
    priority: prioritySchema,
    dueDate: z
        .string()
        .refine(
            (v) =>
                v === "" ||
                (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
                    !Number.isNaN(Date.parse(v)) &&
                    new Date(v).toISOString().slice(0, 10) === v),
            "Enter a valid date",
        ),
});

export const boardIdSchema = z.string().min(1);

export const taskFormSchema = taskSchema.extend({
    status: statusIdSchema,
    boardId: boardIdSchema.optional(),
});

export const saveTaskSchema = z.object({
    id: taskIdSchema.optional(),
    task: taskFormSchema,
});

export const newTaskSchema = taskFormSchema.extend({
    description: taskSchema.shape.description.default(""),
    priority: prioritySchema.default("MEDIUM"),
    status: statusRefSchema.default("TODO"),
    dueDate: taskSchema.shape.dueDate.default(""),
});

export const createTasksSchema = z.object({
    tasks: z.array(newTaskSchema).min(1).max(8),
});

export const updateTaskSchema = taskFormSchema.partial().extend({
    id: taskIdSchema,
});

export const changeStatusSchema = z.object({
    id: taskIdSchema,
    status: statusIdSchema,
    boardId: boardIdSchema.optional(),
});

export const deleteTasksSchema = z.object({
    ids: z.array(taskIdSchema).min(1).max(20),
});

export const taskQuerySchema = z.object({
    status: statusRefSchema.optional(),
    board: boardRefSchema.optional(),
    priority: prioritySchema.optional(),
    search: z.string().trim().max(200).optional(),
});
