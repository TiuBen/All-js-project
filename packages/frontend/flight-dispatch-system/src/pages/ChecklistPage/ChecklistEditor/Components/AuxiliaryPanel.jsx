import { ListChecks } from "lucide-react";
import AuxiliaryCheckItem from "./AuxiliaryCheckItem";

/**
 * ============================================================
 * AuxiliaryPanel —— 辅助监控指标面板（填写模式）
 * ------------------------------------------------------------
 * 展示当前激活节点的全部辅助监控指标（type: time）：
 *   单项行由 AuxiliaryCheckItem 渲染（状态下拉 / 描述 / 系统计算时间 /
 *   实际时间 / 备注）；首个辅助项带滚动锚点，供主要面板点击节点后定位。
 *
 * 本组件只负责标题栏、空态与列表容器，条目展示下沉到
 * 同目录的 AuxiliaryCheckItem（memo 化，见其注释）。
 *
 * ★ 渲染性能：本面板**不订阅 items**
 *   每行数据由 AuxiliaryCheckItem 自己按 itemKey 订阅（useAuxItem），
 *   改一行只重渲染那一行，面板本身保持静止。
 * ============================================================
 * @param {Object|null} activeNode   当前激活节点（无则显示占位提示）
 * @param {string|number} activeNodeId 当前激活节点 id
 * @param {Object}   formulaCtx      公式求值上下文（引用稳定，见 useTimeFormulas）
 * @param {Ref}      panelRef        挂内容区（聚焦时滚回顶部）
 * @param {Function} setItemValue    写入单项字段（store 方法，引用稳定）
 * ============================================================
 */
export default function AuxiliaryPanel({ activeNode, activeNodeId, formulaCtx, panelRef, setItemValue }) {

    return (
        <div className="flex h-full min-w-0 flex-col rounded-lg border border-slate-300 bg-white">
            {/* 标题栏 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-600">
                    <ListChecks size={13} className="text-primary-600" />
                    辅助监控指标
                    <span className="text-[12px] font-normal text-slate-400 ">
                        {activeNode?.auxiliaries?.length || 0} 项
                    </span>
                </div>
                {activeNode && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[12px] font-medium text-amber-800">
                        {activeNodeId}. {activeNode.name}
                    </span>
                )}
            </div>

            {/* 辅助项列表 */}
            <div ref={panelRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                {activeNode ? (
                    activeNode.auxiliaries?.length ? (
                        activeNode.auxiliaries.map((a, ai) => {
                            const aKey = `aux-${a.id ?? a.row}`;
                            return (
                                <AuxiliaryCheckItem
                                    key={aKey}
                                    aux={a}
                                    itemKey={aKey}
                                    // 仅首个辅助项带锚点：主要面板点击节点后 scrollIntoView 定位
                                    anchorId={ai === 0 ? `aux-anchor-${activeNodeId}` : undefined}
                                    // 只有带公式的项需要求值上下文；其引用稳定，不会破坏其他行的 memo
                                    formulaCtx={a.formula ? formulaCtx : undefined}
                                    setItemValue={setItemValue}
                                />
                            );
                        })
                    ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                            该节点无辅助监控指标
                        </div>
                    )
                ) : (
                    <div className="py-6 text-center text-sm text-slate-400">点击左侧节点查看</div>
                )}
            </div>
        </div>
    );
}
