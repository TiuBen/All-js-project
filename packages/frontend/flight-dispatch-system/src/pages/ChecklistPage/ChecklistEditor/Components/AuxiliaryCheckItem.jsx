import { memo } from "react";
import { cn } from "../../../../lib/utils";
import { evaluateFormula } from "../../../../utils/timeFormula";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "../../CommonComponents/statusBadge";
import { useAuxItem } from "../../../../store/checklistStore";

/**
 * ============================================================
 * AuxiliaryCheckItem —— 辅助监控指标「单项行」（填写模式）
 * ------------------------------------------------------------
 * 由 AuxiliaryPanel 渲染，一行 = 当前激活节点下的一条辅助监控指标：
 *   ↳ 名称 / 描述 / 状态 / 系统计算时间（formula 只读结果）/ 实际时间 / 备注
 *
 * ★ 自行订阅自己那一项（useAuxItem(itemKey)）
 *   面板不再订阅整个 items，订阅下沉到行；改一行只让该行重渲染，
 *   同一节点下其他辅助行连 render 都不会被调用。
 *
 * memo 生效的前提（面板侧需配合）：
 *   - aux / setItemValue 稳定引用；formulaCtx 只在 aux.formula 存在时传入
 *   - itemKey 由 aux.id ?? aux.row 推导，引用稳定（字符串）
 *
 * 锚点：isFirst 为 true 时渲染 id=anchorId，供主要面板点击节点后
 *       scrollIntoView 定位到本组辅助项首行。
 * ============================================================
 * @param {Object}   props.aux          辅助项定义（{ id, row, name, desc, formula }）
 * @param {string}   props.itemKey      items 里的 key（`aux-${aux.id ?? aux.row}`）
 * @param {string}   [props.anchorId]   首行的滚动锚点 id（非首行不传）
 * @param {Object}   [props.formulaCtx] 公式求值上下文（仅当 aux.formula 存在时传入）
 * @param {Function} props.setItemValue 写入单项字段 (itemKey, field, value) => void
 * ============================================================
 */
export default memo(function AuxiliaryCheckItem({ aux, itemKey, anchorId, formulaCtx, setItemValue }) {
    // 只订阅自己那一项：其他辅助项填写时本行不重渲染
    const item = useAuxItem(itemKey);
    const data = item || {};

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

            {/* 实际时间（年月日 + 时分）+ 备注 */}
            <div className="mt-1.5 flex flex-row items-start  gap-2">
                <label className="flex flex-row items-center shrink-0 gap-2 text-[14px] text-blue-500">
                    实际时间
                    <input
                        type="datetime-local"
                        className="input flex-1 px-1.5 py-0.5 "
                        value={data.time || ""}
                        onChange={(e) => {
                            setItemValue(itemKey, "time", e.target.value);
                            setItemValue(itemKey, "auto", false); // 手动输入 → 取消自动标记
                        }}
                    />
                </label>
                <textarea
                    className="input flex-1 resize-y px-1.5 py-0.5 "
                    rows={2}
                    placeholder="备注（可换行）"
                    value={data.note || ""}
                    onChange={(e) => setItemValue(itemKey, "note", e.target.value)}
                />
            </div>
        </div>
    );
});
