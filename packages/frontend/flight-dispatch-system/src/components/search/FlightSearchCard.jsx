/**
 * 公共组件：航班搜索卡片
 * 航班列表页 / 填写记录页 共用
 *
 * 可选：生鲜筛选 Badge（点击切换选中，颜色表示状态，不可删除）
 *  - freshFilter  是否只看生鲜航班（true=绿色选中态）
 *  - freshCount   生鲜航班数量（Badge 上显示）
 *  - onFreshToggle 点击 Badge 回调
 */
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Search, RefreshCw, X, Leaf } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * @param {Object} props
 * @param {string} keyword            搜索关键词
 * @param {(v:string)=>void} onKeywordChange 关键词变化
 * @param {number} [matchCount]       匹配条数（用于显示"匹配 N 条"）
 * @param {string} [dataSource]       数据源说明（显示在左下角）
 * @param {()=>void} onRefresh        刷新回调
 * @param {string} [placeholder]      输入占位符
 * @param {boolean} [freshFilter]     生鲜筛选是否激活
 * @param {number} [freshCount]       生鲜航班数量
 * @param {()=>void} [onFreshToggle]  点击生鲜 Badge 回调（不存在则不显示）
 */
export default function FlightSearchCard({
  keyword,
  onKeywordChange,
  matchCount,
  dataSource,
  onRefresh,
  placeholder = '航班号 / 城市 / 机型...',
  freshFilter = false,
  freshCount = 0,
  onFreshToggle,
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

        {/* 生鲜筛选 Badge：颜色表示选中（绿=筛选生鲜），点击切换，不可删除 */}
        {onFreshToggle && (
          <div className="flex items-center justify-between">
            <button
              onClick={onFreshToggle}
              title={freshFilter ? '当前筛选生鲜航班，点击取消筛选' : `点击筛选生鲜航班（共 ${freshCount} 架）`}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all',
                freshFilter
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600'
              )}
            >
              <Leaf size={12} className={freshFilter ? 'text-emerald-600' : 'text-slate-400'} />
              生鲜
              <span className={cn('rounded-full px-1.5 text-[10px]', freshFilter ? 'bg-emerald-100' : 'bg-slate-100')}>
                {freshCount}
              </span>
            </button>
            <span className="text-[10px] text-slate-300">点击切换生鲜筛选</span>
          </div>
        )}

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