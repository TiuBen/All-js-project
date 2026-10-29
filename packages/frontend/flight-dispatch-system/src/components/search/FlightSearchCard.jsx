/**
 * 公共组件：航班搜索卡片（**零 props，store 联动**）
 * ------------------------------------------------------------
 * 不再从页面传属性：组件自己订阅 fips.store 的筛选状态，输入即筛选 ——
 *   keyword / setKeyword     搜索词住在 store（setKeyword 内部 deriveLists
 *                            自动重筛重排，切页回来搜索词还在）
 *   flights                  store 派生的筛选后列表 → 「匹配 N 条」直接取它的长度
 *   freshOnly / setFreshOnly 生鲜筛选（Badge 点击切换，颜色表示状态）
 *   freshCount               生鲜航班数量（Badge 上显示）
 *   fetchFlights             刷新按钮
 * 数据源标签读 app.store 的 source（换源自己跟着变）。
 *
 * ★ 页面里直接 <FlightSearchCard />，一个属性都不用传。
 */
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Search, RefreshCw, X, Leaf } from "lucide-react";
import { cn } from "../../utils/cn";
import { useFipsStore } from "../../store/fips.store";
import { useAppStore } from "../../store/app.store";
import { sourceLabelOf } from "../../config/dataSource";
import { matchKeyword } from "../../pages/FipsPage/stateToWhichCell";

export default function FlightSearchCard() {
    // 筛选状态与动作全在 fips.store：写 keyword 就是筛 fips 数据
    const keyword = useFipsStore((s) => s.keyword);
    const setKeyword = useFipsStore((s) => s.setKeyword);
    const fipsMatchCount = useFipsStore((s) => s.flights.length);
    const rawRows = useFipsStore((s) => s.rows);
    const freshOnly = useFipsStore((s) => s.freshOnly);
    const setFreshOnly = useFipsStore((s) => s.setFreshOnly);
    const freshCount = useFipsStore((s) => s.freshCount);
    const onRefresh = useFipsStore((s) => s.fetchFlights);
    // 数据源说明（搜索卡左下角）：读 app.store，换源自动更新
    const source = useAppStore((s) => s.source);
    const dataSource = sourceLabelOf(source);

    // 「匹配 N 条」必须和表格同一口径：
    //   花湖翼览源 = 原始快照**整行任一格**命中（与 RawEcyilangTable 同一个 matchKeyword）；
    //   其余源 = 派生后的 flights 列表长度。
    const matchCount =
        source === "ecyilang" ? rawRows.filter((r) => matchKeyword(r, keyword)).length : fipsMatchCount;

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
                        placeholder="航班号 / 城市 / 机型..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    {keyword && (
                        <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            onClick={() => setKeyword("")}
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* 生鲜筛选 Badge：颜色表示选中（绿=筛选生鲜），点击切换，不可删除 */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setFreshOnly(!freshOnly)}
                        title={freshOnly ? "当前筛选生鲜航班，点击取消筛选" : `点击筛选生鲜航班（共 ${freshCount} 架）`}
                        className={cn(
                            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all",
                            freshOnly
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm"
                                : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
                        )}
                    >
                        <Leaf size={12} className={freshOnly ? "text-emerald-600" : "text-slate-400"} />
                        生鲜
                        <span
                            className={cn(
                                "rounded-full px-1.5 text-[10px]",
                                freshOnly ? "bg-emerald-100" : "bg-slate-100"
                            )}
                        >
                            {freshCount}
                        </span>
                    </button>
                    <span className="text-[10px] text-slate-300">点击切换生鲜筛选</span>
                </div>

                {keyword && (
                    <div className="text-[11px] text-slate-500">
                        匹配 <b className="text-primary-600">{matchCount}</b> 条
                    </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="text-[11px] text-slate-400">{dataSource}</span>
                    <Button size="sm" variant="outline" onClick={onRefresh}>
                        <RefreshCw size={13} /> 刷新
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
