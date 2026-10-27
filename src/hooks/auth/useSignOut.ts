"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function useSignOut() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isPending, setPending] = useState(false);

    async function signOut() {
        setPending(true);
        setError("");

        try {
            const result = await authClient.signOut();

            if (result.error) throw new Error();

            router.replace("/sign-in");
            router.refresh();
        } catch {
            setError("Unable to sign out. Try again.");
        } finally {
            setPending(false);
        }
    }

    return { signOut, error, isPending };
}
