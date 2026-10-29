import "server-only";
import { db } from "./db";
import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { ac, roles } from "./permissions";
import { createDefaultWorkspace } from "./services/statuses";

export const auth = betterAuth({
    database: prismaAdapter(db, { provider: "postgresql" }),
    emailAndPassword: { enabled: true, minPasswordLength: 12 },
    plugins: [admin({ ac, roles, defaultRole: "customer", adminRoles: ["admin"] }), nextCookies()],
    databaseHooks: {
        user: { create: { after: (user) => createDefaultWorkspace(user.id) } },
    },
});

export async function requireUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) throw new Error("Please sign in again.");

    return session.user;
}

export async function requireAdmin() {
    const user = await requireUser();

    if (user.role !== "admin") throw new Error("Admins only.");

    return user;
}
