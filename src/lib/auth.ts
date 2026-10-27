import "server-only";
import { db } from "./db";
import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
    database: prismaAdapter(db, { provider: "postgresql" }),
    emailAndPassword: { enabled: true, minPasswordLength: 12 },
    plugins: [nextCookies()],
});

export async function requireUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) throw new Error("Please sign in again.");

    return session.user;
}
