"use client";

import { useState } from "react";
import { UserMenu } from "./user-menu";
import { TaskForm } from "./task-form";
import { TaskBoard } from "./task-board";
import { BoardCard } from "./board-card";
import { BoardForm } from "./board-form";
import { StatusCard } from "./status-card";
import { StatusForm } from "./status-form";
import { PlannerChat } from "./planner-chat";
import { OptionSelect } from "./option-select";
import { StatusChip, TaskCard } from "./task-card";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { useTaskBoard } from "@/hooks/tasks/useTaskBoard";
import type { WorkspaceView, DashboardProps } from "@/types/dashboard.types";
import { Circle, House, LayoutColumns3, ListCheck } from "@gravity-ui/icons";

import {
    Alert,
    Avatar,
    Breadcrumbs,
    Button,
    Card,
    Chip,
    ProgressBar,
    SearchField,
    Separator,
    Typography,
} from "@heroui/react";

const views: { id: WorkspaceView; title: string; Icon: typeof House }[] = [
    { id: "overview", title: "Overview", Icon: House },
    { id: "tasks", title: "Tasks", Icon: ListCheck },
    { id: "boards", title: "Boards", Icon: LayoutColumns3 },
    { id: "status", title: "Status", Icon: Circle },
];

export function Dashboard({ name, tasks, boards, statuses, telegram, aiEnabled }: DashboardProps) {
    const [view, setView] = useState<WorkspaceView>("overview");
    
    const board = useTaskBoard(tasks, boards, statuses);
    const current = views.find((item) => item.id === view) ?? views[0];
    const allTasks = board.columns.flatMap((column) => column.tasks);

    const counts: Record<WorkspaceView, number> = {
        overview: board.total + boards.length + statuses.length,
        tasks: board.total,
        boards: boards.length,
        status: statuses.length,
    };

    const stats = [
        { label: "Total tasks", value: board.total, note: "Your next steps, in one place" },
        { label: "In motion", value: board.inProgress, note: "A little progress every day" },
        { label: "Completed", value: board.done, suffix: ` / ${board.total}`, note: `${board.completion}% of your tasks complete` },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r border-separator bg-surface px-4 py-5 md:flex xl:w-64">
                <div className="flex items-center gap-3 px-2">
                    <Avatar size="sm" color="accent" className="rounded-xl">
                        <Avatar.Fallback color="accent">
                            <LayoutColumns3 className="size-4" />
                        </Avatar.Fallback>
                    </Avatar>

                    <div className="flex flex-col">
                        <Typography type="body" weight="semibold">Momentum</Typography>
                        <Typography type="body-xs" color="muted">Task manager</Typography>
                    </div>
                </div>

                <nav className="flex flex-col gap-1">
                    <Typography type="body-xs" weight="medium" color="muted" className="px-2 pb-1">
                        Workspace
                    </Typography>

                    {views.map(({ id, title, Icon }) => (
                        <Button
                            key={id}
                            fullWidth
                            onPress={() => setView(id)}
                            className="justify-start gap-3"
                            variant={view === id ? "secondary" : "ghost"}
                        >
                            <Icon className={`size-4 ${view === id ? "text-accent" : "text-muted"}`} />
                            <span className="flex-1 text-left">{title}</span>
                            <Chip size="sm">{counts[id]}</Chip>
                        </Button>
                    ))}
                </nav>

                {view === "overview" && (
                    <div className="flex flex-col gap-1">
                        <Typography type="body-xs" weight="medium" color="muted" className="px-2 pb-1">
                            All items
                        </Typography>

                        {board.statusCounts.map((s) => (
                            <div key={s.id} className="flex items-center justify-between px-2 py-1">
                                <StatusChip color={s.color}>{s.title}</StatusChip>
                                <Typography type="body-xs" color="muted">{s.count}</Typography>
                            </div>
                        ))}
                    </div>
                )}

                <Card variant="secondary" className="mt-auto gap-3 p-4">
                    <div className="flex items-baseline justify-between">
                        <Typography type="body-sm" weight="medium">Progress</Typography>
                        <Typography type="body-xs" color="muted">{board.completion}%</Typography>
                    </div>

                    <ProgressBar aria-label="Tasks completed" value={board.completion} color="success" size="sm">
                        <ProgressBar.Track>
                            <ProgressBar.Fill />
                        </ProgressBar.Track>
                    </ProgressBar>

                    <Typography type="body-xs" color="muted">
                        {board.done} of {board.total} tasks done
                    </Typography>
                </Card>

                <div className="flex flex-col gap-3">
                    <Separator />
                    <UserMenu name={name} telegram={telegram} />
                </div>
            </aside>

            <main className="w-full min-w-0 max-w-[1600px] px-4 pb-28 sm:px-6 lg:px-10">
                <header className="flex h-16 items-center justify-between gap-4 border-b border-separator">
                    <Breadcrumbs>
                        <Breadcrumbs.Item>Workspace</Breadcrumbs.Item>
                        <Breadcrumbs.Item>{current.title}</Breadcrumbs.Item>
                    </Breadcrumbs>

                    <div className="flex items-center gap-2">
                        <span className="md:hidden">
                            <UserMenu name={name} compact telegram={telegram} />
                        </span>
                    </div>
                </header>

                <div className="flex flex-col gap-8 pt-8">
                    <section className="flex flex-wrap items-end justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <Typography type="body-xs" weight="semibold" color="muted" className="uppercase tracking-widest">
                                Make space for what matters
                            </Typography>

                            <Typography.Heading level={1}>{current.title}.</Typography.Heading>

                            <Typography.Paragraph size="sm" color="muted">
                                {view === "overview" && `A clear view of what’s next. You’ve got this, ${name.split(" ")[0]}.`}
                                {view === "tasks" && "Every task in one list."}
                                {view === "boards" && "Name a board and give it a status."}
                                {view === "status" && "Add statuses and use them on any board."}
                            </Typography.Paragraph>
                        </div>

                        {view === "overview" || view === "tasks" ? (
                            <Button onPress={board.onNewTask}>＋ New task</Button>
                        ) : view === "boards" ? (
                            <Button onPress={board.onNewBoard}>＋ New board</Button>
                        ) : (
                            <Button onPress={board.onNewStatus}>＋ New status</Button>
                        )}
                    </section>

                    {view === "overview" && (
                        <section className="grid gap-4 sm:grid-cols-3">
                            {stats.map((stat) => (
                                <Card key={stat.label} className="gap-2 p-5">
                                    <Card.Description>{stat.label}</Card.Description>

                                    <Card.Title className="text-3xl font-semibold leading-tight">
                                        {stat.value}
                                        {stat.suffix && <span className="text-lg text-muted">{stat.suffix}</span>}
                                    </Card.Title>

                                    <Typography type="body-xs" color="muted">{stat.note}</Typography>
                                </Card>
                            ))}
                        </section>
                    )}

                    {board.error && (
                        <Alert status="danger">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>{board.error}</Alert.Title>
                            </Alert.Content>
                        </Alert>
                    )}

                    {(view === "overview" || view === "tasks") && (
                        <section className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex shrink-0 items-center gap-2">
                                    <Typography.Heading level={4} className="whitespace-nowrap">
                                        {view === "overview" ? "All items" : "Tasks"}
                                    </Typography.Heading>
                                    <Chip size="sm">{board.filteredCount}</Chip>
                                </div>

                                <div className="flex w-full min-w-0 flex-wrap gap-3 sm:max-w-2xl sm:flex-nowrap">
                                    <SearchField
                                        aria-label="Search tasks"
                                        className="min-w-0 flex-1"
                                        value={board.query}
                                        onChange={board.onSearch}
                                    >
                                        <SearchField.Group>
                                            <SearchField.SearchIcon />
                                            <SearchField.Input placeholder="Search tasks…" />
                                            <SearchField.ClearButton />
                                        </SearchField.Group>
                                    </SearchField>

                                    <OptionSelect
                                        aria-label="Filter priority"
                                        className="w-40 shrink-0"
                                        options={board.priorityFilters}
                                        value={board.priority}
                                        onChange={board.onPriorityChange}
                                    />

                                    <OptionSelect
                                        aria-label="Sort tasks"
                                        className="w-40 shrink-0"
                                        options={board.sortOptions}
                                        value={board.sort}
                                        onChange={board.onSortChange}
                                    />
                                </div>
                            </div>

                            {view === "overview" ? (
                                <TaskBoard
                                    columns={board.columns}
                                    pending={board.pending}
                                    onMoveTask={board.onMoveTask}
                                    onReorderColumns={board.onReorderColumns}
                                />
                            ) : (
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {allTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            title={task.title}
                                            description={task.description}
                                            priority={task.priorityOption}
                                            dueLabel={task.dueLabel}
                                            isOverdue={task.isOverdue}
                                            isDisabled={board.pending}
                                            onEdit={task.onEdit}
                                            onDelete={task.onDelete}
                                            onDragStart={() => undefined}
                                            onDragEnd={() => undefined}
                                        />
                                    ))}

                                    {!allTasks.length && (
                                        <Typography type="body-sm" color="muted">
                                            No tasks yet.
                                        </Typography>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {view === "boards" && (
                        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {boards.map((item) => {
                                const status = statuses.find((s) => s.id === item.statusId);

                                return (
                                    <BoardCard
                                        key={item.id}
                                        name={item.name}
                                        statusName={status?.name}
                                        statusColor={status?.color}
                                        isDisabled={board.pending}
                                        onEdit={() => board.onEditBoard(item)}
                                        onDelete={() => board.onDeleteBoard(item)}
                                    />
                                );
                            })}
                        </section>
                    )}

                    {view === "status" && (
                        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {statuses.map((status) => (
                                <StatusCard
                                    key={status.id}
                                    name={status.name}
                                    color={status.color}
                                    taskCount={board.statusCounts.find((item) => item.id === status.id)?.count ?? 0}
                                    isDisabled={board.pending}
                                    onEdit={() => board.onEditStatus(status)}
                                    onDelete={() => board.onDeleteStatus(status)}
                                />
                            ))}
                        </section>
                    )}

                    <Typography type="body-xs" color="muted" align="center">
                        Showing up to 500 most recent tasks · Small steps. Real progress.
                    </Typography>
                </div>
            </main>

            <TaskForm
                isOpen={board.editor.isOpen}
                formKey={board.editor.key}
                status={board.editor.status}
                statuses={statuses}
                boardId={board.editor.boardId}
                task={board.editor.task}
                onClose={board.onCloseEditor}
            />

            <BoardForm
                isOpen={board.boardEditor.isOpen}
                formKey={board.boardEditor.key}
                statuses={statuses}
                board={board.boardEditor.board}
                onClose={board.onCloseBoardEditor}
            />

            <StatusForm
                isOpen={board.statusEditor.isOpen}
                formKey={board.statusEditor.key}
                status={board.statusEditor.status}
                onClose={board.onCloseStatusEditor}
            />

            <DeleteTaskDialog
                isOpen={board.deleting.isOpen}
                kind={board.deleting.kind}
                name={board.deleting.name}
                onCancel={board.onCancelDelete}
                onConfirm={board.onConfirmDelete}
            />

            <PlannerChat aiEnabled={aiEnabled} />
        </div>
    );
}
