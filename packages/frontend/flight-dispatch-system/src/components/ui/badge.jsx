import { cn } from '../../lib/utils'

export function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

// 航班状态 → Badge 颜色映射（国内惯例：正点/正常绿色，延误红色等根据实际情况）
export function statusVariant(status) {
  switch (status) {
    case '计划':
      return 'info'
    case '到达':
    case '正常':
      return 'success'
    case '延误':
    case '取消':
      return 'danger'
    case '起飞':
    case '滑行':
      return 'primary'
    default:
      return 'default'
  }
}

// 航班类型 → Badge 颜色（货运: 常规/始发; 客运: 航空器始发/过站/航后）
export function flightTypeVariant(flightType) {
  switch (flightType) {
    case '始发航班':
    case '航空器始发':
      return 'primary'
    case '航空器过站':
      return 'info'
    case '航后阶段':
      return 'warning'
    default:
      return 'default'
  }
}
