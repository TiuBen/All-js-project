/**
 * ============================================================
 * RawEcyilangTable —— ecyilang 原始快照表（不做 fips 列映射）
 * ------------------------------------------------------------
 * 【表头两行 / 一条数据两行 / 本场填充 / 时间四列分配】
 *   规则与列定义全部在 ../stateToWhichCell.js（本组件与 Dialog 共用）。
 *   一行快照 = 到港行 + 离港行，两行**照写**（不按腿数组循环），
 *   格子值来自 cellsOf(row) 一次算好的 { a, d }。
 *
 * 【双击弹窗】
 *   双击任意一行 → RawEcyilangTableDialog：把该行的 changelog
 *   （每次变更存的整条快照）按时间倒序、用同样的表头逐份渲染出来。
 *
 * 【两种用法】
 *   ① <RawEcyilangTable />            —— 自主模式：自己拉 source=ecyilang&raw=1，
 *      带日期筛选 / 关键词过滤 / 双击弹窗（FipsPage 用这个）
 *   ② <RawEcyilangTable rows={[snapshot]} bare /> —— 受控模式：外部直接喂一行
 *      原始快照，不拉数据、不带标题条、不响应双击（Dialog 里渲染每份 changelog 用）
 * ============================================================
 */
import { Fragment, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fipsApi } from "../../../api";
import { useAppStore, dateFilterKeyOf, dateFilterParamsOf } from "../../../store/app.store";
import { useFipsStore } from "../../../store/fips.store";
import { useSidebarStore } from "../../../store/sidebar.store";
import { cn } from "../../../utils/cn";
import { COLUMNS, GROUPS, cellsOf } from "../stateToWhichCell";
import RawEcyilangTableDialog from "./RawEcyilangTableDialog";

/** 关键词过滤（整条数据为单位：到 / 离任一格的任一值命中就整条保留） */
function matchKeyword(row, keyword) {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return true;
    const { a, d } = cellsOf(row);
    return [a, d].some((cells) => Object.values(cells).some((v) => v != null && String(v).toLowerCase().includes(kw)));
}

