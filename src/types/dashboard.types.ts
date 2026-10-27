import type { TaskView } from "./task.types";
import type { BoardView } from "./board.types";
import type { StatusView } from "./status.types";
import type { TelegramConnectionView } from "./connection.types";

export type WorkspaceView = "overview" | "tasks" | "boards" | "status";

export type DashboardProps = {
    name: string;
    tasks: TaskView[];
    boards: BoardView[];
    statuses: StatusView[];
    telegram: TelegramConnectionView;
    aiEnabled: boolean;
};
