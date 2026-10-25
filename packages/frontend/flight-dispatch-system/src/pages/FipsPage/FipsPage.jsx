import { useEffect } from "react";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import AddFlightDialog from "./components/AddFlightDialog";
import RawEcyilangTable from "./components/RawEcyilangTable";
import Sidebar from "./components/Sidebar";
import { useFipsStore, TIME_KEYS, panelViewsOf, visibleColumns, LOCAL_STATION } from "../../store/fips.store";
import { useSidebarStore } from "../../store/sidebar.store";
import { useAppStore, dateFilterKeyOf } from "../../store/app.store";
import { Loader2, Leaf, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "../../utils/cn";
import ContentLayout from "../../Layout/ContentLayout";

/** 本场四字码 → 中文名（远端机场直接展示原值） */
const STATION_LABEL = { [LOCAL_STATION]: "鄂州" };

// 每张表的主题色：进港 sky / 离港 amber；全部表不设 accent，走中性 hover
const ACCENT = { all: undefined, dep: "amber", arr: "sky" };
// 双表模式下每张表的标题
const PANEL_LABEL = { dep: "离港航班", arr: "进港航班" };

/** 表头排序图标：显示哪个箭头完全由该列表头的 order 决定（'asc' | 'desc' | 'default'） */
function SortIcon({ order }) {
    if (order === "asc") return <ChevronUp size={12} className="text-primary-600" />;
    if (order === "desc") return <ChevronDown size={12} className="text-primary-600" />;
    return <ChevronsUpDown size={12} className="text-slate-300" />;
}

/** 时间展示：截成 HH:mm（兼容 HH:mm 与完整 datetime） */
const fmtTime = (t) => {
    if (!t) return "—";
    const m = String(t).match(/(\d{1,2}:\d{2})$/);
    return m ? m[1] : String(t);
};

/**
 * ============================================================
 * 航班列表页 —— 航班计划 / 手动添加航班
 * ------------------------------------------------------------
 * 本页只做两件事：把 fips.store 算好的三张表铺到界面上、挂「添加 / 修改」对话框。
 *
 * ★ 左侧栏 Sidebar **自取自足**（搜索 / 增删改 / 生鲜标记都直接跟 store 打交道），
 *   所以这里就是 `<Sidebar />`，不再往下传十几个回调。
 * ★ 行的后续操作（创建检查单 / 修改 / 删除 / 生鲜）全在侧栏：表格里只留数据列，
 *   点一行 = 选中（sidebar.store 的 setSelectedFlight），剩下交给侧栏按钮。
 * ★ 列的显隐 / 顺序去设置页「航班表」改；这里点表头只切排序（改表头的 order）。
 * ============================================================
 */
export default function FipsPage() {
    // ---- 分片 A：航班数据（已过滤 + 已排序，直接渲染）----
    const { flights, depFlights, arrFlights, loading, error, fetchFlights } = useFipsStore();
    // ---- 分片 B：视图 + 三套表头（{ source, columns }，列的显隐 / 顺序 / 排序都在里面）----
    const { viewMode, allHeader, depHeader, arrHeader, toggleSort } = useFipsStore();
    // ---- 分片 C：选中行 + 添加 / 修改对话框（与侧栏共用，动作在 sidebar.store）----
    const { selectedFlight, setSelectedFlight, clearSelection, addOpen, editing, closeDialog } = useSidebarStore();

    // 当前航班数据源（appStore）—— 换源后本页跟着重拉
    const source = useAppStore((s) => s.source);
    // 日期筛选指纹（app.store）：换日期时清掉选中行 + 重拉一次
    const dateKey = useAppStore(dateFilterKeyOf);

    // 每张表当前要渲染的列 = 该表 columns 里没被隐藏的列（顺序沿用数组顺序）
    const columnsOf = (view) => visibleColumns({ all: allHeader, dep: depHeader, arr: arrHeader }[view]);

    // 进页面 / 换数据源 / 换日期各拉一次（日期参数由 fetchFlights 从 app.store 自己拼）
    // ★ source=ecyilang 时表格区换成 RawEcyilangTable（组件自己拉原始快照），这里不用再拉 fips 形状
    useEffect(() => {
        if (source === "ecyilang") return;
        fetchFlights().catch(() => {});
    }, [fetchFlights, source, dateKey]);

    // 日期或数据源变更后清空选中行：换了源再显示上一套航班号是不对的
    useEffect(() => {
        clearSelection();
    }, [dateKey, source, clearSelection]);

    // 三张表实际渲染的列 + 各自要铺的数据 + 双表模式下左 / 右各是哪张表
    const colsByView = { all: columnsOf("all"), dep: columnsOf("dep"), arr: columnsOf("arr") };
    const rowsByView = { all: flights, dep: depFlights, arr: arrFlights };
    const { left: leftView, right: rightView } = panelViewsOf(viewMode);

    // 单元格渲染（按列的 keyName）
    const renderCell = (f, col) => {
        const key = col.keyName;
        if (key === "flight_no") {
            return (
                <span className="inline-flex items-center gap-1.5 font-semibold ">
                    {f.flight_no}
                    {f.is_fresh && <Leaf size={13} className="text-emerald-600" title="生鲜货物航班" />}
                </span>
            );
        }
        if (TIME_KEYS.includes(key)) {
            return <span className="tabular-nums">{fmtTime(f[key])}</span>;
        }
        if (key.endsWith("_station")) {
            const raw = f[key];
            // 本场四字码显示成中文名；远端机场直接展示（ecyilang 快照本就是中文城市名）
            return STATION_LABEL[String(raw || "").toUpperCase()] || raw || "—";
        }
        return f[key] || "—";
    };

    // 行渲染（列配置驱动：单表/双表通用；accent 决定 hover 色）
    //   点一行 = 选中；行里不再放按钮 —— 创建检查单 / 修改 / 删除 / 生鲜都在左侧栏。
    const renderRow = (f, cols, accent) => {
        const isSelected = selectedFlight?.id === f.id;
        return (
            <tr
                key={f.id}
                onClick={() => {
                    setSelectedFlight(f);
                }}
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
                    <td key={col.keyName} className="whitespace-nowrap px-3 py-1.5 align-middle">
                        {renderCell(f, col)}
                    </td>
                ))}
            </tr>
        );
    };

    // 列头（列配置驱动：单表/双表通用；accent 控制主题色）
    //   只渲染可见列 + 缩写 tooltip（SOBT/EOBT/ATOT…）；点表头调 store.toggleSort 排序。
    //   改列的显示 / 顺序不在这里 —— 去设置页「航班表」。
    const renderHeader = (view, cols, accent) => (
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
                    const tip = col.tooltip;
                    return (
                        <th
                            key={col.keyName}
                            className={cn(
                                "cursor-pointer select-none whitespace-nowrap px-2 py-1.5 font-medium transition-colors hover:text-primary-600",
                                col.order !== "default" && "text-primary-600"
                            )}
                            onClick={() => toggleSort(view, col.keyName)}
                            title={tip ? `${tip}（点击切换排序）` : "点击切换排序"}
                        >
                            <span className="inline-flex items-center gap-1">
                                {col.title}
                                <SortIcon order={col.order} />
                            </span>
                        </th>
                    );
                })}
            </tr>
        </thead>
    );

    // 空状态（colSpan 跟着当前列数走：隐藏列后不能还是老值，否则表格塌陷）
    // 三张表共用一句话：不管单表还是双表左右，都可能是「这天没有航班」或「关键词没匹配上」
    const renderEmpty = (colCount) => (
        <tr>
            <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-slate-400">
                无航班
            </td>
        </tr>
    );

    // 一张表（表头 + 表体 + 空状态）—— 单表与双表的左 / 右两侧都复用它，差别只有 view
    const renderTable = (view) => {
        const cols = colsByView[view];
        const rows = rowsByView[view];
        const accent = ACCENT[view];
        return (
            <table className="w-full text-sm">
                {renderHeader(view, cols, accent)}
                <tbody>
                    {rows.map((f) => renderRow(f, cols, accent))}
                    {rows.length === 0 && !loading && renderEmpty(cols.length)}
                </tbody>
            </table>
        );
    };

    // 双表模式下的一侧：标题条（表名 + 条数）+ 滚动区
    const renderPanel = (view) => (
        <div key={view} className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200">
            <div
                className={cn(
                    "flex shrink-0 items-center gap-2 border-b px-3 py-1.5 text-xs font-semibold",
                    ACCENT[view] === "sky" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"
                )}
            >
                <span>
                    {PANEL_LABEL[view]}（{rowsByView[view].length}）
                </span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">{renderTable(view)}</div>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-82px)] shrink-0 gap-1 overflow-hidden">
            <Sidebar />
            {/* 右侧：航班表格 */}
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <CardHeader className="shrink-0">
                    <div className="flex items-center gap-3">
                        <CardTitle>
                            航班列表{" "}
                            {source !== "ecyilang" && flights.length > 0 && (
                                <span className="ml-1 text-xs font-normal text-slate-400">共 {flights.length} 架</span>
                            )}
                        </CardTitle>
                        {selectedFlight && (
                            <span className="text-sm text-green-700 font-semibold">
                                已选中：
                                {`${selectedFlight?.a_flight_no_full || ""}  
                                    ${selectedFlight?.a_flight_no_full === null ? "" : "-"} 
                                    ${selectedFlight?.d_flight_no_full || ""}`}
                                {selectedFlight?.is_fresh && (
                                    <span className="ml-1 inline-flex items-center gap-0.5 text-emerald-600">
                                        <Leaf size={11} /> 生鲜
                                    </span>
                                )}
                            </span>
                        )}
                        {/* 视图模式与列的显示 / 顺序都在设置页「航班表」板块里改 */}
                    </div>
                    {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
                </CardHeader>

                {error && source !== "ecyilang" && (
                    <div className="mx-3 mt-1 rounded bg-red-50 px-3 py-1.5 text-xs text-red-600">
                        加载失败：{error}
                    </div>
                )}

                {source === "ecyilang" ? (
                    /* ===== ecyilang 源：原始快照表（两行表头 / 一条数据两行，不做 fips 映射） ===== */
                    <RawEcyilangTable />
                ) : viewMode === "all" ? (
                    /* ===== 全部航班（单表） ===== */
                    <div className="min-h-0 flex-1 overflow-auto">{renderTable("all")}</div>
                ) : (
                    /* ===== 进 / 离港双表（左 / 右由 viewMode 决定） ===== */
                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden p-2 lg:grid-cols-2">
                        {[leftView, rightView].map(renderPanel)}
                    </div>
                )}
            </Card>

            {/* 添加 / 修改航班对话框（开关与编辑对象都在 store，由侧栏按钮打开） */}
            <AddFlightDialog open={addOpen} initial={editing} onClose={closeDialog} onSaved={fetchFlights} />
        </div>
    );
}
