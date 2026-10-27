export type SelectOption = { id: string; title: string };

export type OptionSelectProps = {
    options: readonly SelectOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    "aria-label"?: string;
    isDisabled?: boolean;
    className?: string;
};
