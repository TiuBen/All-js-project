
import { ButtonHTMLAttributes } from "react"

export interface TestButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary"
}