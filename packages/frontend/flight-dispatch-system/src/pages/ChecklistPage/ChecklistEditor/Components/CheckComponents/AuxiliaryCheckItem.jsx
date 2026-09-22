import { memo, useCallback } from "react";
import { cn } from "../../../../../lib/utils";
import { evaluateFormula } from "../../../../../utils/timeFormula";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "../OtherComponents/statusBadge";
// 填写数据在 checklistDraft（内存 + IndexedDB）：逐项订阅 + 模块级稳定写入函数
import { useAuxItem, setItemValue } from "../../../../../store/checklistDraft";
import { useChecklistStore } from "../../../../../store/checklistStore";
import useTimeFormulas from "../../hooks/useTimeFormulas";
import useRegister from "../../hooks/useRegister";

/**
 * ============================================================
 * AuxiliaryCheckItem —— 辅助监控指标「单项行」（填写模式）
 * ------------------------------------------------------------
 * 由 AuxiliaryPanel 渲染，一行 = 当前选中节点下的一条辅助监控指标：
 *   ↳ 名称 / 描述 / 状态 / 系统计算时间（formula 只读结果）/ 实际时间 / 备注
 *
 * ★ 表单写法仿 react-hook-form
 *   输入控件只写一行 `{...register("time")}` —— 没有 value、没有 ref、
 *   没有手写 onChange，取值 / 写入 / 回填全部由 useRegister 接管；
 *   需要"改了时间就取消自动标记"时，用 also 选项顺手带上：
 *     <input type="datetime-local" {...register("time", { also: { auto: false } })} />
 *     <textarea {...register("note")} />
 *
 * ★ 数据全部自己取
 *   - useAuxItem(itemKey)  只订阅自己那一项（checklistDraft）
 *   - setItemValue 是 checklistDraft 模块级函数（引用永久稳定）
 *   - 公式上下文自己从 store 取 template / flight 后 useTimeFormulas 现算
 *
 * 锚点：anchorId 非空时渲染 id={anchorId}，供选中节点后 scrollIntoView 定位。
 * ============================================================
 * @param {Object} props.aux        辅助项定义（{ id, row, name, desc, formula }）
 * @param {string} [props.anchorId] 首行的滚动锚点 id（非首行不传）
 * ============================================================
 */
export default memo(function AuxiliaryCheckItem({ aux, anchorId }) {
    const itemKey = `aux-${aux.uuid}`;
    // 只订阅自己那一项：其他辅助项填写时本行不重渲染
    const item = useAuxItem(itemKey);
    const data = item || {};

    // 公式上下文：template / flight 自己从 store 取，不再由面板层层透传
    const template = useChecklistStore((s) => s.template);
    const flight = useChecklistStore((s) => s.flight);
    const { formulaCtx } = useTimeFormulas({ template, nodes: template?.schema || [], flight });

    // 表单：取值 / 写入 / 回填全部收进 register（setItemValue 是模块级函数，引用稳定）
    const writeField = useCallback((field, value) => setItemValue(itemKey, field, value), [itemKey]);
    const register = useRegister({ time: data.time, note: data.note }, writeField);

    return (
        <div id={anchorId} className="scroll-mt-2 rounded-lg border border-slate-200 p-2 hover:bg-primary-50/40 ">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[13px]  text-slate-600 font-bold">↳ {aux.name}</span>
                <span className=" italic text-[12px] text-slate-500 ">{aux.desc || "—"}</span>
                {/* 状态：label 包裹（文字+图标均可点击切换），hover 显示文字 */}
                <label
                    className={cn(
                        "ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 text-[12px]",
                        STATUS_COLORS[data.status || ""] || "text-blue-500"
                    )}
                    title={`状态：${STATUS_LABELS[data.status || ""]}（单击切换）`}
                >
                    <span>{STATUS_LABELS[data.status || ""]}</span>
                    <button
                        className="shrink-0 cursor-pointer rounded p-0.5 transition-transform hover:scale-150"
                        onClick={(e) => {
                            e.stopPropagation();
                            setItemValue(itemKey, "status", nextStatus(data.status));
                        }}
                    >
                        {STATUS_ICONS[data.status || ""]}
                    </button>
                </label>
            </div>

            {/* 系统计算时间（formula 只读结果） / 不可计算提示 */}
            {aux.formula &&
                (() => {
                    const fr = evaluateFormula(aux.formula, formulaCtx);
                    if (fr.ok && fr.kind === "time") {
                        return (
                            <div className="mt-1 text-[12px] text-slate-400">
                                系统计算时间：
                                <b className="tabular-nums text-emerald-600">{fr.value}</b>
                            </div>
                        );
                    }
                    return !fr.ok ? (
                        <div className="mt-0.5 text-[14px] text-amber-600" title={fr.reason}>
                            ⚠ {fr.reason}
                        </div>
                    ) : null;
                })()}

            {/* 实际时间 + 备注：仿 RHF，一行展开搞定取值 / 写入 */}
            <div className="mt-1.5 flex flex-row items-start  gap-2">
                <label className="flex flex-row items-center shrink-0 gap-2 text-[14px] text-blue-500">
                    实际时间
                    <input
                        type="datetime-local"
                        {...register("time", { also: { auto: false } })}
                        className="input flex-1 px-1.5 py-0.5 "
                    />
                </label>
                <textarea
                    {...register("note")}
                    className="input flex-1 resize-y px-1.5 py-0.5 "
                    rows={2}
                    placeholder="备注（可换行）"
                />
            </div>
        </div>
    );
});