export default function RawEcyilangTable({ rows: controlledRows, bare = false } = {}) {
    const [fetchedRows, setFetchedRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // 双击打开的弹窗行（一条 ecyilang 快照；bare 模式下不弹，防止弹窗里再弹弹窗）
    const [dialogRow, setDialogRow] = useState(null);

    const source = useAppStore((s) => s.source);
    const dateKey = useAppStore(dateFilterKeyOf);
    const keyword = useFipsStore((s) => s.keyword);
    // 选中行（与 Sidebar 共用 sidebar.store）：选中后侧栏「创建检查单 / 生鲜标记」才能用
    const { selectedFlight, setSelectedFlight } = useSidebarStore();

    const controlled = Array.isArray(controlledRows);

    useEffect(() => {
        // 受控模式（Dialog 里渲染单份快照）不拉数据；非 ecyilang 源也不拉
        if (controlled || source !== "ecyilang") return;
        let alive = true;
        setLoading(true);
        setError(null);
        fipsApi
            .list({ ...dateFilterParamsOf(useAppStore.getState()), raw: 1 })
            .then((d) => {
                if (alive) setFetchedRows(d?.items || []);
            })
            .catch((err) => {
                if (alive) setError(err.message || "加载失败");
            })
            .finally(() => {
                if (alive) setLoading(false);
            });
        return () => {
            alive = false;
        };
    }, [controlled, source, dateKey]);

    const rows = controlled ? controlledRows : fetchedRows;
    const visible = controlled ? rows : rows.filter((r) => matchKeyword(r, keyword));
    // 空状态 colSpan 用全列数（航段 + 14 列 + 客货）
    const colCount = COLUMNS.length + 2;

    const table = (
        <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs">
                {/* 第 1 行：分组 */}
                <tr className="border-b border-slate-200 text-slate-500">
                    <th rowSpan={2} className="border-b border-r border-slate-200 px-2 py-1.5 font-medium">
                        航段
                    </th>
                    {GROUPS.map((g) => (
                        <th
                            key={g}
                            colSpan={COLUMNS.filter((c) => c.group === g).length}
                            className="border-b border-slate-200 px-2 py-1.5 text-center font-semibold text-slate-600"
                        >
                            {g}
                        </th>
                    ))}
                    <th rowSpan={2} className="border-b border-l border-slate-200 px-2 py-1.5 font-medium">
                        客运/货运
                    </th>
                </tr>
                {/* 第 2 行：列名 */}
                <tr className="border-b border-slate-200 text-slate-500">
                    {COLUMNS.map((c) => (
                        <th key={c.key} className="whitespace-nowrap px-2 py-1.5 text-left font-medium">
                            {c.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {visible.map((row) => {
                    // 一行快照 = 到 + 离，两条腿的 14 个格子一次算完
                    const { a, d } = cellsOf(row);
                    // 单击 = 选中该行（与 FipsPage 的行为一致）：写 sidebar.store 的
                    // selectedFlight —— 侧栏「创建检查单 / 生鲜标记」随之可用。
                    // 双击 = 看变更历史。bare 模式（Dialog 里渲染单份快照）都不响应。
                    const onPick = () => {
                        if (bare) return;
                        setSelectedFlight(row);
                    };
                    const onOpenHistory = () => {
                        if (bare) return;
                        setDialogRow(row);
                    };
                    const picked = !bare && selectedFlight?.id === row.id;

                    return (
                        <Fragment key={row.id ?? "snap"}>
                            {/* ========== 第 1 行：到港（本场 = 目的地） ========== */}
                            <tr
                                onClick={onPick}
                                onDoubleClick={onOpenHistory}
                                className={cn(
                                    "border-b border-slate-100 transition-colors hover:bg-primary-50/40",
                                    "bg-sky-50/30",
                                    !bare && "cursor-pointer",
                                    picked && "bg-primary-50/60"
                                )}
                            >
                                <td className="px-1 py-1 text-center align-middle text-xs font-semibold text-sky-700">
                                    到
                                </td>
                                {COLUMNS.map((c) => {
                                    const v = a[c.key];
                                    return (
                                        <td
                                            key={c.key}
                                            className={cn(
                                                "whitespace-nowrap px-2 py-1 align-middle",
                                                v == null && "text-slate-300"
                                            )}
                                        >
                                            {v ?? "-"}
                                        </td>
                                    );
                                })}
                                {/* 客运/货运：两行共用 → 到港行 rowSpan 合并 */}
                                <td
                                    rowSpan={2}
                                    className="border-l border-slate-100 px-2 py-1 text-center align-middle text-slate-400"
                                >
                                    {row.k_h || "-"}
                                </td>
                            </tr>

                            {/* ========== 第 2 行：离港（本场 = 起飞） ========== */}
                            <tr
                                onClick={onPick}
                                onDoubleClick={onOpenHistory}
                                className={cn(
                                    "border-b-2 border-b-slate-200 transition-colors hover:bg-primary-50/40",
                                    !bare && "cursor-pointer",
                                    picked && "bg-primary-50/60"
                                )}
                            >
                                <td className="px-1 py-1 text-center align-middle text-xs font-semibold text-amber-700">
                                    离
                                </td>
                                {COLUMNS.map((c) => {
                                    const v = d[c.key];
                                    return (
                                        <td
                                            key={c.key}
                                            className={cn(
                                                "whitespace-nowrap px-2 py-1 align-middle",
                                                v == null && "text-slate-300"
                                            )}
                                        >
                                            {v ?? "-"}
                                        </td>
                                    );
                                })}
                            </tr>
                        </Fragment>
                    );
                })}
                {visible.length === 0 && !loading && (
                    <tr>
                        <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-slate-400">
                            无航班
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    if (bare) return table; // 受控模式：只有表格本体（Dialog 里嵌套用）

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/* 标题条：条数 + 说明 */}

            {loading && <Loader2 size={14} className="animate-spin text-slate-400" />}
            {error && (
                <div className="mx-3 mt-1 rounded bg-red-50 px-3 py-1.5 text-xs text-red-600">加载失败：{error}</div>
            )}

            <div className="min-h-0 flex-1 overflow-auto">{table}</div>

            {/* 双击弹出的变更历史弹窗（row = null 时是关着的状态） */}
            <RawEcyilangTableDialog row={dialogRow} onClose={() => setDialogRow(null)} />
        </div>
    );
}
