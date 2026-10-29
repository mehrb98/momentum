import type { z } from "zod";
import type { roleSchema, userFormSchema } from "@/schemas/user.schema";

export type Role = z.infer<typeof roleSchema>;
export type UserFormInput = z.infer<typeof userFormSchema>;

export type UserView = {
    id: string;
    name: string;
    email: string;
    role: Role;
    banned: boolean;
};

export type UserFormProps = {
    isOpen: boolean;
    formKey: number;
    user?: UserView;
    onClose: () => void;
};

export type UsersPanelProps = {
    users: UserView[];
    currentUserId: string;
};
