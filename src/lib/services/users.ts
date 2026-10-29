import "server-only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { UserFormInput, UserView } from "@/types/user.types";

// every call forwards the session headers, so Better Auth checks the admin permission itself

export async function listUsers(): Promise<UserView[]> {
    const { users } = await auth.api.listUsers({
        headers: await headers(),
        query: { limit: 500, sortBy: "createdAt", sortDirection: "desc" },
    });

    return users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role === "admin" ? "admin" : "customer",
        banned: Boolean(user.banned),
    }));
}

export async function createUserAccount(user: UserFormInput) {
    await auth.api.createUser({
        headers: await headers(),
        body: { name: user.name, email: user.email, password: user.password, role: user.role },
    });
}

export async function updateUserAccount(id: string, user: UserFormInput) {
    const requestHeaders = await headers();

    await auth.api.adminUpdateUser({
        headers: requestHeaders,
        body: { userId: id, data: { name: user.name, email: user.email } },
    });
    await auth.api.setRole({ headers: requestHeaders, body: { userId: id, role: user.role } });

    if (user.password)
        await auth.api.setUserPassword({ headers: requestHeaders, body: { userId: id, newPassword: user.password } });
}

export async function removeUserAccount(id: string) {
    await auth.api.removeUser({ headers: await headers(), body: { userId: id } });
}

export async function setUserBanned(id: string, banned: boolean) {
    if (banned) await auth.api.banUser({ headers: await headers(), body: { userId: id } });
    else await auth.api.unbanUser({ headers: await headers(), body: { userId: id } });
}
