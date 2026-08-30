import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import AddFlightDialog from "./components/AddFlightDialog";
import Sidebar from "./components/Sidebar";
import { freshAirCargoApi } from "../../api";
import { useManualFipsStore } from "../../store/manualFipsStore";
import { useDateFilterParams } from "../../components/ui/DateFilterPanel";
import {
    FileText,
    Loader2,
    Leaf,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    LayoutList,
    ArrowLeftRight,
    ArrowRightLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import ContentLayout from "../../components/layout/ContentLayout";

// 单表（全部航班）列定义
const SINGLE_COLUMNS = [
    { key: "task", label: "任务性质" },
    { key: "flight_no", label: "航班号" },
    { key: "origin_station", label: "起飞机场" },
    { key: "dest_station", label: "目的地机场" },
    { key: "landing_station", label: "落地机场" },
    { key: "sobt", label: "SOBT" },
    { key: "eobt", label: "EOBT" },
    { key: "atot", label: "ATOT" },
    { key: "sibt", label: "SIBT" },
    { key: "eldt", label: "ELDT" },
    { key: "aldt", label: "ALDT" },
    { key: "runway", label: "跑道" },
    { key: "stand", label: "停机位" },
    { key: "aircraft_type", label: "机型" },
];

// 时间列（展示取 HH:mm / 排序按时间戳）
const TIME_KEYS = ["sobt", "eobt", "atot", "sibt", "eldt", "aldt"];

// 双表列：进港（落地机场=ZHEC）不显示落地机场；离港（起飞机场=ZHEC）不显示起飞机场
const ARR_COLUMNS = SINGLE_COLUMNS.filter((c) => c.key !== "landing_station");
const DEP_COLUMNS = SINGLE_COLUMNS.filter((c) => c.key !== "origin_station");

// 本场机场（进/离港判断依据）
const BASE_AIRPORT = "ZHEC";

// 进/离港归类：进港 = 落地机场（landing_station，缺省用目的地 dest_station）是 ZHEC；离港 = 起飞机场是 ZHEC
const isDep = (f) => String(f.origin_station || "").toUpperCase() === BASE_AIRPORT;
const isArr = (f) => String(f.landing_station || f.dest_station || "").toUpperCase() === BASE_AIRPORT;

/**
 * 航班列表页 —— 手动添加航班（manual-fips 表）
 * - 数据源：manualFipsStore（manual_fips 表）
 * - 日期筛选：按「创建手动航班的日期」（createdDate 本地日），左侧日期控件选择
 * - 视图三态：全部（单表）/ 进港左离港右 / 离港左进港右
 * - 左侧：搜索 + 日期 + 添加/修改/删除 + 生鲜标记
 */
export default function FlightSchedulePage() {
    const navigate = useNavigate();
    const { flights, loading, error, fetchFlights } = useManualFipsStore();
    // 日期筛选参数（左侧 DateFilterPanel 全局状态：{date} 或 {from,to}）
    const dateParams = useDateFilterParams();

    const [keyword, setKeyword] = useState("");
    const [freshOnly, setFreshOnly] = useState(false); // 是否只看生鲜航班
    const [selectedId, setSelectedId] = useState(null); // 选中行（供修改/删除/生鲜标记）
    const [addOpen, setAddOpen] = useState(false); // 添加/修改对话框开关
    const [editing, setEditing] = useState(null); // null=新增模式；manual_fips 行=编辑模式
    // 视图三态循环：'all' 单表 / 'in-left' 进港左、离港右 / 'out-left' 离港左、进港右
    const [viewMode, setViewMode] = useState("all");

    useEffect(() => {
        fetchFlights();
    }, [fetchFlights]);

    // 日期变更后清空选中行：换了日期再显示上一个日期的航班号是不对的
    useEffect(() => {
        setSelectedId(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateParams.date, dateParams.from, dateParams.to]);

    // 按创建日期过滤（store 提供；无日期的航班始终展示）
    const byDate = useMemo(() => {
        try {
            return dateParams && (dateParams.date || dateParams.from)
                ? useManualFipsStore.getState().filterByDate(dateParams)
                : flights;
        } catch {
            return flights;
        }
    }, [flights, dateParams]);

    // 搜索 + 生鲜筛选过滤
    const filtered = useMemo(() => {
        let list = byDate;
        if (freshOnly) list = list.filter((f) => f.is_fresh);
        const kw = keyword.trim().toLowerCase();
        if (!kw) return list;
        return list.filter(
            (f) =>
                f.flight_no?.toLowerCase().includes(kw) ||
                f.aircraft_type?.toLowerCase().includes(kw) ||
                f.stand?.toLowerCase().includes(kw)
        );
    }, [byDate, keyword, freshOnly]);

    // 生鲜航班数量（Badge 上显示，全量统计）
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
            if (TIME_KEYS.includes(sortKey)) {
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

    const fmtTime = (t) => {
        if (!t) return "—";
        const m = String(t).match(/(\d{1,2}:\d{2})$/); // 兼容 HH:mm 与完整 datetime
        return m ? m[1] : String(t);
    };

    // 视图三态元信息（循环切换）
    const viewModeMeta = {
        all: { label: "全部航班", icon: LayoutList, tip: "切换为：进港左 / 离港右" },
        "in-left": { label: "进港左/离港右", icon: ArrowLeftRight, tip: "切换为：离港左 / 进港右" },
        "out-left": { label: "离港左/进港右", icon: ArrowRightLeft, tip: "切换为：全部航班（单表）" },
    };
    const ViewIcon = viewModeMeta[viewMode].icon;
    const cycleView = () => setViewMode((m) => (m === "all" ? "in-left" : m === "in-left" ? "out-left" : "all"));

    // 双表数据（视图切换时计算一次）
    const depList = useMemo(() => sorted.filter(isDep), [sorted]);
    const arrList = useMemo(() => sorted.filter(isArr), [sorted]);

    // 删除选中的航班
    const handleDelete = async () => {
        if (selectedId == null) return;
        const row = flights.find((f) => f.id === selectedId);
        if (!window.confirm(`确定删除航班 ${row?.flight_no || selectedId} 吗？`)) return;
        try {
            await freshAirCargoApi.unmark(selectedId).catch(() => {});
            await useManualFipsStore.getState().removeFlight(selectedId);
            setSelectedId(null);
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
            await fetchFlights();
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
            await fetchFlights();
        } catch (err) {
            alert(`取消失败：${err.message}`);
        }
    };

    // 单元格渲染（按列 key）
    const renderCell = (f, col) => {
        if (col.key === "flight_no") {
            return (
                <span className="inline-flex items-center gap-1.5 font-semibold ">
                    {f.flight_no}
                    {f.is_fresh && <Leaf size={13} className="text-emerald-600" title="生鲜货物航班" />}
                </span>
            );
        }
        if (TIME_KEYS.includes(col.key)) {
            return <span className="tabular-nums">{fmtTime(f[col.key])}</span>;
        }
        return f[col.key] || "—";
    };

    // 行渲染（列配置驱动：单表/双表通用）
    const renderRow = (f, cols, accent) => {
        const isSelected = selectedId === f.id;
        return (
            <tr
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className={cn(
                    "cursor-pointer border-b border-slate-100 transition-colors",
                    accent === "sky" && "hover:bg-sky-50/40",
                    accent === "amber" && "hover:bg-amber-50/40",
                    !accent && "hover:bg-primary-50/40",
                    // 选中行：深蓝色背景 + 白字（覆盖 hover）
                    isSelected && "text-primary-600  hover:bg-primary-50/40"
                )}
            >
                {cols.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-3 py-1.5 align-middle">
                        {renderCell(f, col)}
                    </td>
                ))}
                <td className="whitespace-nowrap px-3 py-1.5 align-middle">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/checklist/manual-${f.id}`);
                        }}
                    >
                        <FileText size={13} /> 创建检查表
                    </Button>
                </td>
            </tr>
        );
    };

    // 列头（列配置驱动：单表/双表通用；accent 控制主题色）
    const renderHeader = (cols, accent) => (
        <thead className="sticky top-0 z-10 bg-slate-50">
            <tr
                className={cn(
                    "border-b text-left text-xs",
                    accent === "sky"
                        ? "border-sky-100 text-sky-700"
                        : accent === "amber"
                        ? "border-amber-100 text-amber-700"
                        : "border-slate-200 text-slate-500"
                )}
            >
                {cols.map((col) => (
                    <th
                        key={col.key}
                        className={cn(
                            "cursor-pointer select-none whitespace-nowrap px-2 py-1.5 font-medium transition-colors hover:text-primary-600",
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
                <th className="whitespace-nowrap px-2 py-1.5 font-medium">操作</th>
            </tr>
        </thead>
    );

    // 空状态
    const renderEmpty = (msg) => (
        <tr>
            <td colSpan={SINGLE_COLUMNS.length + 1} className="px-4 py-8 text-center text-sm text-slate-400">
                {msg}
            </td>
        </tr>
    );

    return (
        <ContentLayout
            sidebar={
                <Sidebar
                    keyword={keyword}
                    onKeywordChange={setKeyword}
                    matchCount={sorted.length}
                    onRefresh={fetchFlights}
                    freshFilter={freshOnly}
                    freshCount={freshCount}
                    onFreshToggle={() => setFreshOnly((v) => !v)}
                    selectedId={selectedId}
                    flights={flights}
                    onAdd={openAdd}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onMarkFresh={handleMarkFresh}
                    onUnmarkFresh={handleUnmarkFresh}
                />
            }
        >
            {/* 右侧：手动航班表格 */}
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <CardHeader className="shrink-0">
                    <div className="flex items-center gap-3">
                        <CardTitle>
                            航班列表{" "}
                            {sorted.length > 0 && (
                                <span className="ml-1 text-xs font-normal text-slate-400">共 {sorted.length} 架</span>
                            )}
                        </CardTitle>
                        {selectedId != null && (
                            <span className="text-lg text-green-700 font-semibold">
                                已选中：{flights.find((f) => f.id === selectedId)?.flight_no || ""}
                                {flights.find((f) => f.id === selectedId)?.is_fresh && (
                                    <span className="ml-1 inline-flex items-center gap-0.5 text-emerald-600">
                                        <Leaf size={11} /> 生鲜
                                    </span>
                                )}
                            </span>
                        )}
                        {/* 视图三态切换：全部 / 进港左离港右 / 离港左进港右 */}
                        <button
                            onClick={cycleView}
                            className="ml-auto flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                            title={viewModeMeta[viewMode].tip}
                        >
                            <ViewIcon size={13} /> {viewModeMeta[viewMode].label}
                        </button>
                    </div>
                    {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
                </CardHeader>

                {error && (
                    <div className="mx-3 mt-1 rounded bg-red-50 px-3 py-1.5 text-xs text-red-600">
                        加载失败：{error}
                    </div>
                )}

                {viewMode === "all" ? (
                    /* ===== 全部航班（单表） ===== */
                    <div className="min-h-0 flex-1 overflow-auto">
                        <table className="w-full text-sm">
                            {renderHeader(SINGLE_COLUMNS)}
                            <tbody>{sorted.map((f) => renderRow(f, SINGLE_COLUMNS))}</tbody>
                        </table>
                        {sorted.length === 0 && !loading && (
                            <div className="py-10 text-center text-sm text-slate-400">
                                {keyword
                                    ? "没有匹配的航班，换个关键词试试"
                                    : "所选日期暂无手动添加的航班，点击左侧「添加航班」录入"}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ===== 进/离港双表 ===== */
                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden p-2 lg:grid-cols-2">
                        {/* 左表 */}
                        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200">
                            <div
                                className={cn(
                                    "shrink-0 border-b px-3 py-1.5 text-xs font-semibold",
                                    viewMode === "in-left" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"
                                )}
                            >
                                {viewMode === "in-left" ? "进港航班" : "离港航班"}（
                                {viewMode === "in-left" ? arrList.length : depList.length}）
                            </div>
                            <div className="min-h-0 flex-1 overflow-auto">
                                <table className="w-full text-sm">
                                    {renderHeader(
                                        viewMode === "in-left" ? ARR_COLUMNS : DEP_COLUMNS,
                                        viewMode === "in-left" ? "sky" : "amber"
                                    )}
                                    <tbody>
                                        {(viewMode === "in-left" ? arrList : depList).map((f) =>
                                            renderRow(
                                                f,
                                                viewMode === "in-left" ? ARR_COLUMNS : DEP_COLUMNS,
                                                viewMode === "in-left" ? "sky" : "amber"
                                            )
                                        )}
                                        {(viewMode === "in-left" ? arrList : depList).length === 0 &&
                                            !loading &&
                                            renderEmpty("无航班")}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* 右表 */}
                        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200">
                            <div
                                className={cn(
                                    "shrink-0 border-b px-3 py-1.5 text-xs font-semibold",
                                    viewMode === "in-left" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"
                                )}
                            >
                                {viewMode === "in-left" ? "离港航班" : "进港航班"}（
                                {viewMode === "in-left" ? depList.length : arrList.length}）
                            </div>
                            <div className="min-h-0 flex-1 overflow-auto">
                                <table className="w-full text-sm">
                                    {renderHeader(
                                        viewMode === "in-left" ? DEP_COLUMNS : ARR_COLUMNS,
                                        viewMode === "in-left" ? "amber" : "sky"
                                    )}
                                    <tbody>
                                        {(viewMode === "in-left" ? depList : arrList).map((f) =>
                                            renderRow(
                                                f,
                                                viewMode === "in-left" ? DEP_COLUMNS : ARR_COLUMNS,
                                                viewMode === "in-left" ? "amber" : "sky"
                                            )
                                        )}
                                        {(viewMode === "in-left" ? depList : arrList).length === 0 &&
                                            !loading &&
                                            renderEmpty("无航班")}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* 添加 / 修改航班对话框 */}
            <AddFlightDialog
                open={addOpen}
                initial={editing}
                onClose={() => {
                    setAddOpen(false);
                    setEditing(null);
                }}
                onSaved={fetchFlights}
            />
        </ContentLayout>
    );
}
