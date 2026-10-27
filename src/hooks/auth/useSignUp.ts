"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, type SignUpInput } from "@/schemas/auth.schema";

export function useSignUp() {
    const router = useRouter();

    const form = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        form.clearErrors("root");

        try {
            const result = await authClient.signUp.email(values);

            if (result.error) {
                form.setError("root", {
                    message: result.error.message ?? "Registration failed.",
                });

                return;
            }

            router.replace("/");
            router.refresh();
        } catch {
            form.setError("root", {
                message: "Connection failed. Please try again.",
            });
        }
    });

    return {
        control: form.control,
        errors: form.formState.errors,
        isPending: form.formState.isSubmitting,
        onSubmit,
    };
}
