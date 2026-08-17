import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import DateFilterPanel from "../../components/ui/DateFilterPanel";
import FlightSearchCard from "../../components/search/FlightSearchCard";
import AddFlightDialog from "./components/AddFlightDialog";
import { manualFipsApi, freshAirCargoApi } from "../../api";
import { FileText, Loader2, Plus, Pencil, Trash2, Leaf, Ban, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import PageLayout from "../../components/layout/PageLayout";

// 可排序列（manual-fips 手动航班）
const SORTABLE_COLUMNS = [
    { key: "flight_no", label: "航班号" },
    { key: "aircraft_type", label: "机型" },
    { key: "stand", label: "停机位" },
    { key: "aldt", label: "落地时间" },
];

/**
 * 航班列表页 —— 手动添加航班（manual-fips 表）
 * - 不再展示 fips 历史假数据
 * - 左侧日期组件下方：添加 / 修改 / 删除 + 标记为生鲜 / 取消生鲜标记
 * - 搜索组件内置「生鲜」Badge：点击切换只展示生鲜航班
 */
export default function FlightSchedulePage() {
    const navigate = useNavigate();
    const [flights, setFlights] = useState([]); // manual-fips 列表（含 is_fresh）
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [freshOnly, setFreshOnly] = useState(false); // 是否只看生鲜航班
    const [selectedId, setSelectedId] = useState(null); // 选中行（供修改/删除/生鲜标记）
    const [addOpen, setAddOpen] = useState(false); // 添加/修改对话框开关
    const [editing, setEditing] = useState(null); // null=新增模式；manual_fips 行=编辑模式

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await manualFipsApi.list();
            setFlights(data.items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // 搜索 + 生鲜筛选过滤
    const filtered = useMemo(() => {
        let list = flights;
        // 生鲜筛选（Badge 选中时只展示标记为生鲜的航班）
        if (freshOnly) list = list.filter((f) => f.is_fresh);
        const kw = keyword.trim().toLowerCase();
        if (!kw) return list;
        return list.filter(
            (f) =>
                f.flight_no?.toLowerCase().includes(kw) ||
                f.aircraft_type?.toLowerCase().includes(kw) ||
                f.stand?.toLowerCase().includes(kw)
        );
    }, [flights, keyword, freshOnly]);

    // 生鲜航班数量（Badge 上显示）
    const freshCount = useMemo(() => flights.filter((f) => f.is_fresh).length, [flights]);

    // 排序
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null); // asc | desc | null
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
            let va = a[sortKey] ?? "";
            let vb = b[sortKey] ?? "";
            if (sortKey === "aldt") {
                va = va ? new Date(va).getTime() : 0;
                vb = vb ? new Date(vb).getTime() : 0;
            } else {
                va = String(va);
                vb = String(vb);
            }
            if (va < vb) return sortDir === "asc" ? -1 : 1;
            if (va > vb) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
        return arr;
    }, [filtered, sortKey, sortDir]);

    const fmtLanding = (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "—");

    // 删除选中的航班
    const handleDelete = async () => {
        if (selectedId == null) return;
        const row = flights.find((f) => f.id === selectedId);
        if (!window.confirm(`确定删除航班 ${row?.flight_no || selectedId} 吗？`)) return;
        try {
            await manualFipsApi.remove(selectedId);
            setSelectedId(null);
            await load();
        } catch (err) {
            alert(`删除失败：${err.message}`);
        }
    };

    // 打开修改对话框（回填选中行）
    const openEdit = () => {
        if (selectedId == null) return;
        const row = flights.find((f) => f.id === selectedId);
        if (!row) return;
        setEditing(row);
        setAddOpen(true);
    };

    // 打开新增对话框
    const openAdd = () => {
        setEditing(null);
        setAddOpen(true);
    };

    // 标记选中的航班为生鲜
    const handleMarkFresh = async () => {
        if (selectedId == null) return;
        const row = flights.find((f) => f.id === selectedId);
        if (!row || row.is_fresh) return;
        try {
            await freshAirCargoApi.mark(selectedId);
            await load();
        } catch (err) {
            alert(`标记失败：${err.message}`);
        }
    };

    // 取消选中航班的生鲜标记
    const handleUnmarkFresh = async () => {
        if (selectedId == null) return;
        const row = flights.find((f) => f.id === selectedId);
        if (!row || !row.is_fresh) return;
        try {
            await freshAirCargoApi.unmark(selectedId);
            await load();
        } catch (err) {
            alert(`取消失败：${err.message}`);
        }
    };

    return (
        <PageLayout
            sidebar={
                <>
                    {/* 左侧：搜索 + 日历 + 操作按钮 */}
                    <FlightSearchCard
                    keyword={keyword}
                    onKeywordChange={setKeyword}
                    matchCount={sorted.length}
                    dataSource="数据源：手动添加航班"
                    onRefresh={load}
                    freshFilter={freshOnly}
                    freshCount={freshCount}
                    onFreshToggle={() => setFreshOnly((v) => !v)}
                />

                <DateFilterPanel />

                {/* 添加 / 修改 / 删除 航班按钮（日期组件下方） */}
                <Card>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <Button size="sm" className="w-full" onClick={openAdd}>
                                <Plus size={14} /> 添加
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                disabled={selectedId == null}
                                onClick={openEdit}
                                title={selectedId == null ? "请先点击表格中的一行选中航班" : "修改选中的航班"}
                            >
                                <Pencil size={14} /> 修改
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                disabled={selectedId == null}
                                onClick={handleDelete}
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
                                disabled={selectedId == null || flights.find((f) => f.id === selectedId)?.is_fresh}
                                onClick={handleMarkFresh}
                                title={
                                    selectedId == null
                                        ? "请先点击表格中的一行选中航班"
                                        : "将选中的航班标记为生鲜货物"
                                }
                            >
                                <Leaf size={14} /> 标记为生鲜
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                disabled={selectedId == null || !flights.find((f) => f.id === selectedId)?.is_fresh}
                                onClick={handleUnmarkFresh}
                                title={
                                    selectedId == null
                                        ? "请先点击表格中的一行选中航班"
                                        : "取消选中的航班的生鲜标记"
                                }
                            >
                                <Ban size={14} /> 取消生鲜标记
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                </>
            }
        >
            {/* 右侧：手动航班表格 */}
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <CardHeader className="shrink-0">
                        <div className="flex items-center gap-3">
                            <CardTitle>
                                航班列表{" "}
                                {sorted.length > 0 && (
                                    <span className="ml-1 text-xs font-normal text-slate-400">
                                        共 {sorted.length} 架
                                    </span>
                                )}
                            </CardTitle>
                            {selectedId != null && (
                                <span className="text-[11px] text-slate-400">
                                    已选中：{flights.find((f) => f.id === selectedId)?.flight_no || ""}
                                    {flights.find((f) => f.id === selectedId)?.is_fresh && (
                                        <span className="ml-1 inline-flex items-center gap-0.5 text-emerald-600">
                                            <Leaf size={11} /> 生鲜
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                        {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
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
                                    {SORTABLE_COLUMNS.map((col) => (
                                        <th
                                            key={col.key}
                                            className={cn(
                                                "cursor-pointer select-none px-4 py-1.5 font-medium transition-colors hover:text-primary-600",
                                                sortKey === col.key && "text-primary-600"
                                            )}
                                            onClick={() => handleSort(col.key)}
                                            title="点击切换排序"
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                {col.label}
                                                <SortIcon colKey={col.key} />
                                            </span>
                                        </th>
                                    ))}
                                    <th className="px-4 py-1.5 font-medium">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((f) => {
                                    const isSelected = selectedId === f.id;
                                    return (
                                        <tr
                                            key={f.id}
                                            onClick={() => setSelectedId(f.id)}
                                            className={cn(
                                                "cursor-pointer border-b border-slate-100 transition-colors hover:bg-primary-50/40",
                                                isSelected && "bg-primary-50/70"
                                            )}
                                        >
                                            <td className="px-4 py-1.5 align-middle">
                                                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                                                    {f.flight_no}
                                                    {f.is_fresh && (
                                                        <Leaf
                                                            size={13}
                                                            className="text-emerald-600"
                                                            title="生鲜货物航班"
                                                        />
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-1.5 align-middle">{f.aircraft_type || "—"}</td>
                                            <td className="px-4 py-1.5 align-middle">{f.stand || "—"}</td>
                                            <td className="px-4 py-1.5 align-middle tabular-nums">
                                                {fmtLanding(f.aldt || f.landing_time)}
                                            </td>
                                            <td className="px-4 py-1.5 align-middle">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/checklist/manual-${f.id}`);
                                                    }}
                                                >
                                                    <FileText size={14} /> 创建检查表
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {sorted.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                                            {keyword
                                                ? "没有匹配的航班，换个关键词试试"
                                                : "暂无手动添加的航班，点击左侧「添加航班」录入"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
            </Card>

            {/* 添加 / 修改航班对话框 */}
            <AddFlightDialog
                open={addOpen}
                initial={editing}
                onClose={() => {
                    setAddOpen(false);
                    setEditing(null);
                }}
                onSaved={load}
            />
        </PageLayout>
    );
}
