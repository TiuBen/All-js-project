/**
 * 公共组件：航班搜索卡片
 * 航班列表页 / 填写记录页 共用
 */
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Search, RefreshCw, X } from 'lucide-react'

/**
 * @param {Object} props
 * @param {string} keyword            搜索关键词
 * @param {(v:string)=>void} onKeywordChange 关键词变化
 * @param {number} [matchCount]       匹配条数（用于显示"匹配 N 条"）
 * @param {string} [dataSource]       数据源说明（显示在左下角）
 * @param {()=>void} onRefresh        刷新回调
 * @param {string} [placeholder]      输入占位符
 */
export default function FlightSearchCard({
  keyword,
  onKeywordChange,
  matchCount,
  dataSource,
  onRefresh,
  placeholder = '航班号 / 城市 / 机型...',
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>航班搜索</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-8 text-xs"
            placeholder={placeholder}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
          />
          {keyword && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => onKeywordChange('')}
            >
              <X size={13} />
            </button>
          )}
        </div>
        {keyword && matchCount !== undefined && (
          <div className="text-[11px] text-slate-500">
            匹配 <b className="text-primary-600">{matchCount}</b> 条
          </div>
        )}
        {(dataSource || onRefresh) && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-[11px] text-slate-400">{dataSource}</span>
            {onRefresh && (
              <Button size="sm" variant="outline" onClick={onRefresh}>
                <RefreshCw size={13} /> 刷新
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}