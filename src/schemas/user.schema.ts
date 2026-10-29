import { z } from "zod";

export const roleSchema = z.enum(["admin", "customer"]);

export const userIdSchema = z.string().min(1);

export const userFormSchema = z.object({
    name: z.string().trim().min(1, "Add a name").max(80),
    email: z.email("Enter a valid email"),
    role: roleSchema,
    // empty on edit keeps the current password
    password: z.string().refine((value) => value === "" || value.length >= 12, "Use at least 12 characters"),
});

export const saveUserSchema = z
    .object({
        id: userIdSchema.optional(),
        user: userFormSchema,
    })
    .refine((value) => value.id || value.user.password, {
        message: "Set a password",
        path: ["user", "password"],
    });

export const banUserSchema = z.object({
    id: userIdSchema,
    banned: z.boolean(),
});
