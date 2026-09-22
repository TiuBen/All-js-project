import { useEffect } from "react";
import { ListChecks } from "lucide-react";
import AuxiliaryCheckItem from "./AuxiliaryCheckItem";
import { useChecklistStore } from "../../../../../store/checklistStore";

/**
 * ============================================================
 * AuxiliaryPanel —— 辅助监控指标面板（填写模式）
 * ------------------------------------------------------------
 * 展示当前选中节点的全部辅助监控指标（type: time）：
 *   单项行由 AuxiliaryCheckItem 渲染（状态图标 / 描述 / 系统计算时间 /
 *   实际时间 / 备注）；首个辅助项带滚动锚点，选中节点后自动定位。
 *
 * ★ 数据源由所属面板组显式声明
 *   `<AuxiliaryPanel source={cargoBypassFlight} />`
 *   节点集 = source.schema（与主要面板同一份，用于定位选中节点）。
 *
 * ★ 其余自己管
 *   - 选中节点订阅 `selectedCheckNode` → 自己算出 activeNode
 *   - 锚点滚动自己做 effect（不需要父级传 ref）
 *   - 公式上下文 / 写入由 AuxiliaryCheckItem 自己取
 *   - **不订阅 items**：每行数据由 AuxiliaryCheckItem 自己按 itemKey 订阅
 * ============================================================
 * @param {Object|string} props.source 本类型的静态模板（或其在 utils 中的导出名）
 * ============================================================
 */
export default function AuxiliaryPanel({ source }) {
    const selectedCheckNode = useChecklistStore((s) => s.selectedCheckNode);
    const nodes = source?.schema || [];

    // 当前激活的节点：选中项优先，未选中时回落第一个节点（顺航等空模板 → null）
    const activeNode = nodes.find((n) => n.uuid === selectedCheckNode) || nodes[0] || null;
    // uuid 只作定位用；界面序号另取数组下标（uuid 太长不能展示）
    const activeNodeId = activeNode?.uuid ?? null;
    const activeIndex = activeNode ? nodes.indexOf(activeNode) : -1;

    // 选中节点变化 → 滚到该组辅助项首行的锚点
    useEffect(() => {
        if (activeNodeId === null) return;
        const el = document.getElementById(`aux-anchor-${activeNodeId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [activeNodeId]);

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
                        {activeIndex + 1}. {activeNode.name}
                    </span>
                )}
            </div>

            {/* 辅助项列表 */}
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                {activeNode ? (
                    activeNode.auxiliaries?.length ? (
                        activeNode.auxiliaries.map((a, ai) => (
                            <AuxiliaryCheckItem
                                key={`aux-${a.uuid}`}
                                aux={a}
                                // 仅首个辅助项带锚点：选中节点后 scrollIntoView 定位
                                anchorId={ai === 0 ? `aux-anchor-${activeNodeId}` : undefined}
                            />
                        ))
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
