import { useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Badge, flightTypeVariant } from "../../components/ui/badge";
import DateFilterPanel, { useDateFilterParams } from "../../components/ui/DateFilterPanel";
import { useRecordsStore } from "../../store/recordsStore";
import Sidebar from "./components/Sidebar";
import ContentLayout from "../../components/layout/ContentLayout";
import { Loader2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

/**
 * 填写记录页（Tab: 填写记录）
 * 显示：哪个航班、谁检查的、什么时间检查的；支持按日期单选/范围筛选 + 关键词搜索
 * 状态：recordsStore（记录列表/日历标记/关键词/刷新），日期来自 appStore（DateFilterPanel 共享）
 */
export default function RecordsPage() {
    const navigate = useNavigate();
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

    // 关键词过滤（航班号 / 检查单分类 / 检查人 / 机型）
    const filtered = useMemo(() => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return records;
        return records.filter(
            (r) =>
                (r.flight_no || "").toLowerCase().includes(kw) ||
                (r.checklist_category || "").toLowerCase().includes(kw) ||
                (r.inspector || "").toLowerCase().includes(kw) ||
                (r.aircraft_type || "").toLowerCase().includes(kw)
        );
    }, [records, keyword]);

    const fmtDateTime = (iso) => (iso ? dayjs(iso).format("YYYY-MM-DD HH:mm") : "—");
    const fmtDate = (iso) => (iso ? dayjs(iso).format("YYYY-MM-DD") : "—");

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
                                <th className="px-4 py-2.5 font-medium">检查单类型</th>
                                <th className="px-4 py-2.5 font-medium">检查单分类</th>
                                <th className="px-4 py-2.5 font-medium">检查人</th>
                                <th className="px-4 py-2.5 font-medium">检查时间</th>
                                <th className="px-4 py-2.5 font-medium">状态</th>
                                <th className="px-4 py-2.5 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                                >
                                    <td className="px-4 py-2.5 font-semibold text-slate-800">{r.flight_no || "—"}</td>
                                    <td className="px-4 py-2.5">{fmtDate(r.flight_date)}</td>
                                    <td className="px-4 py-2.5">{r.aircraft_type || "—"}</td>
                                    {/* 检查单类型：记录只存 category，类型由 header.template.checklistName 反查（始发/过站/顺航） */}
                                    <td className="px-4 py-2.5">
                                        <Badge variant={flightTypeVariant(r.header?.template?.checklistName)}>
                                            {r.header?.template?.checklistName || "—"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-slate-500">{r.checklist_category || "—"}</td>
                                    <td className="px-4 py-2.5">
                                        <span className="font-medium text-slate-700">{r.inspector || "—"}</span>
                                    </td>
                                    <td className="px-4 py-2.5 tabular-nums text-slate-600">
                                        {fmtDateTime(r.checked_at || r.updated_at)}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <Badge variant={r.status === "submitted" ? "success" : "warning"}>
                                            {r.status === "submitted" ? "已提交" : "草稿"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <button
                                            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
                                            onClick={() =>
                                                navigate(`/checklist/${r.flight_id}?recordId=${r.id}&view=1`)
                                            }
                                        >
                                            <FileText size={13} /> 查看
                                        </button>
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
