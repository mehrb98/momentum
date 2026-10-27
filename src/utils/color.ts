export const defaultStatusColor = "#71717a";

const namedColors: Record<string, string> = {
    default: "#71717a",
    warning: "#f5a524",
    success: "#17c964",
    danger: "#f31260",
    accent: "#006FEE",
};

const hexColor = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

export function isHexColor(value: string) {
    return hexColor.test(value);
}

export function toCssColor(color: string) {
    if (isHexColor(color)) return color;
    return namedColors[color] ?? defaultStatusColor;
}
