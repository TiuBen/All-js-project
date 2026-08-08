import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { useDateStore } from "../../store/tabsStore";
import { useFlightsStore } from "../../store/flightsStore";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Badge, statusVariant, flightTypeVariant } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import DateFilterPanel from "../../components/ui/DateFilterPanel";
import FlightSearchCard from "../../components/search/FlightSearchCard";
import { fipsApi } from "../../api";
import {
    FileText,
    RefreshCw,
    Loader2,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    LayoutList,
    ArrowLeftRight,
    ArrowRightLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

// 单表可排序列
const SORTABLE_COLUMNS = [
    { key: "flightNo", label: "航班号" },
    { key: "origin", label: "始发地" },
    { key: "departureTimeUtc", label: "起飞时间" },
    { key: "destination", label: "目的地" },
    { key: "landingTimeUtc", label: "降落时间" },
    { key: "status", label: "状态" },
    { key: "flightType", label: "类型" },
];

// 双表各自可排序列（离港按起飞，进港按落地）
const DEP_COLUMNS = [
    { key: "flightNo", label: "航班号" },
    { key: "destination", label: "目的地" },
    { key: "departureTimeUtc", label: "起飞时间" },
    { key: "aircraftType", label: "机型" },
    { key: "status", label: "状态" },
];
const ARR_COLUMNS = [
    { key: "flightNo", label: "航班号" },
    { key: "origin", label: "始发地" },
    { key: "landingTimeUtc", label: "落地时间" },
    { key: "aircraftType", label: "机型" },
    { key: "status", label: "状态" },
];

// fips 字段中英文标签（详情 Dialog 用）
const FIPS_FIELD_LABELS = [
    ["id", "主键 ID"],
    ["task", "任务"],
    ["flight_no", "航班号"],
    ["origin_station", "起飞站（ICAO）"],
    ["dest_station", "目的站（ICAO）"],
    ["landing_station", "落地站（ICAO）"],
    ["in_out_time", "进/出时间"],
    ["sobt", "计划起飞（SOBT）"],
    ["eobt", "预计起飞（EOBT）"],
    ["atot", "实际起飞（ATOT）"],
    ["sibt", "预计过走廊口（SIBT）"],
    ["eldt", "预计落地（ELDT）"],
    ["aldt", "实际落地（ALDT）"],
    ["corridor", "走廊口"],
    ["runway", "跑道"],
    ["stand", "停机位"],
    ["aircraft_type", "机型"],
    ["source_file", "源文件"],
    ["source_date", "源日期"],
    ["mapped_date", "映射日期"],
];

export default function FlightSchedulePage() {
    const navigate = useNavigate();
    const { mode, selectedDate, rangeFrom, rangeTo, setMode, setSelectedDate, setRange } = useDateStore();
    const { flights, loading, error, total, dataDate, fetchFlights } = useFlightsStore();

    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null); // asc | desc | null
    const [keyword, setKeyword] = useState("");
    // 视图三态循环：'all' 单表 / 'in-left' 进港左、离港右 / 'out-left' 离港左、进港右
    const [viewMode, setViewMode] = useState("all");
    // fips 详情 Dialog
    const [detail, setDetail] = useState({ open: false, fipsId: null, data: null, loading: false });

    useEffect(() => {
        if (mode === "single") {
            fetchFlights({ date: selectedDate });
        } else {
            fetchFlights({ from: rangeFrom, to: rangeTo });
        }
    }, [mode, selectedDate, rangeFrom, rangeTo]);

    // 三态循环：all → in-left → out-left → all
    const cycleViewMode = () => {
        setViewMode((m) => (m === "all" ? "in-left" : m === "in-left" ? "out-left" : "all"));
    };
    const viewModeMeta = {
        all: { label: "全部航班", icon: LayoutList, tip: "切换为：进港左 / 离港右" },
        "in-left": { label: "进港左/离港右", icon: ArrowLeftRight, tip: "切换为：离港左 / 进港右" },
        "out-left": { label: "离港左/进港右", icon: ArrowRightLeft, tip: "切换为：全部航班（单表）" },
    };
    const ViewIcon = viewModeMeta[viewMode].icon;

    // 表头点击排序（共用：三表都生效）
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

    // 搜索过滤
    const filtered = useMemo(() => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return flights;
        return flights.filter(
            (f) =>
                f.flightNo?.toLowerCase().includes(kw) ||
                f.origin?.toLowerCase().includes(kw) ||
                f.destination?.toLowerCase().includes(kw) ||
                f.aircraftType?.toLowerCase().includes(kw) ||
                f.flightType?.toLowerCase().includes(kw)
        );
    }, [flights, keyword]);

    // 排序（按当前列应用到所有表）
    const sortFlights = (list) => {
        if (!sortKey || !sortDir) return list;
        const arr = [...list];
        arr.sort((a, b) => {
            let va = a[sortKey] ?? "";
            let vb = b[sortKey] ?? "";
            if (sortKey === "departureTimeUtc" || sortKey === "landingTimeUtc") {
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
    };
    const sorted = useMemo(() => sortFlights(filtered), [filtered, sortKey, sortDir]);

    const fmtTime = (iso) => (iso ? dayjs(iso).format("HH:mm") : "—");

    const handleRefresh = () => {
        if (mode === "single") {
            fetchFlights({ date: selectedDate });
        } else {
            fetchFlights({ from: rangeFrom, to: rangeTo });
        }
    };

    // 双击航班号 → 打开详情 Dialog
    const openDetail = async (flightId) => {
        const num = String(flightId).replace(/^fips-/, "");
        setDetail({ open: true, fipsId: num, data: null, loading: true });
        try {
            const data = await fipsApi.getById(num);
            setDetail({ open: true, fipsId: num, data, loading: false });
        } catch (err) {
            setDetail({ open: true, fipsId: num, data: null, loading: false, error: err.message });
        }
    };
    const closeDetail = () => setDetail({ open: false, fipsId: null, data: null, loading: false });

    // 双表格行渲染辅助
    const renderSplitRow = (f, type) => (
        <tr
            key={f.id}
            className={cn(
                "cursor-pointer border-b border-slate-100 transition-colors",
                type === "离港" ? "hover:bg-amber-50/40" : "hover:bg-sky-50/40"
            )}
            onClick={() => navigate(`/checklist/${f.id}`)}
            onDoubleClick={(e) => {
                e.stopPropagation();
                openDetail(f.id);
            }}
        >
            <td className="px-3 py-1.5 align-middle" title="双击查看 fips 详情">
                <span className="inline-flex items-center gap-1.5">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-normal leading-none text-slate-500">
                        {f.category === "客运航班" ? "客" : "货"}
                    </span>
                    <span className="font-semibold text-slate-800">{f.flightNo}</span>
                </span>
            </td>
            <td className="px-3 py-1.5 align-middle">{type === "离港" ? f.destination : f.origin}</td>
            <td className="px-3 py-1.5 align-middle tabular-nums">
                {fmtTime(type === "离港" ? f.departureTimeUtc : f.landingTimeUtc)}
            </td>
            <td className="px-3 py-1.5 align-middle">{f.aircraftType}</td>
            <td className="px-3 py-1.5 align-middle">
                <Badge variant={statusVariant(f.status)}>{f.status}</Badge>
            </td>
        </tr>
    );

    // 双表列头渲染辅助
    const renderSplitHeader = (cols) => (
        <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-slate-200 text-left text-[11px] text-slate-500">
                {cols.map((col) => (
                    <th
                        key={col.key}
                        className={cn(
                            "cursor-pointer select-none px-3 py-1.5 font-medium transition-colors hover:text-primary-600",
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
            </tr>
        </thead>
    );

    // 左/右表配置
    const splitConfig = {
        "in-left": {
            left: { type: "进港", columns: ARR_COLUMNS, accent: "sky" },
            right: { type: "离港", columns: DEP_COLUMNS, accent: "amber" },
        },
        "out-left": {
            left: { type: "离港", columns: DEP_COLUMNS, accent: "amber" },
            right: { type: "进港", columns: ARR_COLUMNS, accent: "sky" },
        },
    };

    return (
        // 页面区域固定视口高度（不产生 body 滚动）：
        // 需减去 顶部导航 h-16(64px) + main 的 py-6 上下内边距(48px) = 112px
        <div className="flex h-[calc(100vh-90px)] gap-2 overflow-hidden">
            {/* 左侧：搜索 + 日历 —— 宽度 360px（DayPicker 单元格 44px×7=308px + 内边距），自然高度 */}
            <div className="flex w-[360px] shrink-0 flex-col gap-3 overflow-y-auto">
                {/* 公共：航班搜索卡片 */}
                <FlightSearchCard
                    keyword={keyword}
                    onKeywordChange={setKeyword}
                    matchCount={sorted.length}
                    dataSource={dataDate ? `数据源：fips 历史航班（${dataDate}）` : "数据源：fips 历史航班"}
                    onRefresh={handleRefresh}
                />

                {/* 公共：日期选择卡片 */}
                <DateFilterPanel
                    notice={
                        dataDate && selectedDate !== dataDate && mode === "single"
                            ? `ℹ ${selectedDate} 无航班数据，已展示最近一天（${dataDate}）`
                            : undefined
                    }
                />
            </div>

            {/* 右侧：航班表格（占满剩余空间） */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
                            {/* 三态循环切换按钮 */}
                            <Button
                                size="sm"
                                variant={viewMode === "all" ? "outline" : "default"}
                                onClick={cycleViewMode}
                                title={viewModeMeta[viewMode].tip}
                            >
                                <ViewIcon size={14} />
                                <span className="hidden sm:inline">{viewModeMeta[viewMode].label}</span>
                            </Button>
                        </div>
                        {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
                    </CardHeader>

                    {/* 表格区域：占满剩余高度 */}
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        {viewMode === "all" ? (
                            /* ===== 全部航班（单表） ===== */
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
                                        {sorted.map((f) => (
                                            <tr
                                                key={f.id}
                                                className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                                            >
                                                <td
                                                    className="cursor-pointer select-none px-4 py-1.5 align-middle"
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        openDetail(f.id);
                                                    }}
                                                    title="双击查看 fips 详情"
                                                >
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-normal leading-none text-slate-500">
                                                            {f.category === "客运航班" ? "客" : "货"}
                                                        </span>
                                                        <span className="font-semibold">{f.flightNo}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-1.5 align-middle">{f.origin}</td>
                                                <td className="px-4 py-1.5 align-middle tabular-nums">
                                                    {fmtTime(f.departureTimeUtc)}
                                                </td>
                                                <td className="px-4 py-1.5 align-middle">{f.destination}</td>
                                                <td className="px-4 py-1.5 align-middle tabular-nums">
                                                    {fmtTime(f.landingTimeUtc)}
                                                </td>
                                                <td className="px-4 py-1.5 align-middle">
                                                    <Badge variant={statusVariant(f.status)}>{f.status}</Badge>
                                                </td>
                                                <td className="px-4 py-1.5 align-middle">
                                                    <Badge variant={flightTypeVariant(f.flightType)}>
                                                        {f.flightType}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-1.5 align-middle">
                                                    {f.hasChecklist ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/checklist/${f.id}`);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                                        >
                                                            <FileText size={14} /> 查看检查单
                                                        </button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/checklist/${f.id}`);
                                                            }}
                                                        >
                                                            创建检查表
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {sorted.length === 0 && !loading && (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="px-4 py-10 text-center text-sm text-slate-400"
                                                >
                                                    {keyword
                                                        ? "没有匹配的航班，换个关键词试试"
                                                        : "暂无航班数据，请选择其他日期（历史数据在 2026-04 ~ 2026-07）"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* ===== 双表（进港 / 离港） ===== */
                            <div className="grid min-h-0 flex-1 gap-3 overflow-hidden p-3 xl:grid-cols-2">
                                {["left", "right"].map((side) => {
                                    const cfg = splitConfig[viewMode][side];
                                    const rows = sorted.filter((f) => f.direction === cfg.type);
                                    const Icon =
                                        side === "left"
                                            ? viewMode === "in-left"
                                                ? ArrowLeftRight
                                                : ArrowRightLeft
                                            : viewMode === "in-left"
                                            ? ArrowRightLeft
                                            : ArrowLeftRight;
                                    const sortedRows = sortFlights(rows);
                                    return (
                                        <div
                                            key={side}
                                            className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200"
                                        >
                                            <div
                                                className={cn(
                                                    "flex items-center justify-between border-b border-slate-200 px-3 py-2",
                                                    cfg.accent === "sky" ? "bg-sky-50/60" : "bg-amber-50/60"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "text-xs font-semibold",
                                                        cfg.accent === "sky" ? "text-sky-700" : "text-amber-700"
                                                    )}
                                                >
                                                    {cfg.accent === "sky" ? "🛬" : "✈"} {cfg.type}航班
                                                    <span className="ml-1 text-[10px] font-normal text-slate-500">
                                                        （{cfg.accent === "sky" ? "抵达鄂州" : "鄂州起飞"}）
                                                    </span>
                                                </span>
                                                <span className="text-[11px] text-slate-400">{rows.length} 架</span>
                                            </div>
                                            <div className="min-h-0 flex-1 overflow-auto">
                                                <table className="w-full text-sm">
                                                    {renderSplitHeader(cfg.columns)}
                                                    <tbody>
                                                        {sortedRows.map((f) => renderSplitRow(f, cfg.type))}
                                                        {rows.length === 0 && (
                                                            <tr>
                                                                <td
                                                                    colSpan={cfg.columns.length}
                                                                    className="px-3 py-8 text-center text-xs text-slate-400"
                                                                >
                                                                    暂无{cfg.type}航班
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* ===== fips 详情 Dialog ===== */}
            {detail.open && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4"
                    onClick={closeDetail}
                    onKeyDown={(e) => e.key === "Escape" && closeDetail()}
                >
                    <div
                        className="relative max-h-[88vh] w-[760px] max-w-full overflow-hidden rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Dialog 头部 */}
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
                            <div>
                                <div className="text-base font-bold text-slate-800">
                                    {detail.data?.flight_no || "..."} · fips 详情
                                </div>
                                <div className="mt-0.5 text-xs text-slate-500">
                                    ID #{detail.fipsId} · 来源 {detail.data?.source_file} · 映射日期{" "}
                                    {detail.data?.mapped_date}
                                </div>
                            </div>
                            <button
                                onClick={closeDetail}
                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {/* Dialog 内容 */}
                        <div className="max-h-[72vh] overflow-auto px-5 py-4">
                            {detail.loading && (
                                <div className="flex items-center justify-center py-12 text-slate-400">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span className="ml-2">加载中…</span>
                                </div>
                            )}
                            {detail.error && (
                                <div className="rounded bg-red-50 px-3 py-1.5 text-sm text-red-600">
                                    加载失败：{detail.error}
                                </div>
                            )}
                            {detail.data && (
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    {FIPS_FIELD_LABELS.map(([k, label]) => (
                                        <div key={k} className="flex border-b border-slate-100 py-1.5">
                                            <div className="w-44 shrink-0 text-xs text-slate-500">{label}</div>
                                            <div className="flex-1 break-all text-xs font-medium text-slate-800">
                                                {detail.data[k] ?? <span className="text-slate-300">—</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
