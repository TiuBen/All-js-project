import { cn } from '../../lib/utils'

export function Card({ className, ...props }) {
  return <div className={cn('card', className)} {...props} />
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex items-center justify-between border-b border-slate-200 px-4 py-3', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-sm font-semibold text-slate-800', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-4', className)} {...props} />
}
