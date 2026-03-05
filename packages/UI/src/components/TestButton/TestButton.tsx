import { TestButtonProps } from "./TestButton.types";

export function TestButton({ variant = "primary", children, ...props }: TestButtonProps) {
    const style =
        variant === "primary" ? { background: "#1677ff", color: "white" } : { background: "#f0f0f0", color: "#333" };

    return (
        <button
            style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                ...style,
            }}
            {...props}
        >
            {children}
        </button>
    );
}
