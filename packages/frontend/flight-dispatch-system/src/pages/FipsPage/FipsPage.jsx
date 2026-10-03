import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import AddFlightDialog from "./components/AddFlightDialog";
import Sidebar from "./components/Sidebar";
import { ColumnFilterBar, ColumnToggle } from "./components/ColumnFilter";
import { freshAirCargoApi } from "../../api";
import { useFipsStore, pickRenderColumns, TIME_KEYS } from "../../store/fips.store";
import { shortCutTooltip } from "../../utils/shortCutFullNameTooltip";
import { useFlightStore, FLIGHT_SOURCE_LABEL, IS_READONLY_SOURCE, READONLY_HINT } from "../../store/flightSource";
import { useChecklistStore } from "../../store/checklistStore";
import { useDateFilterParams } from "../../store/appStore";
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
import ContentLayout from "../../Layout/ContentLayout";

// 列定义（中文名 / 默认顺序 / 是否隐藏）统一收在 store/fips.store.js：
//   BASE_COLUMNS        —— 全部航班的列，也是默认 colOrder 的唯一来源
//   BASE_COLUMNS_BY_VIEW—— all / in / out 三种表各自的列（进港去落地机场、离港去起飞机场）
//   tableHeaders[view]  —— 用户在「表头筛选」里确认过的配置（落 localStorage）
// 本页只负责「按配置渲染」，不再自带一份列清单；TIME_KEYS 也从 store 引入。

// 本场机场（进/离港判断依据）
const BASE_AIRPORT = "ZHEC";

// 本场四字码 → 显示名
// （manual_fips / fips 数据源存四字码；ecyilang 快照的远端存中文城市名，
//   本场仍统一输出 ZHEC 以便 isDep/isArr 判断，展示时在这里换成中文。）
const STATION_LABEL = { ZHEC: "鄂州" };

// 进/离港归类：进港 = 落地机场（landing_station，缺省用目的地 dest_station）是 ZHEC；离港 = 起飞机场是 ZHEC
const isDep = (f) => String(f.origin_station || "").toUpperCase() === BASE_AIRPORT;
const isArr = (f) => String(f.landing_station || f.dest_station || "").toUpperCase() === BASE_AIRPORT;

// 视图三态：全部（单表）→ 进港左离港右 → 离港左进港右 → 全部，按钮按此环循环。
// VIEW_CYCLE 描述「当前态 → 下一态」，切换按钮展示的是**下一态**（按下之后会进入什么），
// 而不是当前处在哪一态 —— 按钮是动作，不是状态标签。
const VIEW_CYCLE = { all: "in-left", "in-left": "out-left", "out-left": "all" };

// 三态元信息（名称 + 图标），键与 VIEW_CYCLE 一致
const VIEW_META = {
    all: { label: "全部航班", icon: LayoutList },
    "in-left": { label: "进港左 / 离港右", icon: ArrowLeftRight },
    "out-left": { label: "离港左 / 进港右", icon: ArrowRightLeft },
};

/**
 * 航班列表页 —— 航班计划 / 手动添加航班
 * - 数据源：由构建模式决定（见 store/flightSource.js）
 *     pnpm dev / build  → manual_fips 表（手动添加航班，可增删改）
 *     pnpm testWW       → ecyilang 表（后端航班计划快照，只读）
 *   页面本身不关心具体是哪个源，只消费 useFlightStore。
 * - 日期筛选：按「航班日期」（createdDate 本地日），左侧日期控件选择
 * - 视图三态：全部（单表）/ 进港左离港右 / 离港左进港右
 * - 左侧：搜索 + 日期 +（可写源才有）添加/修改/删除 + 生鲜标记
 */
