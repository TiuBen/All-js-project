import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import ContentLayout from "../../Layout/ContentLayout";
import RecordsSidebar from "./components/RecordsSidebar";
import { useRecordsStore, countAbnormal } from "../../store/recordsStore";
import { useAppStore } from "../../store/appStore";
import { typeColorOf, withAlpha } from "../../store/checklistStore";
import { cn } from "../../lib/utils";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Loader2, Pencil } from "lucide-react";

/**
 * ============================================================
 * RecordsPage —— 填写记录页
 * ------------------------------------------------------------
 * 与「航班列表」同构：左侧 Sidebar（搜索 + 日期 + 操作）+ 右侧表格。
 * ------------------------------------------------------------
 * ★ **日期口径 = 创建日（created_at）**
 *   表格按"这份检查单是哪天填写的"归档，左侧日历的红/绿数字徽标、
 *   以及后端 listRecords 的 date / from-to 过滤口径完全一致；
 *   之后再做修改不会把记录挪到别的日期下（区分"创建日期"与"最后更新"两列）。
 * ★ 异常数 = items + video_supervision 里 status === 'abnormal' 的项数
 *   （与日历徽标的红/绿判定同源，见 recordsStore.countAbnormal）
 * ★ 行内/左栏的操作各对应一种后端语义（互不覆盖，同一航班可有多份检查单）：
 *   查看 → 详情页 /checklists/:id
 *   修改 → 编辑器 ?record=<id> → 提交走 PUT，只改这一条
 *   删除 → DELETE /records/:id，只删这一条（该航班其他检查单不受影响）
 * ============================================================
 */

// 表格列（列配置驱动：渲染 / 排序共用）
const COLUMNS = [
    { key: "created_at", label: "创建日期", sortable: true },
    { key: "flight_no", label: "航班号", sortable: true },
    { key: "aircraft_type", label: "机型", sortable: true },
    { key: "checklist_category", label: "检查单类型", sortable: true },
    { key: "inspector", label: "检查人", sortable: true },
    { key: "status", label: "状态", sortable: true },
    { key: "abnormal", label: "异常", sortable: true },
    { key: "updated_at", label: "最后更新", sortable: true },
];

/** 时间戳 → 本地日期 / 时间片段（空值显示占位） */
const fmtDay = (ts) => (ts ? dayjs(ts).format("YYYY-MM-DD") : "—");
const fmtClock = (ts) => (ts ? dayjs(ts).format("HH:mm") : "");

