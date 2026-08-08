import { useEffect, useMemo, useState } from 'react'
import { checklistsApi } from '../../api'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Badge, flightTypeVariant } from '../../components/ui/badge'
import DateFilterPanel, { useDateFilterParams } from '../../components/ui/DateFilterPanel'
import FlightSearchCard from '../../components/search/FlightSearchCard'
import { Loader2, FileText, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

/**
 * 填写记录页（Tab: 填写记录）
 * 显示：哪个航班、谁检查的、什么时间检查的；支持按日期单选/范围筛选 + 关键词搜索
 */
export default function RecordsPage() {
  const navigate = useNavigate()
  const filterParams = useDateFilterParams()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    setLoading(true)
    checklistsApi
      .listRecords(filterParams)
      .then((d) => setRecords(d.items))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [filterParams.date, filterParams.from, filterParams.to, refreshKey])

  // 关键词过滤（航班号 / 检查单 / 检查人 / 机型）
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return records
    return records.filter(
      (r) =>
        (r.flight_no || '').toLowerCase().includes(kw) ||
        (r.checklist_title || r.checklist_category || '').toLowerCase().includes(kw) ||
        (r.inspector || '').toLowerCase().includes(kw) ||
        (r.aircraft_type || '').toLowerCase().includes(kw),
    )
  }, [records, keyword])

  const fmtDateTime = (iso) => (iso ? dayjs(iso).format('YYYY-MM-DD HH:mm') : '—')
  const fmtDate = (iso) => (iso ? dayjs(iso).format('YYYY-MM-DD') : '—')

  return (
    <div className="flex gap-6">
      {/* 左侧：搜索 + 日期筛选 */}
      <div className="w-[320px] shrink-0 space-y-4">
        <FlightSearchCard
          keyword={keyword}
          onKeywordChange={setKeyword}
          matchCount={filtered.length}
          placeholder="航班号 / 检查单 / 检查人 / 机型..."
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
        <DateFilterPanel />
      </div>

      {/* 右侧：填写记录列表 */}
      <div className="flex-1 min-w-0">
        <Card>
          <CardHeader>
            <CardTitle>
              检查单填写记录 {filtered.length > 0 && <span className="ml-1 text-xs font-normal text-slate-400">共 {filtered.length} 条</span>}
            </CardTitle>
            {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-4 py-2.5 font-medium">航班号</th>
                  <th className="px-4 py-2.5 font-medium">航班日期</th>
                  <th className="px-4 py-2.5 font-medium">机型</th>
                  <th className="px-4 py-2.5 font-medium">航班类型</th>
                  <th className="px-4 py-2.5 font-medium">检查单</th>
                  <th className="px-4 py-2.5 font-medium">检查人</th>
                  <th className="px-4 py-2.5 font-medium">检查时间</th>
                  <th className="px-4 py-2.5 font-medium">状态</th>
                  <th className="px-4 py-2.5 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{r.flight_no || '—'}</td>
                    <td className="px-4 py-2.5">{fmtDate(r.flight_date)}</td>
                    <td className="px-4 py-2.5">{r.aircraft_type || '—'}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={flightTypeVariant(r.flight_type)}>{r.flight_type || '—'}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {r.checklist_title || r.checklist_category || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-slate-700">{r.inspector || '—'}</span>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-600">
                      {fmtDateTime(r.checked_at || r.updated_at)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={r.status === 'submitted' ? 'success' : 'warning'}>
                        {r.status === 'submitted' ? '已提交' : '草稿'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
                        onClick={() => navigate(`/checklist/${r.flight_id}?recordId=${r.id}`)}
                      >
                        <FileText size={13} /> 查看
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                      {keyword ? '没有匹配的记录，换个关键词试试' : '所选日期暂无填写记录'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
