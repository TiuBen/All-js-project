import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { flightsApi } from '../../api'
import { Button } from '../../components/ui/button'
import { Badge, flightTypeVariant } from '../../components/ui/badge'
import { Loader2, ArrowLeft, RefreshCw, ListChecks } from 'lucide-react'

/**
 * 独立展示页
 * 新开页面展示该航班的独立视图（暂未设计内容，主体留空）
 * 顶部：返回 + 航班信息 + 刷新 / 返回检查单（按钮字体与检查单页统一 text-xs）
 */
export default function FlowchartPage() {
  const { flightId } = useParams()
  const navigate = useNavigate()
  const [flight, setFlight] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const f = await flightsApi.get(flightId)
      setFlight(f)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [flightId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <Loader2 className="animate-spin" size={28} />
        <span className="text-sm">加载中...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-112px)] flex-col gap-4">
      {/* 顶部（与检查单页按钮风格一致：size=sm → text-xs） */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {flight?.flightNo} <span className="font-normal text-slate-400">独立展示</span>
              </h2>
              <Badge variant={flightTypeVariant(flight?.flightType)}>{flight?.flightType}</Badge>
              <Badge>{flight?.category}</Badge>
            </div>
            <div className="mt-0.5 text-xs text-slate-400">
              {flight?.origin} → {flight?.destination} · 机型 {flight?.aircraftType} · 日期 {flight?.flightDate}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw size={14} /> 刷新
          </Button>
          <Button size="sm" onClick={() => navigate(`/checklist/${flightId}`)}>
            <ListChecks size={14} /> 返回检查单
          </Button>
        </div>
      </div>

      {/* 主体：暂未设计展示内容，留空 */}
      <div className="min-h-0 flex-1 rounded-xl border border-dashed border-slate-200" />
    </div>
  )
}
