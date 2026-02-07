//顶部导航栏组件
import { useEffect, useState } from 'react'

// 格式化函数：yyyy-MM-dd HH:mm:ss 星期几
function formatDateTime(date) {
  const weekMap = ['日', '一', '二', '三', '四', '五', '六']
  const pad = (n) => String(n).padStart(2, '0')

  const yyyy = date.getFullYear()
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const HH = pad(date.getHours())
  const MM = pad(date.getMinutes())
  const SS = pad(date.getSeconds())
  const week = weekMap[date.getDay()]

  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS} 周${week}`
}
function TopBar() {
  const [time, setTime] = useState(formatDateTime(new Date()))

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatDateTime(new Date()))
    }, 1000)

    return () => clearInterval(timer)
  }, [])
  return (
    <div className="d-flex justify-content-between align-items-center bg-light border p-3 rounded shadow-sm">
      <div className="fw-bold fs-5">✈ 综合调度系统</div>
      <div className="text-muted">{time}</div>
      <div>您好，芙宁娜 | <a href="#">切换</a></div>
    </div>
  );
}
export default TopBar;
