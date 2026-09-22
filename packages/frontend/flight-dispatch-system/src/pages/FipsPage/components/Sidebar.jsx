import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import FlightSearchCard from "../../../components/search/FlightSearchCard";
import DateFilterPanel from "../../../components/ui/DateFilterPanel";
import { Plus, Pencil, Trash2, Leaf, Ban } from "lucide-react";

/**
 * ============================================================
 * FlightSchedulePage 私有 Sidebar —— 左侧边栏
 * ------------------------------------------------------------
 * 搜索卡 + 日期筛选 + 航班操作按钮（添加/修改/删除 + 生鲜标记）
 * ============================================================
 */
export default function Sidebar({
    keyword,
    onKeywordChange,
    matchCount,
    onRefresh,
    freshFilter,
    freshCount,
    onFreshToggle,
    selectedId,
    flights,
    onAdd,
    onEdit,
    onDelete,
    onMarkFresh,
    onUnmarkFresh,
}) {
    const selected = flights.find((f) => f.id === selectedId);

    return (
        <>
            <FlightSearchCard
                keyword={keyword}
                onKeywordChange={onKeywordChange}
                matchCount={matchCount}
                dataSource="数据源：手动添加航班"
                onRefresh={onRefresh}
                freshFilter={freshFilter}
                freshCount={freshCount}
                onFreshToggle={onFreshToggle}
            />

            <DateFilterPanel />

            {/* 添加 / 修改 / 删除 航班按钮（日期组件下方） */}
            <Card>
                <CardContent className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                        <Button size="sm" className="w-full" onClick={onAdd}>
                            <Plus size={14} /> 添加
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            disabled={selectedId == null}
                            onClick={onEdit}
                            title={selectedId == null ? "请先点击表格中的一行选中航班" : "修改选中的航班"}
                        >
                            <Pencil size={14} /> 修改
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            disabled={selectedId == null}
                            onClick={onDelete}
                            title={selectedId == null ? "请先点击表格中的一行选中航班" : "删除选中的航班"}
                        >
                            <Trash2 size={14} /> 删除
                        </Button>
                    </div>
                    {/* 生鲜标记操作（选中行后可用） */}
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                        <Button
                            size="sm"
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            disabled={selectedId == null || selected?.is_fresh}
                            onClick={onMarkFresh}
                            title={selectedId == null ? "请先点击表格中的一行选中航班" : "将选中的航班标记为生鲜货物"}
                        >
                            <Leaf size={14} /> 标记为生鲜
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            disabled={selectedId == null || !selected?.is_fresh}
                            onClick={onUnmarkFresh}
                            title={selectedId == null ? "请先点击表格中的一行选中航班" : "取消选中的航班的生鲜标记"}
                        >
                            <Ban size={14} /> 取消生鲜标记
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
