import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Calendar from "./search/Calendar";
import { Search, RefreshCw, X, Lock } from "lucide-react";
import { Button } from "./ui/button";

/**
 * ============================================================
 * Sidebar —— 全站通用左侧边栏（各页共用一套排版）
 * ------------------------------------------------------------
 * 形态取自航班列表页原有的私有 Sidebar，提到 components/ 下复用：
 *
 *   ┌ 搜索卡（内联输入框：吃本组件的 keyword / onKeywordChange props ——
 *   │   数据对象由页面自定，如 SpecialPage 筛的是自己的生鲜列表，不走 fips.store；
 *   │   航班列表页用的是 fips 版 Sidebar + 零 props 的 FlightSearchCard）
 *   ├ 日期选择卡（Calendar，可在每天右上角显示数量徽标）
 *   ├ 操作卡（actions 插槽）—— 或只读提示
 *   ├ 统计卡（stats 插槽，页面自备 Card）
 *   └ 附加区（extra 插槽）
 *
 * 页面只传数据与回调，不再各自拼排版。
 *
 * @param {string}   keyword / onKeywordChange      搜索关键词
 * @param {number}   [matchCount]                   匹配条数（有关键词时显示）
 * @param {()=>void} [onRefresh]                    刷新
 * @param {string}   [searchPlaceholder]            搜索框占位符
 * @param {string}   [dataSource]                   数据源说明（搜索卡左下角）
 * @param {Object}   [dayMarkers]                   日历每天的小数字：{ 'YYYY-MM-DD': { count, tone? } }
 * @param {string}   [calendarTitle]                日期卡标题
 * @param {string}   [notice]                       日期卡提示文案
 * @param {boolean}  [readOnly]                     只读模式：隐藏 actions，改为提示条
 * @param {string}   [readOnlyHint]                 只读提示正文
 * @param {React.ReactNode} [actions]               操作区内容（自动包一层 Card）
 * @param {React.ReactNode} [stats]                 统计区内容（原样渲染，Card 由页面自备）
 * @param {React.ReactNode} [extra]                 附加内容（原样渲染，放在最后）
 * ============================================================
 */
export default function Sidebar({
    keyword,
    onKeywordChange,
    matchCount,
    onRefresh,
    searchPlaceholder = "航班号 / 城市 / 机型...",
    dataSource,
    dayMarkers,
    calendarTitle = "日期选择",
    notice,
    readOnly = false,
    readOnlyHint = "当前数据源为只读，不支持在前端修改数据。",
    actions,
    stats,
    extra,
}) {
    return (
        <>
            {/* 搜索卡（内联：筛选对象由页面决定，不吃 fips.store —— 那是 FlightSearchCard 的事） */}
            <Card>
                <CardHeader>
                    <CardTitle>航班搜索</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            className="input pl-8 text-xs"
                            placeholder={searchPlaceholder}
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

            <Calendar title={calendarTitle} dayMarkers={dayMarkers} notice={notice} />

            {readOnly ? (
                /* 只读数据源：写操作全部隐藏，改为提示条 */
                <Card>
                    <CardContent className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <Lock size={13} /> 只读数据源
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-400">{readOnlyHint}</p>
                    </CardContent>
                </Card>
            ) : (
                actions != null && (
                    <Card>
                        <CardContent className="space-y-2">{actions}</CardContent>
                    </Card>
                )
            )}

            {stats}
            {extra}
        </>
    );
}
