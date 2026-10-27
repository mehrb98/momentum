import type { TelegramConnectionView } from "./connection.types";

export type UserMenuProps = {
    name: string;
    compact?: boolean;
    telegram: TelegramConnectionView;
};

export type ThemeToggleProps = {
    fullWidth?: boolean;
};

export type SettingsModalProps = {
    isOpen: boolean;
    telegram: TelegramConnectionView;
    onClose: () => void;
};
