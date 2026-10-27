"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { signInSchema, type SignInInput } from "@/schemas/auth.schema";

export function useSignIn() {
    const router = useRouter();

    const form = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        form.clearErrors("root");

        try {
            const result = await authClient.signIn.email(values);

            if (result.error) {
                form.setError("root", {
                    message: result.error.message ?? "Sign-in failed.",
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
