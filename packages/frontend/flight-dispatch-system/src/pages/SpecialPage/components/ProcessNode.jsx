import { Check, Loader2, RotateCcw, Save, Trash2, TriangleAlert } from "lucide-react";
import { BOARD_UNIT, TOTAL_DURATION_STANDARD_MIN, evaluateProcess } from "../../../config/specialSpec";
import { normalizeHHmm } from "../../../utils/processTime";
import { UNLOAD_STANDARD_LABEL, unloadStandardHint, unloadStandardText } from "../../../utils/specialCargoStandards";
import { cn } from "../../../lib/utils";

/**
 * ============================================================
 * ProcessNode —— 生鲜保障流程节点（**一列 = 一个航班**）
 * ------------------------------------------------------------
 * 完全对齐 ProcessNode.png 主表的列结构：
 *
 *   ┌ 深蓝表头：5Y8608(B77L) 卸机时长标准 80 分钟      9月29日 ┐
 *   │            ★ 卸机时长标准 = utils/specialCargoStandards 按机型取
 *   │            停机位 348L   ZSPD → ZHEC              │
 *   ├ 子表头：  保障环节           │ 时间节点 │ 间隔(分钟) │
 *   ├ 9 个环节（飞机落地 → 末车到库）                    │
 *   │   间隔 = 与**上一行**环节的时间差，跨零点按 +24h    │
 *   │   有标准的环节自动判达标（绿勾 / 超标红三角）      │
 *   └ 汇总：生鲜货物板数 / 是否启动保障程序 / 时长小计  ┘
 *
 * ★ 间隔时长是**算出来的**，不让人手填：
 *   上一环节时间与本次时间一填，差值和标准对比立刻出来。
 *   （PNG 里 00:55→01:17 手填的 23 实际是 22，就是手工算的锅）
 *
 * ★ 台账（special 表）：
 *   record 命中时表头挂「台账」小标（鼠标悬停看入库/更新时间），
 *   并出现「存台账」按钮 —— 把当前这一列的值 upsert 回服务端。
 *   注意：别把本地空值当成「清空台账」，保存前页面上显示的（含台账兜底的）
 *   就是将要写入的值。
 *
 * @param {Object}   flight            航班行（flight_no / aircraft_type / stand / createdDate）
 * @param {Object}   value             { boardCount, programStarted, steps: { [stepKey]: { time } } }
 * @param {Function} onStepTime        (stepKey, time) => void
 * @param {Function} onBoardCount      (boardCount) => void
 * @param {Function} onProgramStarted  (bool) => void
 * @param {Function} [onReset]         清空这架航班的流程填写值 + 清单勾选
 * @param {Object}   [record]          该航班在 special 表里的台账行（无则 null）
 * @param {Function} [onSaveToLedger]  把当前值存进台账
 * @param {Function} [onDeleteLedger]  从台账删除这条记录（传了且 record 存在才显示按钮）
 * @param {boolean}  [saving]          是否正在存台账
 * @param {string}   [className]
 * ============================================================
 */
