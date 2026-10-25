/**
 * ============================================================
 * RecordsTable —— 填写记录表（零 props：数据与排序全走 records.store）
 * ------------------------------------------------------------
 * 列（创建日期 / 航班号 / 机型 / 检查单类型 / 检查人 / 状态 / 异常 / 最后更新）
 * 渲染 + 三态排序 + 行选中（单击）/ 查看跳转（双击）+ 操作列（查看 / 修改）。
 *
 * ★ 数据从 records.store 订阅（visible / selectedId / sortKey…），
 *   动作也走 store（selectRow / toggleSort）；跳转（查看详情 / 进编辑器）
 *   属于路由动作，在这里 useNavigate。
 *   - 查看 → 详情页 /checklists/:id
 *   - 修改 → 编辑器 ?record=<id>（提交 = PUT 只改这一条）
 * ============================================================
 */
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Pencil } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { useRecordsStore } from "../../../store/records.store";
import { typeColorOf, withAlpha } from "../../../store/checklistEditorPage.store";
import { cn } from "../../../utils/cn";

/** 表格列（顺序即显示顺序；sortable = 列头可点击排序） */
const COLUMNS = [
    { key: "created_at", label: "创建日期", sortable: true },
    { key: "callsign", label: "航班号", sortable: true },
    { key: "aircraft_type", label: "机型", sortable: true },
    { key: "checklist_category", label: "检查单类型", sortable: true },
    { key: "inspector", label: "检查人", sortable: true },
    { key: "status", label: "状态", sortable: true },
    { key: "abnormal", label: "异常", sortable: true },
    { key: "updated_at", label: "最后更新", sortable: true },
];

/** 时间戳 → 本地日期 / 时间片段（空值显示占位） */
const fmtDay = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fmtClock = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function RecordsTable() {
    const navigate = useNavigate();

    // ===== 全部从 records.store 订阅（零 props）=====
    const visible = useRecordsStore((s) => s.visible);
    const loading = useRecordsStore((s) => s.loading);
    const selectedId = useRecordsStore((s) => s.selectedId);
    const selectRow = useRecordsStore((s) => s.selectRow);
    const sortKey = useRecordsStore((s) => s.sortKey);
    const sortDir = useRecordsStore((s) => s.sortDir);
    const toggleSort = useRecordsStore((s) => s.toggleSort);
    const keyword = useRecordsStore((s) => s.keyword);

    /** 查看 → 详情页（viewer 按 URL 主键自行拉取） */
    const handleView = (r) => r?.id && navigate(`/checklists/${r.id}`);
    /**
     * 修改这条记录 → 编辑器**修改模式**（URL 带 ?record=<id>）：
     * 提交走 PUT 只改这一条；航班键用记录的 flight_uuid（跨表唯一的真实键）
     */
    const handleEdit = (r) => r?.id && navigate(`/checklists/${r.id}`);

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
            case "callsign":
                return <span className="font-semibold">{r.callsign || "—"}</span>;
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
                return <span className="text-slate-600">{r.inspector?.name || "—"}</span>;
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

    // 列头排序图标（三态）
    const SortIcon = ({ colKey }) => {
        if (sortKey !== colKey) return <ChevronsUpDown size={12} className="text-slate-300" />;
        return sortDir === "asc" ? (
            <ChevronUp size={12} className="text-primary-600" />
        ) : (
            <ChevronDown size={12} className="text-primary-600" />
        );
    };

    return (
        <>
            <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                        {COLUMNS.map((col) => (
                            <th
                                key={col.key}
                                className={cn(
                                    "select-none whitespace-nowrap px-2 py-1.5 font-medium",
                                    col.sortable && "cursor-pointer transition-colors hover:text-primary-600",
                                    sortKey === col.key && "text-primary-600"
                                )}
                                onClick={() => col.sortable && toggleSort(col.key)}
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
                    {visible.map((r) => (
                        <tr
                            key={r.id}
                            onClick={() => selectRow(r.id)}
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
            {visible.length === 0 && !loading && (
                <div className="py-10 text-center text-sm text-slate-400">
                    {keyword
                        ? "没有匹配的检查单记录，换个关键词试试"
                        : "当前日期暂无检查单记录，可在「航班列表」页为航班创建检查单"}
                </div>
            )}
        </>
    );
}