export default function FipsPage() {
    const navigate = useNavigate();
    const { flights, loading, error, fetchFlights } = useFlightStore();
    // 日期筛选参数（左侧 Calendar 全局状态：{date} 或 {from,to}）
    const dateParams = useDateFilterParams();

    const [keyword, setKeyword] = useState("");
    const [freshOnly, setFreshOnly] = useState(false); // 是否只看生鲜航班
    const [selectedId, setSelectedId] = useState(null); // 选中行（供修改/删除/生鲜标记）
    const [addOpen, setAddOpen] = useState(false); // 添加/修改对话框开关
    const [editing, setEditing] = useState(null); // null=新增模式；manual_fips 行=编辑模式
    // 视图三态循环：'all' 单表 / 'in-left' 进港左、离港右 / 'out-left' 离港左、进港右
    const [viewMode, setViewMode] = useState("all");

    // ---- 表头配置（列的显示 / 顺序）----
    // tableHeaders = 生效配置（已落 localStorage）；draftHeaders = 编辑草稿（只在编辑态有）
    const tableHeaders = useFipsStore((s) => s.tableHeaders);
    const editingView = useFipsStore((s) => s.editingView);
    const draftHeaders = useFipsStore((s) => s.draftHeaders);
    // 取某张表当前要渲染的列：编辑态 → 草稿全套（含已隐藏的列，供勾选回来）；
    // 非编辑态 → 按 colOrder 排序并过滤掉 isHide 的列。
    const columnsOf = useMemo(
        () => (view) => pickRenderColumns({ tableHeaders, editingView, draftHeaders }, view),
        [tableHeaders, editingView, draftHeaders],
    );

    useEffect(() => {
        // 后端未启动时请求失败 → store 已写 error 态（页面展示提示），这里只兜住未处理 rejection
        fetchFlights().catch(() => {});
    }, [fetchFlights]);

    // 日期变更后清空选中行：换了日期再显示上一个日期的航班号是不对的
    useEffect(() => {
        setSelectedId(null);
    }, [dateParams.date, dateParams.from, dateParams.to]);

    // 切换视图时退出表头编辑态：否则正在编辑的那张表可能被切走（勾选框与「确认」都跟着消失），
    // 草稿会一直挂着。编辑中切视图 = 放弃本次修改。
    useEffect(() => {
        useFipsStore.getState().cancelEdit();
    }, [viewMode]);

    // 按航班日期过滤（store 提供；无日期的航班始终展示）
    const byDate = useMemo(() => {
        try {
            return dateParams && (dateParams.date || dateParams.from)
                ? useFlightStore.getState().filterByDate(dateParams)
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

    // 视图切换按钮：显示的都是「下一态」——图标与文字都取 VIEW_CYCLE[viewMode]
    const nextView = VIEW_CYCLE[viewMode];
    const NextViewIcon = VIEW_META[nextView].icon;
    const cycleView = () => setViewMode(nextView);

    // 双表数据（视图切换时计算一次）
    const depList = useMemo(() => sorted.filter(isDep), [sorted]);
    const arrList = useMemo(() => sorted.filter(isArr), [sorted]);

    // 三张表实际渲染的列（一次算好，表头与数据行共用同一份，避免两侧不一致）
    const colsByView = { all: columnsOf("all"), in: columnsOf("in"), out: columnsOf("out") };
    // 双表模式下左 / 右两张表分别是哪个视图（'in-left' 时 左=进港、右=离港）
    const leftView = viewMode === "in-left" ? "in" : "out";
    const rightView = viewMode === "in-left" ? "out" : "in";
    // 视图 → 数据行
    const listByView = { in: arrList, out: depList };

    // 删除选中的航班（只读数据源不可用）
    const handleDelete = async () => {
        if (IS_READONLY_SOURCE) return alert(READONLY_HINT);
        if (selectedId == null) return;
        const row = flights.find((f) => f.id === selectedId);
        if (!window.confirm(`确定删除航班 ${row?.flight_no || selectedId} 吗？`)) return;
        try {
            // 生鲜标记按「来源表 + 行 UUID」定位，手动航班传 row.uuid（不是自增 id）
            if (row?.uuid) await freshAirCargoApi.unmark(row.uuid).catch(() => {});
            await useFlightStore.getState().removeFlight(selectedId);
            setSelectedId(null);
        } catch (err) {
            alert(`删除失败：${err.message}`);
        }
    };

    // 打开修改对话框（回填选中行；只读数据源不可用）
    const openEdit = () => {
        if (IS_READONLY_SOURCE) return alert(READONLY_HINT);
        if (selectedId == null) return;
        const row = flights.find((f) => f.id === selectedId);
        if (!row) return;
        setEditing(row);
        setAddOpen(true);
    };

    // 打开新增对话框（只读数据源不可用）
    const openAdd = () => {
        if (IS_READONLY_SOURCE) return alert(READONLY_HINT);
        setEditing(null);
        setAddOpen(true);
    };

    // 标记选中的航班为生鲜（只读数据源不可用）
    const handleMarkFresh = async () => {
        if (IS_READONLY_SOURCE) return alert(READONLY_HINT);
        if (selectedId == null) return;
        const row = flights.find((f) => f.id === selectedId);
        if (!row || row.is_fresh) return;
        if (!row.uuid) return alert("该航班缺少 uuid，无法标记生鲜");
        try {
            await freshAirCargoApi.mark(row.uuid);
            await fetchFlights();
        } catch (err) {
            alert(`标记失败：${err.message}`);
        }
    };

    // 取消选中航班的生鲜标记（只读数据源不可用）
    const handleUnmarkFresh = async () => {
        if (IS_READONLY_SOURCE) return alert(READONLY_HINT);
        if (selectedId == null) return;
        const row = flights.find((f) => f.id === selectedId);
        if (!row || !row.is_fresh) return;
        if (!row.uuid) return alert("该航班缺少 uuid，无法取消生鲜标记");
        try {
            await freshAirCargoApi.unmark(row.uuid);
            await fetchFlights();
        } catch (err) {
            alert(`取消失败：${err.message}`);
        }
    };

    // 创建检查表：只负责"清掉上一个航班的会话 + 跳转带航班键的 URL"，
    // 真正的装载（航班行 / 草稿 / 模板 / 草稿键上下文）由编辑器按 URL 调
    // checklistStore.openFlight 完成 —— 一处装载逻辑，刷新 / 直链 / 草稿箱跳转都走它。
    // 草稿按「航班键(uuid) × 检查单类型」归档：有草稿则连同其类型一起恢复，
    // 没有才落到默认类型；不会误拿其他航班的填写。
    // ★ URL 刻意不带 ?record → 编辑器处于**新建态**，提交调 createRecord（POST 新增一条），
    //   该航班以前的检查单原样保留（reset 清掉 recordId，避免提交变成改旧记录）。
    const handleCreateChecklist = (f) => {
        useChecklistStore.getState().reset(); // 清上一个航班残留（含 recordId / 填写层内存）
        navigate(`/checklists/flight/${f.uuid}`);
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
        if (col.key.endsWith("_station")) {
            const raw = f[col.key];
            // 本场四字码显示成中文名；远端机场直接展示（ecyilang 快照本就是中文城市名）
            return STATION_LABEL[String(raw || "").toUpperCase()] || raw || "—";
        }
        return f[col.key] || "—";
    };

    // 行渲染（列配置驱动：单表/双表通用）
    //   editing = 该表正处于表头编辑态：此时被取消勾选的列仍占位渲染，
    //   但整列压暗（opacity-25）以表达「确认后将被隐藏」，便于再次勾选回来。
    const renderRow = (f, cols, accent, editing) => {
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
                    <td
                        key={col.key}
                        className={cn(
                            "whitespace-nowrap px-3 py-1.5 align-middle",
                            editing && col.isHide && "opacity-25"
                        )}
                    >
                        {renderCell(f, col)}
                    </td>
                ))}
                <td className="whitespace-nowrap px-3 py-1.5 align-middle">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCreateChecklist(f);
                        }}
                    >
                        <FileText size={13} /> 创建检查表
                    </Button>
                </td>
            </tr>
        );
    };

    // 列头（列配置驱动：单表/双表通用；accent 控制主题色）
    //   非编辑态：按生效配置渲染 + 缩写 tooltip（SOBT/EOBT/ATOT…）+ 点击排序
    //   编辑态  ：按草稿渲染「全部列」（含已隐藏的），每列表头带勾选框与前后移箭头；
    //             此时点击表头不再触发排序，避免与勾选/调序冲突。
    const renderHeader = (view, cols, accent) => {
        const editing = editingView === view;
        return (
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
                    {cols.map((col) => {
                        const tip = shortCutTooltip(col.key);
                        return (
                            <th
                                key={col.key}
                                className={cn(
                                    "whitespace-nowrap px-2 py-1.5 font-medium transition-colors",
                                    !editing && "cursor-pointer select-none hover:text-primary-600",
                                    !editing && sortKey === col.key && "text-primary-600"
                                )}
                                onClick={editing ? undefined : () => handleSort(col.key)}
                                title={
                                    editing
                                        ? "勾选 = 显示该列；取消勾选 = 隐藏该列；箭头可调整列顺序"
                                        : tip
                                        ? `${tip}（点击切换排序）`
                                        : "点击切换排序"
                                }
                            >
                                {editing ? (
                                    <ColumnToggle col={col} />
                                ) : (
                                    <span className="inline-flex items-center gap-1">
                                        {col.label}
                                        <SortIcon colKey={col.key} />
                                    </span>
                                )}
                            </th>
                        );
                    })}
                    <th className="whitespace-nowrap px-2 py-1.5 font-medium">操作</th>
                </tr>
            </thead>
        );
    };

    // 空状态（colCount 跟着当前列数走：隐藏列后 colSpan 不能还是老值，否则表格塌陷）
    const renderEmpty = (colCount, msg) => (
        <tr>
            <td colSpan={colCount + 1} className="px-4 py-8 text-center text-sm text-slate-400">
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
                    dataSource={FLIGHT_SOURCE_LABEL}
                    readOnly={IS_READONLY_SOURCE}
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
                        <div className="ml-auto flex items-center gap-2">
                            {/* 单表模式下，表头筛选按钮放在标题栏（双表模式则挂在各自表头条里） */}
                            {viewMode === "all" && (
                                <ColumnFilterBar view="all" className="border-slate-200 text-slate-600" />
                            )}
                            <button
                                onClick={cycleView}
                                className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                                title={`当前：${VIEW_META[viewMode].label} ｜ 点击切换为：${VIEW_META[nextView].label}`}
                            >
                                <NextViewIcon size={13} /> {VIEW_META[nextView].label}
                            </button>
                        </div>
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
                            {renderHeader("all", colsByView.all)}
                            <tbody>
                                {sorted.map((f) =>
                                    renderRow(f, colsByView.all, undefined, editingView === "all")
                                )}
                            </tbody>
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
                        {/* 左表：视图由 leftView 决定（'in-left' 时是进港） */}
                        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200">
                            <div
                                className={cn(
                                    "flex shrink-0 items-center justify-between gap-2 border-b px-3 py-1.5 text-xs font-semibold",
                                    leftView === "in" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"
                                )}
                            >
                                <span>
                                    {leftView === "in" ? "进港航班" : "离港航班"}（{listByView[leftView].length}）
                                </span>
                                {/* 表头筛选操作 */}
                                <ColumnFilterBar view={leftView} />
                            </div>
                            <div className="min-h-0 flex-1 overflow-auto">
                                <table className="w-full text-sm">
                                    {renderHeader(
                                        leftView,
                                        colsByView[leftView],
                                        leftView === "in" ? "sky" : "amber"
                                    )}
                                    <tbody>
                                        {listByView[leftView].map((f) =>
                                            renderRow(
                                                f,
                                                colsByView[leftView],
                                                leftView === "in" ? "sky" : "amber",
                                                editingView === leftView
                                            )
                                        )}
                                        {listByView[leftView].length === 0 &&
                                            !loading &&
                                            renderEmpty(colsByView[leftView].length, "无航班")}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* 右表：视图由 rightView 决定 */}
                        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200">
                            <div
                                className={cn(
                                    "flex shrink-0 items-center justify-between gap-2 border-b px-3 py-1.5 text-xs font-semibold",
                                    rightView === "in" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"
                                )}
                            >
                                <span>
                                    {rightView === "in" ? "进港航班" : "离港航班"}（{listByView[rightView].length}）
                                </span>
                                {/* 表头筛选操作 */}
                                <ColumnFilterBar view={rightView} />
                            </div>
                            <div className="min-h-0 flex-1 overflow-auto">
                                <table className="w-full text-sm">
                                    {renderHeader(
                                        rightView,
                                        colsByView[rightView],
                                        rightView === "in" ? "sky" : "amber"
                                    )}
                                    <tbody>
                                        {listByView[rightView].map((f) =>
                                            renderRow(
                                                f,
                                                colsByView[rightView],
                                                rightView === "in" ? "sky" : "amber",
                                                editingView === rightView
                                            )
                                        )}
                                        {listByView[rightView].length === 0 &&
                                            !loading &&
                                            renderEmpty(colsByView[rightView].length, "无航班")}
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
