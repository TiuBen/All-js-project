import { Card, CardContent } from "./ui/card";
import FlightSearchCard from "./search/FlightSearchCard";
import Calendar from "./search/Calendar";
import { Lock } from "lucide-react";

/**
 * ============================================================
 * Sidebar —— 全站通用左侧边栏（各页共用一套排版）
 * ------------------------------------------------------------
 * 形态取自航班列表页原有的私有 Sidebar，提到 components/ 下复用：
 *
 *   ┌ 航班搜索卡（FlightSearchCard，含数据源 / 刷新 / 生鲜筛选）
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
 * @param {boolean}  [freshFilter]                  生鲜筛选是否激活
 * @param {number}   [freshCount]                   生鲜航班数
 * @param {()=>void} [onFreshToggle]                点击生鲜 Badge（不传则不显示 Badge）
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
    freshFilter = false,
    freshCount = 0,
    onFreshToggle,
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
            <FlightSearchCard
                keyword={keyword}
                onKeywordChange={onKeywordChange}
                matchCount={matchCount}
                placeholder={searchPlaceholder}
                dataSource={dataSource}
                onRefresh={onRefresh}
                freshFilter={freshFilter}
                freshCount={freshCount}
                onFreshToggle={onFreshToggle}
            />

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