export default function ProcessNode({
    flight,
    value,
    onStepTime,
    onBoardCount,
    onProgramStarted,
    onReset,
    record,
    onSaveToLedger,
    onDeleteLedger,
    saving = false,
    className,
}) {
    const steps = value?.steps || {};
    const aircraftType = flight?.aircraft_type || "";
    const boardCount = value?.boardCount ?? "";
    const programStarted = !!value?.programStarted;
    const fromLedger = flight?.source === "special";

    // 该机型的卸机作业时长标准（表头直接写出来，不用再去翻标准表）
    const unloadText = unloadStandardText(aircraftType);

    // 间隔 / 达标 / 时长小计一律走 evaluateProcess（与页面汇总统计同一口径）
    const { items, total, totalOver } = evaluateProcess(aircraftType, steps);

    return (
        <section
            className={cn(
                "flex w-[344px] shrink-0 flex-col  text-base overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
                className
            )}
        >
            {/* ---------- 表头：航班号(机型) ---------- */}
            <header className="bg-primary-600 px-2.5 py-2 text-white text-lg">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate  font-semibold leading-none">
                        {flight?.flight_no || "—"}
                        <span className="ml-0.5  font-normal text-primary-100">({aircraftType || "—"})</span>
                        {/* 卸机时长标准：机型定了就直接写在表头，省得回头查标准表 */}
                        <span
                            className="ml-1 whitespace-nowrap text-[10px] font-normal text-primary-100"
                            title={unloadStandardHint(aircraftType)}
                        >
                            {UNLOAD_STANDARD_LABEL} {unloadText || "—"}
                        </span>
                    </span>
                </div>
                <div className="mt-1 flex items-center gap-2  text-sm text-primary-100">
                    <span className="shrink-0">停机位 {flight?.stand || "???"}</span>
                    <span className="truncate">
                        {(flight?.origin_station || "起飞机场") + " → " + (flight?.dest_station || "目的地机场")}
                    </span>
                    <span className="ml-auto flex shrink-0 items-center gap-0.5">
                        {onSaveToLedger && (
                            <button
                                onClick={onSaveToLedger}
                                disabled={saving}
                                title={
                                    record
                                        ? "把当前这一列的值覆盖到台账（special 表）"
                                        : "把当前这一列的值写入台账（special 表）"
                                }
                                className="rounded p-0.5 text-primary-100 transition-colors hover:bg-primary-500 hover:text-white disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                            </button>
                        )}
                        {onDeleteLedger && record && (
                            <button
                                onClick={onDeleteLedger}
                                title="从台账（special 表）删除这一条记录"
                                className="rounded p-0.5 text-primary-100 transition-colors hover:bg-red-500/80 hover:text-white"
                            >
                                <Trash2 size={11} />
                            </button>
                        )}
                        {onReset && (
                            <button
                                onClick={onReset}
                                title="清空这架航班的流程填写值与清单勾选（不影响台账）"
                                className="rounded p-0.5 text-primary-100 transition-colors hover:bg-primary-500 hover:text-white"
                            >
                                <RotateCcw size={11} />
                            </button>
                        )}
                    </span>
                </div>
            </header>

            {/* ---------- 环节表 ---------- */}
            <table className="w-full table-fixed border-collapse ">
                <colgroup>
                    <col className="w-[24px]" />
                    <col />
                    <col />
                    <col />
                </colgroup>
                <thead>
                    <tr className="bg-primary-50 text-base text-primary-700">
                        <th colSpan={2} className="border-b border-primary-100 px-1.5 py-1 text-left font-medium">
                            保障环节
                        </th>
                        <th className="border-b border-l border-primary-100 px-1 py-1 font-medium">时间节点</th>
                        <th className="border-b border-l border-primary-100 px-1 py-1 font-medium leading-[1.2] text-sm">
                            与上一环节
                            <br />
                            间隔(分钟)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(({ step, time, gap, standard, ok }) => {
                        return (
                            <tr key={step.key} className="border-b border-slate-100 last:border-b-0">
                                <td className="bg-slate-50 px-1 py-1 text-center align-top text-[10px] text-slate-400">
                                    {step.no}
                                </td>
                                <td className="px-1.5 py-1 align-top">
                                    <div className="text-[11px] leading-snug text-slate-700">{step.label}</div>
                                    {step.standardText && (
                                        <div
                                            className="mt-0.5 text-[9px] leading-snug text-slate-400"
                                            title={step.standardText}
                                        >
                                            {step.standardText}
                                        </div>
                                    )}
                                </td>
                                <td className="border-l border-slate-100 px-1 py-1 text-center align-top">
                                    <input
                                        value={time}
                                        onChange={(e) => onStepTime(step.key, e.target.value)}
                                        onBlur={(e) => {
                                            const v = normalizeHHmm(e.target.value);
                                            if (v !== e.target.value) onStepTime(step.key, v);
                                        }}
                                        placeholder="HH:mm"
                                        inputMode="numeric"
                                        className="h-6 w-full rounded border border-slate-200 px-1 text-center text-[11px] tabular-nums text-slate-700 outline-none transition-colors placeholder:text-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
                                    />
                                </td>
                                <td className="border-l border-slate-100 px-1 py-1 text-center align-top">
                                    {gap == null ? (
                                        <span className="text-[10px] text-slate-300">/</span>
                                    ) : (
                                        <span
                                            className={cn(
                                                "inline-flex items-center justify-center gap-0.5 text-[11px] tabular-nums",
                                                ok === true && "text-emerald-600",
                                                ok === false && "font-semibold text-red-600",
                                                ok == null && "text-slate-600"
                                            )}
                                            title={
                                                standard != null
                                                    ? `标准 ${standard} 分钟${
                                                          ok === false ? `，超 ${gap - standard} 分钟` : ""
                                                      }`
                                                    : step.standardText || ""
                                            }
                                        >
                                            {gap}
                                            {ok === true && <Check size={10} />}
                                            {ok === false && <TriangleAlert size={10} />}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>

                {/* ---------- 汇总三行 ---------- */}
                <tfoot className="border-t border-slate-200 bg-slate-50/80 text-[11px]">
                    <tr className="border-b border-slate-100">
                        <td colSpan={2} className="px-1.5 py-1 text-slate-500">
                            生鲜货物板数
                        </td>
                        <td colSpan={2} className="px-1.5 py-1">
                            <div className="flex items-center justify-end gap-1">
                                <input
                                    value={boardCount}
                                    onChange={(e) => onBoardCount(e.target.value.replace(/[^\d]/g, ""))}
                                    placeholder="—"
                                    inputMode="numeric"
                                    className="h-6 w-[52px] rounded border border-slate-200 px-1 text-center text-[11px] tabular-nums text-slate-700 outline-none transition-colors placeholder:text-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
                                />
                                <span className="text-slate-400">{BOARD_UNIT}</span>
                            </div>
                        </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                        <td colSpan={2} className="px-1.5 py-1 text-slate-500">
                            是否启动保障程序
                        </td>
                        <td colSpan={2} className="px-1.5 py-1">
                            <div className="flex justify-end gap-1">
                                {[
                                    { v: true, label: "是" },
                                    { v: false, label: "否" },
                                ].map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => onProgramStarted(opt.v)}
                                        className={cn(
                                            "h-6 rounded border px-2 text-[11px] font-medium transition-colors",
                                            programStarted === opt.v
                                                ? opt.v
                                                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                                    : "border-red-300 bg-red-50 text-red-600"
                                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2} className="px-1.5 py-1 text-slate-500">
                            货物保障时长小计
                        </td>
                        <td colSpan={2} className="px-1.5 py-1 text-right">
                            {total == null ? (
                                <span className="text-[10px] text-slate-300">填首末时间后自动算</span>
                            ) : (
                                <span
                                    className={cn(
                                        "tabular-nums",
                                        totalOver ? "font-semibold text-red-600" : "text-emerald-600"
                                    )}
                                    title={`标准 ${TOTAL_DURATION_STANDARD_MIN} 分钟`}
                                >
                                    {total} 分钟
                                    {totalOver && <TriangleAlert size={10} className="ml-0.5 inline" />}
                                </span>
                            )}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </section>
    );
}
