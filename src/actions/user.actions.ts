"use server";

import { requireAdmin } from "@/lib/auth";
import { run } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { banUserSchema, saveUserSchema, userIdSchema } from "@/schemas/user.schema";
import { createUserAccount, removeUserAccount, setUserBanned, updateUserAccount } from "@/lib/services/users";

export async function saveUser(input: unknown) {
    return run(async () => {
        const admin = await requireAdmin();
        const { id, user } = saveUserSchema.parse(input);

        if (id === admin.id && user.role !== "admin") throw new Error("Keep your own admin role");

        if (id) await updateUserAccount(id, user);
        else await createUserAccount(user);

        revalidatePath("/");
    });
}

export async function deleteUser(input: unknown) {
    return run(async () => {
        const admin = await requireAdmin();
        const id = userIdSchema.parse(input);

        if (id === admin.id) throw new Error("You can't delete yourself");

        await removeUserAccount(id);

        revalidatePath("/");
    });
}

export async function setUserBan(input: unknown) {
    return run(async () => {
        const admin = await requireAdmin();
        const { id, banned } = banUserSchema.parse(input);

        if (id === admin.id) throw new Error("You can't ban yourself");

        await setUserBanned(id, banned);

        revalidatePath("/");
    });
}
