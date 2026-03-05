import { ReactNode } from "react"

export interface MonthCalendarProps<T = any> {
    year?: number
    month?: number
    data?: Record<string, T>

    title?: ReactNode

    onDateTitleButtonClick?: (date: string) => void

    cellRender?: (date: string, value?: T) => ReactNode
}