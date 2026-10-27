"use client";
import { Button, Card } from "@heroui/react";

export default function ErrorPage({ reset }: { reset: () => void }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-md gap-6 p-6 sm:p-8">
                <Card.Header className="gap-2">
                    <Card.Title className="text-2xl">Something went wrong</Card.Title>
                    <Card.Description>
                        Please try again. If the problem continues, check the server connection.
                    </Card.Description>
                </Card.Header>
                <Card.Footer>
                    <Button onPress={reset}>Try again</Button>
                </Card.Footer>
            </Card>
        </main>
    );
}
