import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import DateFilterPanel, { useDateFilterParams } from "../../components/ui/DateFilterPanel";
import { useRecordsStore } from "../../store/recordsStore";
import { typeOfCheckTemplate } from "../../store/checklistStore";
import Sidebar from "./components/Sidebar";
import ContentLayout from "../../Layout/ContentLayout";
import { Loader2, FileText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

/**
 * 填写记录页 FipsPage（Tab: 填写记录；同时挂 /records 与 /checklists 两条路由）
 * 显示：哪个航班、谁检查的、什么时间检查的；支持按日期单选/范围筛选 + 关键词搜索
 * 状态：recordsStore（记录列表/日历标记/关键词/刷新），日期来自 appStore（DateFilterPanel 共享）
 *
 * ★ URL 筛选参数（对应 REST 风格的 GET /checklists?...）：
 *     ?flightId=123      只看该航班的记录
 *     ?checkTemplate=2   只看某类型（1~5 = store 的 TYPE_ORDER 序号）
 *     ?checkedId=456     只看该条记录（并高亮行）
 *   参数与关键词/日期筛选叠加生效；无参数时行为与原来完全一致。
 */
export default function FipsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const flightIdParam = searchParams.get("flightId");
    const ctLabel = typeOfCheckTemplate(searchParams.get("checkTemplate"));
    const checkedIdParam = searchParams.get("checkedId");
    const filterParams = useDateFilterParams(); // appStore 的日期（单选 date / 范围 from,to）
    const records = useRecordsStore((s) => s.records);
    const loading = useRecordsStore((s) => s.loading);
    const keyword = useRecordsStore((s) => s.keyword);
    const dayMarkers = useRecordsStore((s) => s.dayMarkers);
    const refreshKey = useRecordsStore((s) => s.refreshKey);
    const setKeyword = useRecordsStore((s) => s.setKeyword);
    const refresh = useRecordsStore((s) => s.refresh);
    const fetchRecords = useRecordsStore((s) => s.fetchRecords);
    const fetchDayMarkers = useRecordsStore((s) => s.fetchDayMarkers);
    const deleteRecord = useRecordsStore((s) => s.deleteRecord);

    // 所选日期变化（appStore）或手动刷新 → 重新拉取列表
    useEffect(() => {
        fetchRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterParams.date, filterParams.from, filterParams.to, refreshKey]);

    // 首次挂载 + 手动刷新 → 更新日历红/绿数字标记
    useEffect(() => {
        fetchDayMarkers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    // 过滤链：URL 参数（flightId / checkTemplate / checkedId）→ 关键词（航班号/分类/检查人/机型）
    const filtered = useMemo(() => {
        let rows = records;
        if (flightIdParam) rows = rows.filter((r) => String(r.flight_id) === String(flightIdParam));
        if (ctLabel) rows = rows.filter((r) => r.checklist_category === ctLabel);
        if (checkedIdParam) rows = rows.filter((r) => String(r.id) === String(checkedIdParam));
        const kw = keyword.trim().toLowerCase();
        if (!kw) return rows;
        return rows.filter(
            (r) =>
                (r.flight_no || "").toLowerCase().includes(kw) ||
                (r.checklist_category || "").toLowerCase().includes(kw) ||
                (r.inspector || "").toLowerCase().includes(kw) ||
                (r.aircraft_type || "").toLowerCase().includes(kw)
        );
    }, [records, keyword, flightIdParam, ctLabel, checkedIdParam]);

    // 时间显示：统一 YYYY-MM-DD HH:mm:ss（创建时间 created_at / 修改时间 updated_at）
    const fmtDateTime = (iso) => (iso ? dayjs(iso).format("YYYY-MM-DD HH:mm:ss") : "—");
    const fmtDate = (iso) => (iso ? dayjs(iso).format("YYYY-MM-DD") : "—");

    // 删除确认后调用 store（后端同步解除 fips/manual_fips.checklist_uuid 关联并刷新列表/日历）
    const handleDelete = async (r) => {
        if (!window.confirm(`确定删除 ${r.flight_no || r.flight_id} 的检查单记录？删除后该航班可重新创建检查单。`)) return;
        try {
            await deleteRecord(r.id);
        } catch (e) {
            window.alert(`删除失败：${e.message}`);
        }
    };

    return (
        <ContentLayout
            sidebar={
                <Sidebar
                    keyword={keyword}
                    onKeywordChange={setKeyword}
                    matchCount={filtered.length}
                    onRefresh={refresh}
                    dayMarkers={dayMarkers}
                />
            }
        >
            {/* 右侧：填写记录列表 */}
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <CardHeader className="shrink-0">
                    <CardTitle>
                        检查单填写记录{" "}
                        {filtered.length > 0 && (
                            <span className="ml-1 text-xs font-normal text-slate-400">共 {filtered.length} 条</span>
                        )}
                    </CardTitle>
                    {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
                </CardHeader>
                <div className="min-h-0 flex-1 overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                                <th className="px-4 py-2.5 font-medium">航班号</th>
                                <th className="px-4 py-2.5 font-medium">航班日期</th>
                                <th className="px-4 py-2.5 font-medium">机型</th>
                                <th className="px-4 py-2.5 font-medium">检查单</th>
                                <th className="px-4 py-2.5 font-medium">检查人</th>
                                <th className="px-4 py-2.5 font-medium">创建时间</th>
                                <th className="px-4 py-2.5 font-medium">修改时间</th>
                                <th className="px-4 py-2.5 font-medium">状态</th>
                                <th className="px-4 py-2.5 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr
                                    key={r.id}
                                    className={
                                        "border-b border-slate-100 transition-colors hover:bg-slate-50 " +
                                        (checkedIdParam && String(r.id) === String(checkedIdParam)
                                            ? "bg-amber-50/70"
                                            : "")
                                    }
                                >
                                    <td className="px-4 py-2.5 font-semibold text-slate-800">{r.flight_no || "—"}</td>
                                    <td className="px-4 py-2.5">{fmtDate(r.flight_date)}</td>
                                    <td className="px-4 py-2.5">{r.aircraft_type || "—"}</td>
                                    {/* 检查单：checklist_category 与检查单页下拉菜单完全对齐（如 货运始发航班 / 客运过站航班 / 顺航检查单） */}
                                    <td className="px-4 py-2.5">
                                        <Badge>{r.checklist_category || "—"}</Badge>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className="font-medium text-slate-700">{r.inspector || "—"}</span>
                                    </td>
                                    <td className="px-4 py-2.5 tabular-nums text-slate-600">{fmtDateTime(r.created_at)}</td>
                                    <td className="px-4 py-2.5 tabular-nums text-slate-600">{fmtDateTime(r.updated_at)}</td>
                                    <td className="px-4 py-2.5">
                                        <Badge variant={r.status === "submitted" ? "success" : "warning"}>
                                            {r.status === "submitted" ? "已提交" : "草稿"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-3">
                                            <button
                                                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
                                                onClick={() =>
                                                    navigate(`/checklist/${r.flight_id}?recordId=${r.id}&view=1`)
                                                }
                                            >
                                                <FileText size={13} /> 查看
                                            </button>
                                            <button
                                                className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:underline"
                                                title="删除该记录（解除航班与检查单的关联）"
                                                onClick={() => handleDelete(r)}
                                            >
                                                <Trash2 size={13} /> 删除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                                        {keyword ? "没有匹配的记录，换个关键词试试" : "所选日期暂无填写记录"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </ContentLayout>
    );
}
