/**
 * ============================================================
 * RawEcyilangTableDialog —— 某行 ecyilang 快照的「变更历史」弹窗
 * ------------------------------------------------------------
 * 双击 RawEcyilangTable 的一行弹出。该行的 changelog 里每次变更
 * 都存了整条原始快照（{ updateTime, snapshot }），这里按时间**倒序**、
 * 用与主表完全相同的表头逐份渲染 —— 直观看到每一次变化后的样子。
 *
 * ★ 弹窗一律原生 <dialog> + showModal()（项目约定）：开关状态住 DOM（el.open），
 *   两个坑都有守卫：① 已开着再 showModal() 会抛错 → 先判 !el.open；
 *   ② 作者样式的 display 会盖掉 UA 的 dialog:not([open]){display:none}
 *   → display 必须写成 open:flex。Esc 关闭是白送的（onClose 回调通知父组件清 row）。
 *
 * ★ 表格直接复用 <RawEcyilangTable rows={[snapshot]} bare />（受控模式：
 *   不拉数据、不带标题条、不响应双击），表头 / 列 / 时间四列分配零重复。
 * ============================================================
 */
import { useEffect, useRef } from "react";
import { History, X } from "lucide-react";
import RawEcyilangTable from "./RawEcyilangTable";

export default function RawEcyilangTableDialog({ row, onClose }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (row && !el.open) el.showModal();
        if (!row && el.open) el.close();
    }, [row]);

    // changelog：[{ updateTime, snapshot }] → 倒序（最新在最上面）
    const history = [...(row?.changelog ?? [])].reverse();

    /** 行首航班标识（d 号优先，纯进港用 a 号） */
    const title = row ? row.d_flight_no_full || row.a_flight_no_full || "(无航班号)" : "";

    return (
        <dialog
            ref={ref}
            onClose={() => onClose?.()}
            onClick={(e) => {
                // 点到 backdrop（dialog 本体以外的空白）= 关闭
                if (e.target === ref.current) ref.current.close();
            }}
            className="open:flex fixed inset-0 m-auto h-[85vh] w-[92vw] max-w-7xl flex-col overflow-hidden rounded-lg bg-white p-0 text-slate-700 shadow-2xl backdrop:bg-slate-900/50"
        >
            {row && (
                <div className="flex min-h-0 flex-1 flex-col">
                    {/* 头部：标题 + 关闭按钮 */}
                    <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
                        <History size={15} className="text-primary-600" />
                        <span className="text-sm font-semibold">
                            变更历史 — {title}
                            <span className="ml-2 text-xs font-normal text-slate-400">
                                共 {history.length} 次变更（新 → 旧）
                            </span>
                        </span>
                        <button
                            type="button"
                            onClick={() => ref.current?.close()}
                            className="ml-auto rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* 变更历史：每份快照一组（时间头 + 同表头小表），倒序 */}
                    <div className="min-h-0 flex-1 overflow-auto p-3">
                        {history.length === 0 ? (
                            <div className="px-2 py-8 text-center text-sm text-slate-400">该行暂无变更记录</div>
                        ) : (
                            history.reverse().map((c, i) => (
                                <div key={c.updateTime ?? i} className="mb-4 last:mb-0">
                                    <div className="mb-1 flex items-center gap-2 text-xs">
                                        <span className="rounded bg-primary-50 px-1.5 py-0.5 font-semibold text-primary-600">
                                            第 {i + 1} 次
                                        </span>
                                        <span className="font-semibold text-slate-600">{c.updateTime}</span>
                                        {i === history.length - 1 && (
                                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-600">
                                                当前最新
                                            </span>
                                        )}
                                    </div>
                                    {/* 同一套表头渲染该时刻的整条快照（受控 + bare 模式） */}
                                    <div className="overflow-hidden rounded border border-slate-200">
                                        <RawEcyilangTable rows={[c.snapshot]} bare />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </dialog>
    );
}
