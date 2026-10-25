/**
 * ============================================================
 * RecordsSidebar —— 填写记录页左侧边栏（零 props：全走 records.store）
 * ------------------------------------------------------------
 * 搜索卡（公共组件，与航班列表页同一套）+ 日期筛选（带红/绿数字徽标）
 * + 选中记录的操作（查看详情 / 修改 / 删除）。
 *
 * ★ 全部从 records.store 自订阅：keyword / visible（匹配数）/
 *   selectedId / dayMarkers + 动作（setKeyword / deleteSelected / refresh）。
 *   跳转（查看详情 / 进编辑器修改）在这里 useNavigate。
 *
 * ★ 三个动作对应三种后端语义（各自走各自的入口，互不覆盖）：
 *   查看 → 详情页 /checklists/:id
 *   修改 → 编辑器 ?record=<id>（提交调 update，PUT 只改这一条）
 *   删除 → DELETE /api/checklist/:id（store 的 deleteSelected）
 *
 * dayMarkers：{ 'YYYY-MM-DD': { count, hasAbnormal } } —— 按**创建日**统计，
 * 徽标红=当日有异常项、绿=全部正常，数字=当日检查单条数。
 * ============================================================
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import FlightSearchCard from "../../../components/search/FlightSearchCard";
import Calendar from "../../../components/search/Calendar";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { countAbnormal, useRecordsStore } from "../../../store/records.store";

export default function RecordsSidebar() {
    const navigate = useNavigate();

    // ===== 全部从 records.store 订阅（零 props）=====
    const keyword = useRecordsStore((s) => s.keyword);
    const setKeyword = useRecordsStore((s) => s.setKeyword);
    const visible = useRecordsStore((s) => s.visible);
    const rows = useRecordsStore((s) => s.rows);
    const selectedId = useRecordsStore((s) => s.selectedId);
    const dayMarkers = useRecordsStore((s) => s.dayMarkers);
    const deleteSelected = useRecordsStore((s) => s.deleteSelected);
    const refresh = useRecordsStore((s) => s.refresh);

    /**
     * 选中行：优先从 visible（带 abnormal 标注）找 —— 被关键词过滤掉后
     * 左栏信息消失是不对的，找不到再退回全量 rows 现算 abnormal
     */
    const selected = useMemo(() => {
        if (selectedId == null) return null;
        const hit = visible.find((r) => r.id === selectedId);
        if (hit) return hit;
        const raw = rows.find((r) => r.id === selectedId);
        return raw ? { ...raw, abnormal: countAbnormal(raw) } : null;
    }, [visible, rows, selectedId]);

    /** 查看 → 详情页 */
    const handleView = (r) => r?.id && navigate(`/checklists/${r.id}`);
    /** 修改 → 编辑器 ?record=<id>（提交 = PUT 更新这一条） */
    const handleEdit = (r) => r?.id && navigate(`/checklists/${r.id}`);
    /** 删除选中记录（confirm 放交互层；store 的 deleteSelected 负责删 + 刷新） */
    const handleDelete = async () => {
        if (!selected) return;
        if (!window.confirm(`确定删除 ${selected.callsign || selected.id} 的检查单记录吗？`)) return;
        try {
            await deleteSelected();
        } catch (err) {
            alert(`删除失败：${err.message}`);
        }
    };

    return (
        <>
            <FlightSearchCard
                keyword={keyword}
                onKeywordChange={setKeyword}
                matchCount={visible.length}
                dataSource="数据源：检查单填写记录"
                placeholder="航班号 / 机型 / 检查人..."
                onRefresh={refresh}
            />

            <Calendar dayMarkers={dayMarkers} />

            {/* 选中记录的操作（日期组件下方，与航班列表页同位置） */}
            <Card>
                <CardContent className="space-y-2">
                    <div className="rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                        {selected ? (
                            <>
                                <div className="font-semibold text-slate-700">
                                    {selected.callsign || selected.flight_uuid}
                                </div>
                                <div className="mt-0.5">
                                    {selected.checklist_category || "—"} · 创建{" "}
                                    {selected.created_at ? dayjs(selected.created_at).format("MM-DD HH:mm") : "—"}
                                </div>
                                {selected.abnormal > 0 && (
                                    <div className="mt-0.5 font-medium text-red-600">异常 {selected.abnormal} 项</div>
                                )}
                            </>
                        ) : (
                            "点击表格中的一行选中记录"
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            size="sm"
                            className="col-span-2 w-full"
                            disabled={!selected}
                            onClick={() => handleView(selected)}
                            title={selected ? "打开这条检查单的详情" : "请先点击表格中的一行选中记录"}
                        >
                            <Eye size={14} /> 查看详情
                        </Button>
                        {/* 修改：进编辑器改**这一条**（提交 = PUT 更新，不会新增记录） */}
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            disabled={!selected}
                            onClick={() => handleEdit(selected)}
                            title={selected ? "修改这条检查单（提交 = 更新这一条）" : "请先点击表格中的一行选中记录"}
                        >
                            <Pencil size={14} /> 修改
                        </Button>
                        {/* 删除：DELETE 只删这一条 */}
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            disabled={!selected}
                            onClick={handleDelete}
                            title={selected ? "删除选中的检查单记录" : "请先点击表格中的一行选中记录"}
                        >
                            <Trash2 size={14} /> 删除
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