export default function RecordsPage() {
    const navigate = useNavigate();

    // ===== store 订阅（细粒度）=====
    const records = useRecordsStore((s) => s.records);
    const loading = useRecordsStore((s) => s.loading);
    const error = useRecordsStore((s) => s.error);
    const dayMarkers = useRecordsStore((s) => s.dayMarkers);
    const refreshKey = useRecordsStore((s) => s.refreshKey);
    const fetchRecords = useRecordsStore((s) => s.fetchRecords);
    const fetchDayMarkers = useRecordsStore((s) => s.fetchDayMarkers);
    const removeRecord = useRecordsStore((s) => s.deleteRecord);

    // ===== 日期筛选（与航班列表页共用同一处全局状态）=====
    const mode = useAppStore((s) => s.mode);
    const selectedDate = useAppStore((s) => s.selectedDate);
    const rangeFrom = useAppStore((s) => s.rangeFrom);
    const rangeTo = useAppStore((s) => s.rangeTo);

    const [keyword, setKeyword] = useState("");
    const [selectedId, setSelectedId] = useState(null); // 选中行（供查看 / 删除）

    // 日期变化、手动刷新、提交记录后（recordsStore.refresh() 提 key）都重新拉取
    useEffect(() => {
        // 后端未启动时请求失败 → store 已写 error 态，这里只兜住未处理 rejection
        fetchRecords().catch(() => {});
        fetchDayMarkers();
    }, [fetchRecords, fetchDayMarkers, refreshKey, mode, selectedDate, rangeFrom, rangeTo]);

    // 换日期后清空选中行：换了日期还留着上一条的选中态是不对的
    useEffect(() => {
        setSelectedId(null);
    }, [mode, selectedDate, rangeFrom, rangeTo]);

    // 逐条附带异常项数（渲染与排序都要用）
    const enriched = useMemo(
        () => records.map((r) => ({ ...r, abnormal: countAbnormal(r) })),
        [records]
    );

    // 关键词过滤（航班号 / 机型 / 检查单类型 / 检查人 / 航班键）
    const filtered = useMemo(() => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return enriched;
        return enriched.filter((r) =>
            [r.flight_no, r.aircraft_type, r.checklist_category, r.inspector, r.flight_id].some((v) =>
                String(v || "").toLowerCase().includes(kw)
            )
        );
    }, [enriched, keyword]);

    // ===== 排序（列头点击三态：升 → 降 → 取消）=====
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null);
    const handleSort = (key) => {
        if (sortKey !== key) {
            setSortKey(key);
            setSortDir("asc");
        } else if (sortDir === "asc") setSortDir("desc");
        else if (sortDir === "desc") {
            setSortKey(null);
            setSortDir(null);
        }
    };
    const SortIcon = ({ colKey }) => {
        if (sortKey !== colKey) return <ChevronsUpDown size={12} className="text-slate-300" />;
        return sortDir === "asc" ? (
            <ChevronUp size={12} className="text-primary-600" />
        ) : (
            <ChevronDown size={12} className="text-primary-600" />
        );
    };
    const sorted = useMemo(() => {
        if (!sortKey || !sortDir) return filtered;
        const arr = [...filtered];
        arr.sort((a, b) => {
            let va = a[sortKey];
            let vb = b[sortKey];
            if (sortKey === "created_at" || sortKey === "updated_at") {
                va = va ? new Date(va).getTime() : 0;
                vb = vb ? new Date(vb).getTime() : 0;
            } else if (sortKey === "abnormal") {
                va = Number(va) || 0;
                vb = Number(vb) || 0;
            } else {
                va = String(va ?? "");
                vb = String(vb ?? "");
            }
            if (va < vb) return sortDir === "asc" ? -1 : 1;
            if (va > vb) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
        return arr;
    }, [filtered, sortKey, sortDir]);

    // 选中行（同时从全量里找，避免被关键词过滤掉后左栏信息消失）
    const selected = useMemo(
        () => enriched.find((r) => r.id === selectedId) || null,
        [enriched, selectedId]
    );

    // 打开详情（viewer 按 URL 主键自行拉取）
    const handleView = (r) => {
        if (!r?.id) return;
        navigate(`/checklists/${r.id}`);
    };

    /**
     * 修改这条记录 → 编辑器 **修改模式**（URL 带 ?record=<id>）
     * 编辑器据此走 openRecordForEdit（拉原内容灌填写层），提交调 updateRecord（PUT）——
     * 只改这一条，不会像"新建"那样多出一条记录。
     * 航班键优先用记录的 flight_id（可能是 'manual-5' / '5' 两种历史写法，
     * openFlight/findFlightByKey 都认）；只作路由占位，真正身份是 ?record=。
     */
    const handleEdit = (r) => {
        if (!r?.id) return;
        navigate(`/checklists/flight/${r.flight_id || r.id}?record=${r.id}`);
    };

    // 删除选中记录（后端会同步解除 manual_fips.checklist_uuid 关联）
    const handleDelete = async () => {
        if (!selected) return;
        if (!window.confirm(`确定删除 ${selected.flight_no || selected.id} 的检查单记录吗？`)) return;
        try {
            await removeRecord(selected.id);
            setSelectedId(null);
        } catch (err) {
            alert(`删除失败：${err.message}`);
        }
    };

    // 单元格渲染（按列 key）
    const renderCell = (r, col) => {
        switch (col.key) {
            // 创建日期：日期为主 + 时刻小字（本页的日期维度就是它）
            case "created_at":
                return (
                    <div className="leading-tight">
                        <div className="font-semibold tabular-nums text-slate-700">{fmtDay(r.created_at)}</div>
                        <div className="text-[11px] tabular-nums text-slate-400">{fmtClock(r.created_at)}</div>
                    </div>
                );
            case "flight_no":
                return <span className="font-semibold">{r.flight_no || "—"}</span>;
            case "aircraft_type":
                return <span className="text-slate-600">{r.aircraft_type || "—"}</span>;
            // 检查单类型：配色与检查单页/工具栏同源（inline style，避免 Tailwind 动态类名）
            case "checklist_category": {
                const c = typeColorOf(r.checklist_category) || "#64748b";
                return (
                    <span
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium"
                        style={{ color: c, borderColor: withAlpha(c, 0.35), backgroundColor: withAlpha(c, 0.08) }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
                        {r.checklist_category || "—"}
                    </span>
                );
            }
            case "inspector":
                return <span className="text-slate-600">{r.inspector || "—"}</span>;
            case "status":
                return r.status === "submitted" ? (
                    <Badge variant="success">已提交</Badge>
                ) : (
                    <Badge variant="default">草稿</Badge>
                );
            // 异常项数：0 用占位符（一屏红点会很吵），>0 用红底数字
            case "abnormal":
                return r.abnormal > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                        {r.abnormal}
                    </span>
                ) : (
                    <span className="text-slate-300">—</span>
                );
            case "updated_at":
                return (
                    <div className="leading-tight">
                        <div className="tabular-nums text-slate-600">{fmtDay(r.updated_at)}</div>
                        <div className="text-[11px] tabular-nums text-slate-400">{fmtClock(r.updated_at)}</div>
                    </div>
                );
            default:
                return r[col.key] || "—";
        }
    };

    // 当前日期筛选说明（表头副标题）
    const dateLabel = mode === "single" ? selectedDate : `${rangeFrom || "—"} ~ ${rangeTo || "—"}`;
    const abnormalCount = useMemo(() => filtered.filter((r) => r.abnormal > 0).length, [filtered]);

    return (
        <ContentLayout
            sidebar={
                <RecordsSidebar
                    keyword={keyword}
                    onKeywordChange={setKeyword}
                    matchCount={sorted.length}
                    onRefresh={() => {
                        fetchRecords().catch(() => {});
                        fetchDayMarkers();
                    }}
                    dayMarkers={dayMarkers}
                    selected={selected}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            }
        >
            {/* 右侧：检查单填写记录表格 */}
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <CardHeader className="shrink-0">
                    <div className="flex items-center gap-3">
                        <CardTitle>
                            填写记录{" "}
                            {sorted.length > 0 && (
                                <span className="ml-1 text-xs font-normal text-slate-400">
                                    共 {sorted.length} 条
                                </span>
                            )}
                        </CardTitle>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            创建日 {dateLabel}
                        </span>
                        {abnormalCount > 0 && (
                            <span className="rounded bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                                含异常 {abnormalCount} 条
                            </span>
                        )}
                        {selected && (
                            <span className="text-sm font-semibold text-green-700">
                                已选中：{selected.flight_no || selected.id}
                            </span>
                        )}
                        {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
                    </div>
                </CardHeader>

                {error && (
                    <div className="mx-3 mt-1 rounded bg-red-50 px-3 py-1.5 text-xs text-red-600">
                        加载失败：{error}
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-50">
                            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                                {COLUMNS.map((col) => (
                                    <th
                                        key={col.key}
                                        className={cn(
                                            "select-none whitespace-nowrap px-2 py-1.5 font-medium",
                                            col.sortable &&
                                                "cursor-pointer transition-colors hover:text-primary-600",
                                            sortKey === col.key && "text-primary-600"
                                        )}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                        title={col.sortable ? "点击切换排序" : undefined}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            {col.label}
                                            {col.sortable && <SortIcon colKey={col.key} />}
                                        </span>
                                    </th>
                                ))}
                                <th className="whitespace-nowrap px-2 py-1.5 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((r) => (
                                <tr
                                    key={r.id}
                                    onClick={() => setSelectedId(r.id)}
                                    onDoubleClick={() => handleView(r)}
                                    className={cn(
                                        "cursor-pointer border-b border-slate-100 transition-colors",
                                        selectedId === r.id
                                            ? "bg-primary-50/60 hover:bg-primary-50/60"
                                            : "hover:bg-primary-50/40"
                                    )}
                                >
                                    {COLUMNS.map((col) => (
                                        <td key={col.key} className="whitespace-nowrap px-2 py-1.5 align-middle">
                                            {renderCell(r, col)}
                                        </td>
                                    ))}
                                    <td className="whitespace-nowrap px-2 py-1.5 align-middle">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleView(r);
                                                }}
                                            >
                                                <Eye size={13} /> 查看
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(r);
                                                }}
                                            >
                                                <Pencil size={13} /> 修改
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sorted.length === 0 && !loading && (
                        <div className="py-10 text-center text-sm text-slate-400">
                            {keyword
                                ? "没有匹配的检查单记录，换个关键词试试"
                                : `创建日 ${dateLabel} 暂无检查单记录，可在「航班列表」页为航班创建检查表`}
                        </div>
                    )}
                </div>
            </Card>
        </ContentLayout>
    );
}
