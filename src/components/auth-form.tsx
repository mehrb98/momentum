"use client";

import { Alert, Button, Card, Form, Link, Typography } from "@heroui/react";
import { useSignIn } from "@/hooks/auth/useSignIn";
import { FormField } from "./form-field";

export function AuthForm() {
    const { control, errors, isPending, onSubmit } = useSignIn();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-12">
            <Typography type="h5" weight="bold" className="tracking-widest text-accent">◈ MOMENTUM</Typography>
            <Card className="w-full max-w-md gap-6 p-6 sm:p-8">
                <Card.Header className="gap-2">
                    <Typography type="body-xs" weight="semibold" color="muted" className="tracking-widest">A LITTLE CLARITY. EVERY DAY.</Typography>
                    <Card.Title className="text-3xl font-semibold leading-tight">Welcome back.</Card.Title>
                    <Card.Description>Your tasks, your pace. Let’s move something forward.</Card.Description>
                </Card.Header>
                <Card.Content>
                    <Form onSubmit={onSubmit} className="flex flex-col gap-5">
                        <FormField control={control} name="email" label="Email" type="email" autoComplete="email" />
                        <FormField
                            control={control}
                            name="password"
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                        />
                        {errors.root?.message && (
                            <Alert status="danger">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>{errors.root.message}</Alert.Title>
                                </Alert.Content>
                            </Alert>
                        )}
                        <Button type="submit" fullWidth className="mt-1" isDisabled={isPending}>
                            {isPending ? "Please wait…" : "Sign in"}
                        </Button>
                    </Form>
                </Card.Content>
                <Card.Footer className="justify-center">
                    <Link href="/sign-up" className="text-sm">
                        New here? Create an account
                    </Link>
                </Card.Footer>
            </Card>
        </main>
    );
}
