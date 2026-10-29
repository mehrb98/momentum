"use client";

import { useForm } from "react-hook-form";
import { saveUser } from "@/actions/user.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFormSchema } from "@/schemas/user.schema";
import type { UserFormInput, UserView } from "@/types/user.types";

export function useUserForm(onClose: () => void, user?: UserView) {
    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<UserFormInput>({
        resolver: zodResolver(userFormSchema),
        defaultValues: user
            ? { name: user.name, email: user.email, role: user.role, password: "" }
            : { name: "", email: "", role: "customer", password: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            const result = await saveUser({ id: user?.id, user: values });

            if (!result.ok) setError("root", { message: result.error });
            else onClose();
        } catch {
            setError("root", { message: "Connection failed. Try again." });
        }
    });

    return { control, errors, isSubmitting, onSubmit };
}
