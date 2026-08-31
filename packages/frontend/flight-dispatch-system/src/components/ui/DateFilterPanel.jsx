import { DayPicker, DayButton } from 'react-day-picker'
import 'react-day-picker/style.css'
import { zhCN } from 'react-day-picker/locale'
import dayjs from 'dayjs'
import { useAppStore } from '../../store/appStore'
import { Card, CardHeader, CardTitle, CardContent } from './card'
import { cn } from '../../lib/utils'

/**
 * 通用日期筛选面板：单选日 或 范围选择，状态持久化
 * 中文、周一起始、显示上下月日期
 * @param {string} [notice] 可选提示内容（如"所选日期无数据，已展示最近一天"）
 * @param {Object} [dayMarkers] 可选：{ 'YYYY-MM-DD': { count, hasAbnormal } }
 *   - count        当日检查单数量
 *   - hasAbnormal  当日是否有异常项（true=红底数字，false/undefined=绿底数字）
 */
export default function DateFilterPanel({ notice, dayMarkers }) {
  const { mode, selectedDate, rangeFrom, rangeTo, setMode, setSelectedDate, setRange } = useAppStore()

  // 自定义 DayButton：保留官方组件能力（焦点/交互），在日期右上角叠加红/绿底数字徽标
  const DayButtonWithMarkers = (props) => {
    const { day, className, children, selected } = props
    const key = dayjs(day.date).format('YYYY-MM-DD')
    const marker = dayMarkers?.[key]
    const count = marker?.count || 0
    const show = count > 0 && !day.outside
    // 今天：蓝色加粗字体；当前月（非 outside）：字体稍粗
    const isToday = dayjs(day.date).isSame(dayjs(), 'day')
    return (
      <DayButton {...props} className={cn(className, 'relative')}>
        {/* 日期数字：当前月稍粗，今天加粗（蓝色仅未选中） */}
        <span
          className={cn(
            'relative z-[1]',
            !day.outside && 'font-medium',
            isToday && 'font-bold',
            isToday && !selected && 'text-blue-600',
          )}
        >
          {children}
        </span>
        {show && (
          <span
            className={cn(
              'pointer-events-none absolute -right-1 -top-1 z-10 flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-[3px] text-[9px] font-bold leading-none text-white shadow',
              marker?.hasAbnormal ? 'bg-red-500' : 'bg-emerald-500'
            )}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </DayButton>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>日期选择</CardTitle>
        <div className="flex rounded-md border border-slate-200 p-0.5">
          <button
            onClick={() => setMode('single')}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              mode === 'single' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            单选
          </button>
          <button
            onClick={() => setMode('range')}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              mode === 'range' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            范围
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <DayPicker
          mode={mode === 'single' ? 'single' : 'range'}
          locale={zhCN}
          weekStartsOn={1}
          showOutsideDays
          components={dayMarkers ? { DayButton: DayButtonWithMarkers } : undefined}
          selected={
            mode === 'single'
              ? selectedDate
                ? new Date(selectedDate)
                : undefined
              : {
                  from: rangeFrom ? new Date(rangeFrom) : undefined,
                  to: rangeTo ? new Date(rangeTo) : undefined,
                }
          }
          onSelect={(sel) => {
            if (mode === 'single') {
              if (sel) setSelectedDate(dayjs(sel).format('YYYY-MM-DD'))
            } else {
              const range = sel || {}
              setRange(
                range.from ? dayjs(range.from).format('YYYY-MM-DD') : null,
                range.to ? dayjs(range.to).format('YYYY-MM-DD') : null,
              )
            }
          }}
          numberOfMonths={1}
        />
        <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {notice && (
            <div className="mb-1 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-700">{notice}</div>
          )}
          {mode === 'single' ? (
            <>当前日期：<b>{selectedDate}</b></>
          ) : (
            <>范围：<b>{rangeFrom || '—'}</b> ~ <b>{rangeTo || '—'}</b></>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 从 appStore 读取当前筛选参数（供页面调用）
export function useDateFilterParams() {
  const { mode, selectedDate, rangeFrom, rangeTo } = useAppStore()
  return mode === 'single' ? { date: selectedDate } : { from: rangeFrom, to: rangeTo }
}
