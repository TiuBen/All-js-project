import { useMemo } from "react";
import FlowChart from "../../../../components/flowchart/FlowChart";
import DraggableThumb from "../../CommonComponents/DraggableThumb";
import { useChecklistStore } from "../../../../store/checklistStore";

/**
 * ============================================================
 * FlowStatusView —— 流程图 / 右下角小地图的「状态订阅容器」
 * ------------------------------------------------------------
 * 流程图与小地图都需要 statusMap（节点 → done / current / todo），
 * 而 statusMap 依赖 items。若在编辑器里算，编辑器就得订阅 items，
 * 于是"填任何一项 → 整页重渲染"。
 *
 * 因此把这次订阅下沉到这两个小组件：
 *   - 只有真的切到流程图 / 打开小地图时才挂载，订阅窗口极短
 *   - 编辑器本身始终不订阅 items
 * ============================================================
 */

/** 节点状态映射：ok → done；abnormal / na → current；其余 → todo（由使用方兜底） */
function useStatusMap(nodes, getNodeId) {
    const items = useChecklistStore((s) => s.items);
    return useMemo(() => {
        const map = {};
        (nodes || []).forEach((n) => {
            const nid = getNodeId(n);
            const st = items[`main-${nid}`]?.status;
            if (st === "ok") map[nid] = "done";
            else if (st === "abnormal" || st === "na") map[nid] = "current";
        });
        return map;
    }, [nodes, items, getNodeId]);
}

/** 全屏流程图视图 */
export function MainFlowView({ nodes, getNodeId, currentStep, onSelect }) {
    const statusMap = useStatusMap(nodes, getNodeId);
    return (
        <FlowChart nodes={nodes} statusMap={statusMap} currentStep={currentStep} size="full" onSelect={onSelect} />
    );
}

/** 右下角可拖拽小地图 */
export function FlowThumbView({ nodes, getNodeId, currentStep, onSelectNode, onOpenFull, onClose }) {
    const statusMap = useStatusMap(nodes, getNodeId);
    return (
        <DraggableThumb
            nodes={nodes}
            statusMap={statusMap}
            currentStep={currentStep}
            onSelectNode={onSelectNode}
            onOpenFull={onOpenFull}
            onClose={onClose}
        />
    );
}
