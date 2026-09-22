import { useMemo, useSyncExternalStore } from "react";
import FlowChart from "../../../../../pages/FipsPage/flowchart/FlowChart";
import DraggableThumb from "./DraggableThumb";
import { useChecklistStore } from "../../../../../store/checklistStore";
// 填写数据在 checklistDraft（内存 + IndexedDB）：订阅 version 数字，statusMap 计算时现读
import {
  getSnapshot as getDraftSnapshot,
  subscribeDraft,
  getDraftVersion,
} from "../../../../../store/checklistDraft";

/**
 * ============================================================
 * FlowStatusView —— 流程图 / 右下角小地图的「状态订阅容器」
 * ------------------------------------------------------------
 * 流程图与小地图都需要 statusMap（节点 → done / current / todo），
 * 而 statusMap 依赖草案填写。若在编辑器里算，编辑器就得订阅填写数据，
 * 于是"填任何一项 → 整页重渲染"。
 *
 * 因此把这次订阅下沉到这两个小组件：
 *   - 只有真的切到流程图 / 打开小地图时才挂载，订阅窗口极短
 *   - 编辑器本身始终不订阅填写数据
 *
 * 订阅方式：只订阅 checklistDraft 的 version 数字（任何填写改动 +1），
 * statusMap 在 useMemo 里经 getSnapshot() 现读。
 *
 * ★ 非受控：nodes / 选中节点 / 选中动作全部自己从 store 取，
 *   父级只传"页面级行为"回调（切回表单视图、打开独立页、关闭小窗）。
 * ============================================================
 */

/** 节点状态映射：ok → done；abnormal / na → current；其余 → todo（由使用方兜底） */
function useStatusMap(nodes) {
    const draftVersion = useSyncExternalStore(subscribeDraft, getDraftVersion, getDraftVersion);
    return useMemo(() => {
        const items = getDraftSnapshot().items;
        const map = {};
        (nodes || []).forEach((n) => {
            const nid = n.uuid;
            const st = items[`main-${nid}`]?.status;
            if (st === "ok") map[nid] = "done";
            else if (st === "abnormal" || st === "na") map[nid] = "current";
        });
        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodes, draftVersion]);
}

/** 节点集 + 选中态（都来自 store，切换检查单类型时自动跟随） */
function useFlowSource() {
    const template = useChecklistStore((s) => s.template);
    const selectedCheckNode = useChecklistStore((s) => s.selectedCheckNode);
    const setSelectedCheckNode = useChecklistStore((s) => s.setSelectedCheckNode);
    return { nodes: template?.schema || [], selectedCheckNode, setSelectedCheckNode };
}

/**
 * 全屏流程图视图
 * @param {Function} [props.onSelect] 选中节点后的额外回调（如切回检查项视图）
 */
export function MainFlowView({ onSelect }) {
    const { nodes, selectedCheckNode, setSelectedCheckNode } = useFlowSource();
    const statusMap = useStatusMap(nodes);
    return (
        <FlowChart
            nodes={nodes}
            statusMap={statusMap}
            currentStep={selectedCheckNode}
            size="full"
            onSelect={(n) => {
                setSelectedCheckNode(n.uuid);
                onSelect?.(n);
            }}
        />
    );
}

/**
 * 右下角可拖拽小地图
 * @param {Function} [props.onSelectNode] 选中节点后的额外回调（如切回检查项视图）
 * @param {Function} props.onOpenFull 打开独立流程图页
 * @param {Function} props.onClose    关闭小窗
 */
export function FlowThumbView({ onSelectNode, onOpenFull, onClose }) {
    const { nodes, selectedCheckNode, setSelectedCheckNode } = useFlowSource();
    const statusMap = useStatusMap(nodes);
    return (
        <DraggableThumb
            nodes={nodes}
            statusMap={statusMap}
            currentStep={selectedCheckNode}
            onSelectNode={(n) => {
                setSelectedCheckNode(n.uuid);
                onSelectNode?.(n);
            }}
            onOpenFull={onOpenFull}
            onClose={onClose}
        />
    );
}
