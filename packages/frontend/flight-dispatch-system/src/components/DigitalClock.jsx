import { useEffect, useState } from 'react'

function pad(n) {
  return String(n).padStart(2, '0')
}

/**
 * 跳动时钟：本地（黑色）+ UTC（橙色，含标签），上下摆放，按秒变化，无闪烁动画
 */
export default function DigitalClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = (d) =>
    `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000)

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400">本地</span>
        <span className="time-text text-slate-700">{fmt(now)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium text-orange-600">UTC</span>
        <span className="time-text text-orange-600">{fmt(utc)}</span>
      </div>
    </div>
  )
}
