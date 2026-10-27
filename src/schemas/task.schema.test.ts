import { describe, it, expect } from "vitest";
import { chatSchema } from "./planner.schema";
import { taskSchema, createTasksSchema } from "./task.schema";

const task = {
    title: "Ship portfolio",
    description: "",
    priority: "HIGH",
    dueDate: "",
};

describe("task trust boundaries", () => {
    it("trims valid titles and allows an unspecified date", () =>
        expect(taskSchema.parse({ ...task, title: "  Ship  " }).title).toBe("Ship"));
    
    it("rejects invalid calendar dates", () =>
        expect(taskSchema.safeParse({ ...task, dueDate: "2026-02-30" }).success).toBe(false));
    
    it("rejects blank and oversized task content", () => {
        expect(taskSchema.safeParse({ ...task, title: " " }).success).toBe(false);
        expect(taskSchema.safeParse({ ...task, description: "x".repeat(2001) }).success).toBe(false);
    });
    
    it("bounds model output batches", () => {
        expect(createTasksSchema.safeParse({ tasks: [] }).success).toBe(false);
        expect(createTasksSchema.safeParse({ tasks: Array(9).fill(task) }).success).toBe(false);
    });
    
    it("fills defaults for tasks created by the assistant", () =>
        expect(createTasksSchema.parse({ tasks: [{ title: "Draft outline" }] }).tasks[0]).toEqual({
            title: "Draft outline",
            description: "",
            priority: "MEDIUM",
            status: "TODO",
            dueDate: "",
        }));
        
    it("only accepts chat history that ends with the user", () =>
        expect(
            chatSchema.safeParse({ messages: [{ role: "assistant", content: "Hi" }] }).success,
        ).toBe(false));
});
