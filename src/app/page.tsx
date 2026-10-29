import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listTasks } from "@/lib/services/tasks";
import { listBoards } from "@/lib/services/boards";
import { Dashboard } from "@/components/dashboard";
import { listStatuses } from "@/lib/services/statuses";
import { getTelegramConnection } from "@/lib/services/connections";
import { listUsers } from "@/lib/services/users";

export default async function Page() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) redirect("/sign-in");

    const isAdmin = session.user.role === "admin";

    const [tasks, boards, statuses, telegram, users] = await Promise.all([
        listTasks(session.user.id),
        listBoards(session.user.id),
        listStatuses(session.user.id),
        getTelegramConnection(session.user.id),
        isAdmin ? listUsers() : [],
    ]);

    return (
        <Dashboard
            name={session.user.name}
            userId={session.user.id}
            isAdmin={isAdmin}
            users={users}
            tasks={tasks}
            boards={boards}
            statuses={statuses}
            telegram={telegram}
            aiEnabled={Boolean(process.env.OPENAI_API_KEY)}
        />
    );
}
