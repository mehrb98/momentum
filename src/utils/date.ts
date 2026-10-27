import { parseDate } from "@internationalized/date";

export function toDate(value: string) {
    try {
        return value ? parseDate(value) : null;
    } catch {
        return null;
    }
}
