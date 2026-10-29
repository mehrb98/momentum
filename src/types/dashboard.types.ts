import type { TaskView } from "./task.types";
import type { BoardView } from "./board.types";
import type { StatusView } from "./status.types";
import type { TelegramConnectionView } from "./connection.types";
import type { UserView } from "./user.types";

export type WorkspaceView = "overview" | "tasks" | "boards" | "status" | "users";

export type DashboardProps = {
    name: string;
    userId: string;
    isAdmin: boolean;
    users: UserView[];
    tasks: TaskView[];
    boards: BoardView[];
    statuses: StatusView[];
    telegram: TelegramConnectionView;
    aiEnabled: boolean;
};
