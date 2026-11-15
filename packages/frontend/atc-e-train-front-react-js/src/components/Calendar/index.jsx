// src/components/Calendar/index.jsx - 日历组件（mini / full 双模式，dayjs 驱动）
//
// mini：左侧栏堆叠用。星期头是「一 二 三 四 五 六 日」（没有"星期"二字），
//       只渲染当月日期，非当月位置留空。
// full：主区域月视图。星期头是「星期一 … 星期日」，每个格子都有日期，
//       非当月日期显示「M月D日」，当月只显示「D」。
//
// 两者都用 CSS grid 排布，showGrid 控制是否显示网格线；周一起始（对齐 Outlook）。
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 周一起始的星期头
const WEEKDAYS_MINI = ['一', '二', '三', '四', '五', '六', '日'];
const WEEKDAYS_FULL = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

export default function Calendar({
  mode = 'mini', // 'mini' | 'full'
  month, // 受控：当前显示月份（dayjs，内部会 startOf('month')）
  defaultMonth, // 非受控初始月份
  onMonthChange,
  selected, // 选中的日期（dayjs）
  onSelect, // 点击日期回调 (dayjs) => void
  events = [], // [{ date: 'YYYY-MM-DD' | dayjs, label, taskId }] 按天展示的事件 chip
  showGrid = true, // 是否显示网格线
  className = '',
}) {
  const [innerMonth, setInnerMonth] = useState(defaultMonth || dayjs().startOf('month'));
  const cur = (month || innerMonth).startOf('month');
  const setCur = (m) => {
    if (onMonthChange) onMonthChange(m);
    else setInnerMonth(m);
  };

  // 6 行 × 7 列，从周一开始：先算当月 1 号前面要补几天（周一=0 ... 周日=6）
  const cells = useMemo(() => {
    const first = cur.startOf('month');
    const offset = (first.day() + 6) % 7; // dayjs: day() 周日=0，转成周一起始偏移
    const start = first.subtract(offset, 'day');
    return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
  }, [cur]);

  // 事件按 'YYYY-MM-DD' 分组
  const eventMap = useMemo(() => {
    const map = {};
    for (const ev of events) {
      const key = dayjs(ev.date).format('YYYY-MM-DD');
      (map[key] = map[key] || []).push(ev);
    }
    return map;
  }, [events]);

  const isToday = (d) => d.isSame(dayjs(), 'day');
  const isSelected = (d) => selected && d.isSame(selected, 'day');
  const inMonth = (d) => d.isSame(cur, 'month');

  // 格子里的日期文案：full 非当月显示「M月D日」
  const dateLabel = (d) => {
    if (mode === 'full' && !inMonth(d)) return `${d.month() + 1}月${d.date()}日`;
    return d.date();
  };

  return (
    <div className={'flex flex-col ' + className}>
      {/* ---------- 顶部工具栏 ---------- */}
      {mode === 'mini' ? (
        <div className="flex items-center justify-between px-1 py-1.5">
          <span className="text-xs font-semibold text-gray-700">
            {cur.year()} 年 {cur.month() + 1} 月
          </span>
          <span className="flex items-center gap-0.5 text-gray-400">
            <button
              onClick={() => setCur(cur.subtract(1, 'month'))}
              className="p-0.5 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setCur(cur.add(1, 'month'))}
              className="p-0.5 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight size={13} />
            </button>
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 pb-3">
          <button
            onClick={() => {
              setCur(dayjs().startOf('month'));
              onSelect && onSelect(dayjs());
            }}
            className="h-8 px-3 rounded-md border border-gray-200 bg-white text-sm hover:border-primary hover:text-primary transition-colors"
          >
            今天
          </button>
          <span className="flex items-center text-gray-500">
            <button
              onClick={() => setCur(cur.subtract(1, 'month'))}
              className="p-1 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCur(cur.add(1, 'month'))}
              className="p-1 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </span>
          <span className="text-lg font-bold text-gray-800">
            {cur.year()} 年 {cur.month() + 1} 月
          </span>
        </div>
      )}

      {/* ---------- 星期头 ---------- */}
      <div
        className={
          'grid grid-cols-7 ' +
          (mode === 'full' ? 'border-t border-l ' : '') +
          (showGrid ? 'border-gray-200' : 'border-transparent')
        }
      >
        {(mode === 'full' ? WEEKDAYS_FULL : WEEKDAYS_MINI).map((w) => (
          <div
            key={w}
            className={
              mode === 'full'
                ? 'text-xs text-gray-500 px-2 py-1.5 border-r border-b ' + (showGrid ? 'border-gray-200' : 'border-transparent')
                : 'text-center text-[11px] text-gray-400 py-1'
            }
          >
            {w}
          </div>
        ))}
      </div>

      {/* ---------- 日期格子 ---------- */}
      {/* full 模式：flex-1 + grid-rows-6 让 6 行均分父容器剩余高度 */}
      <div
        className={
          'grid grid-cols-7 ' +
          (mode === 'full' ? 'flex-1 min-h-0 grid-rows-6 border-t ' : '') +
          (mode === 'full' && showGrid ? 'border-gray-200' : 'border-transparent')
        }
      >
        {cells.map((d) => {
          const key = d.format('YYYY-MM-DD');
          const dayEvents = eventMap[key] || [];
          const outside = !inMonth(d);

          // mini：非当月留空
          if (mode === 'mini' && outside) {
            return <div key={key} className="h-7" />;
          }

          return (
            <div
              key={key}
              onClick={() => onSelect && onSelect(d)}
              className={
                mode === 'full'
                  ? 'relative min-h-16 overflow-hidden px-2 py-1 border-r border-b cursor-pointer hover:bg-blue-50/40 transition-colors ' +
                    (showGrid ? 'border-gray-200' : 'border-transparent') +
                    (isSelected(d) ? ' ring-1 ring-inset ring-primary bg-blue-50/30' : '')
                  : 'h-7 flex items-center justify-center cursor-pointer rounded hover:bg-gray-100 transition-colors'
              }
            >
              {/* 日期数字：今天蓝底白字圆点，mini 非当月不渲染 */}
              <span
                className={
                  mode === 'full'
                    ? 'absolute top-1 left-2 text-xs ' +
                      (outside ? 'text-gray-400' : isToday(d) ? '' : 'text-gray-700')
                    : 'text-[11px] ' + (isToday(d) ? 'font-semibold' : 'text-gray-600')
                }
              >
                {isToday(d) ? (
                  <span
                    className={
                      'inline-flex items-center justify-center bg-primary text-white rounded-full ' +
                      (mode === 'full' ? 'w-5 h-5 text-xs' : 'w-[18px] h-[18px] text-[10px]')
                    }
                  >
                    {dateLabel(d)}
                  </span>
                ) : (
                  dateLabel(d)
                )}
              </span>

              {/* 事件 chip（full 模式展示） */}
              {mode === 'full' && (
                <div className="mt-6 space-y-1">
                  {dayEvents.slice(0, 2).map((ev, i) => (
                    <div
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        ev.onClick && ev.onClick(ev);
                      }}
                      className="truncate text-[11px] leading-4 px-1.5 py-0.5 rounded-sm bg-orange-50 text-orange-600 border-l-2 border-orange-400 hover:bg-orange-100 transition-colors"
                      title={ev.label}
                    >
                      {ev.label}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-gray-400 px-1">
                      还有 {dayEvents.length - 2} 项
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
