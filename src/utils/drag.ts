import type { DragEvent } from "react";
import type { BoardDragState } from "@/types/board.types";

type DragKind = NonNullable<BoardDragState>["kind"];

export function setPayload(event: DragEvent, kind: DragKind, id: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `${kind}:${id}`);
}

export function readPayload(event: DragEvent): NonNullable<BoardDragState> | undefined {
    const [kind, id] = event.dataTransfer.getData("text/plain").split(":");

    if ((kind === "task" || kind === "column") && id) return { kind, id };
}
