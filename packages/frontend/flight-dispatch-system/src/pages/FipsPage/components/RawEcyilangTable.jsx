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
import { Fragment, useEffect, useMemo, useState } from "react";
import { Leaf, Loader2 } from "lucide-react";
import { fipsApi } from "../../../api";
import { useAppStore, dateFilterKeyOf, dateFilterParamsOf } from "../../../store/app.store";
import { useFipsStore } from "../../../store/fips.store";
import { useSidebarStore } from "../../../store/sidebar.store";
import { resolveObjectFields } from "../../../utils/displayFields";
import { cn } from "../../../utils/cn";
import { COLUMNS, GROUPS, cellsOf, matchKeyword } from "../stateToWhichCell";
import RawEcyilangTableDialog from "./RawEcyilangTableDialog";

export default function RawEcyilangTable({ rows: controlledRows, bare = false } = {}) {
    const [fetchedRows, setFetchedRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // 双击打开的弹窗行（一条 ecyilang 快照；bare 模式下不弹，防止弹窗里再弹弹窗）
    const [dialogRow, setDialogRow] = useState(null);

    const source = useAppStore((s) => s.source);
    const dateKey = useAppStore(dateFilterKeyOf);
    const keyword = useFipsStore((s) => s.keyword);
    // 监控 SSE 推来变化时 +1 → 本表也重拉（它自己拉数据，不走 store.fetchFlights）
    const dataVersion = useFipsStore((s) => s.dataVersion);
    // 生鲜筛选（搜索卡的 Badge 切它）—— 原始快照行也带 is_fresh（后端 raw 分支补的）
    const freshOnly = useFipsStore((s) => s.freshOnly);
    // 展示形态开关所在的四份表头设置（列上的 english / icao radio）
    const ecyilangHeader = useFipsStore((s) => s.ecyilangHeader);
    const allHeader = useFipsStore((s) => s.allHeader);
    const depHeader = useFipsStore((s) => s.depHeader);
    const arrHeader = useFipsStore((s) => s.arrHeader);
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
    }, [controlled, source, dateKey, dataVersion]);

    const rows = controlled ? controlledRows : fetchedRows;
    // 名称类字段后端是「对象携带变体」形状 → 渲染前统一按表头设置的展示形态
    // （中文/英文/IATA/ICAO）挑一个字符串写回原字段名。自拉的 raw 行和受控模式
    // 喂进来的 changelog 快照都可能是嵌套形状，在这里过一遍才不会漏对象进 <td>。
    const displayRows = useMemo(
        () =>
            rows.map((r) => {
                const shown = resolveObjectFields(r, [ecyilangHeader, allHeader, depHeader, arrHeader]);
                // 补 flight_no（离港号优先、进港号兜底）：侧栏「创建检查单 / 生鲜标记」都要它
                // （和 store.fetchFlights 的 raw 分支同一口径；对象变体已在上一步解析成字符串）
                return {
                    ...shown,
                    flight_no: shown.flight_no ?? shown.d_flight_no_full ?? shown.a_flight_no_full ?? null,
                };
            }),
        [rows, ecyilangHeader, allHeader, depHeader, arrHeader]
    );
    const visible = controlled
        ? displayRows
        : displayRows.filter((r) => (!freshOnly || r.is_fresh) && matchKeyword(r, keyword));

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
                    const onPick = (leg) => {
                        if (bare) return;
                        // ★ 生鲜是「按腿」的：选到就选 a 腿、选离就选 d 腿 ——
                        //   flight_no 换成那条腿的航班号，台账按（快照 uuid + callsign）定位到腿
                        // ★ 台账 callsign 用**库里的原始值**（a/d_flight_no_raw，如 O37404），
                        //   不用页面上的显示形态（切了 ICAO 会显示成 CSS7404）
                        const legNo = leg === "a" ? row.a_flight_no_raw : row.d_flight_no_raw;
                        setSelectedFlight({ ...row, leg, flight_no: legNo ?? row.flight_no ?? null });
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
                                onClick={() => onPick("a")}
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
                                            {/* 生鲜标记跟在该腿的航班号后面（只标这条腿） */}
                                            {c.key === "flight_no_full" && row.a_is_fresh && (
                                                <Leaf
                                                    size={11}
                                                    className="ml-1 inline-block align-[-1px] text-emerald-600"
                                                    title="该进港航班标记为生鲜"
                                                />
                                            )}
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
                                onClick={() => onPick("d")}
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
                                            {/* 生鲜标记跟在该腿的航班号后面（只标这条腿） */}
                                            {c.key === "flight_no_full" && row.d_is_fresh && (
                                                <Leaf
                                                    size={11}
                                                    className="ml-1 inline-block align-[-1px] text-emerald-600"
                                                    title="该离港航班标记为生鲜"
                                                />
                                            )}
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
