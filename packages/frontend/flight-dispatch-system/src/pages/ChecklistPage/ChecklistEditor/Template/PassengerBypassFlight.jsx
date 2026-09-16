import { useCallback } from "react";
import ResizableColumns from "../../CommonComponents/ResizableColumns";
import MainMonitoringPanel from "../Components/MainMonitoringPanel";
import AuxiliaryPanel from "../Components/AuxiliaryPanel";
import VideoPanel from "../Components/VideoPanel";
// 本检查单专属数据：模板 + 视频监管（编译期静态导入，不请求后端）
// 约定：模板导出标识符 = 文件名（passengerBypassFlight）；视频监管用大写下划线常量
import passengerBypassFlight from "../../utils/passengerBypassFlight";
import { PASSENGER_VIDEO_FOCUS } from "../../utils/passengerVideoFocus";
import { useChecklistStore } from "../../../../store/checklistStore";

/**
 * ============================================================
 * PassengerBypassFlight —— 客运过站航班 检查单面板组
 * ------------------------------------------------------------
 * 「穷举法」：一个检查单类型 = 一个组件，模板与视频监管都在本文件顶部
 * **静态 import**，编译期即确定，不做任何按 category 的运行时查找。
 *
 * 本组件只负责三列面板（主要 / 辅助 / 视频）的内容，
 * 工具栏、流程图全屏、右下角小地图仍由 ChecklistEditor/index.jsx 统一渲染。
 *
 * ★ currentStep / formulaCtx 由 index.jsx 以 props 传入；
 *   填写数据（items / videoItems）走全局 store，逐项订阅下沉在卡片/行内部。
 *   本组件**不订阅 items / videoItems**，只订阅 setItemValue（引用稳定）。
 * ★ 客运模板的节点无 auxiliaries（辅助列为空），AuxiliaryPanel 会自行显示空态。
 * ============================================================
 * @param {Object}   props.flight      航班对象
 * @param {Object}   props.template    当前模板（= 客运过站航班）
 * @param {string|number} props.currentStep    当前聚焦节点 id
 * @param {Object}   props.formulaCtx  公式求值上下文（引用稳定）
 * @param {Function} props.getNodeId   节点取 id 的方法（引用稳定）
 * @param {Function} props.onFocusNode 聚焦节点回调（引用稳定）
 * @param {Ref}      props.auxPanelRef   辅助面板内容区
 * @param {Ref}      props.videoPanelRef 视频面板内容区
 * ============================================================
 */
export default function PassengerBypassFlight({
    flight,
    template,
    currentStep,
    formulaCtx,
    getNodeId,
    onFocusNode,
    auxPanelRef,
    videoPanelRef,
}) {
    // 节点集用本文件静态 import 的模板（穷举法，类型固定）
    const nodes = passengerBypassFlight?.schema || [];

    // 视频监管项数（客运版：applicable="客运" 的条目在这里**要显示**，不过滤）
    const videoTotal = (PASSENGER_VIDEO_FOCUS.groups || []).reduce(
        (s, g) => s + (g.items || []).length,
        0
    );

    const focusNode = useCallback(
        (n) => {
            const nid = getNodeId(n);
            useChecklistStore.getState().setCurrentStep(nid);
            onFocusNode?.(n, {
                auxCount: n.auxiliaries?.length || 0,
                videoCount: videoTotal,
            });
            if (auxPanelRef?.current) {
                const el = document.getElementById(`aux-anchor-${nid}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
            if (videoPanelRef?.current) {
                videoPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getNodeId, onFocusNode]
    );

    const activeNode = nodes.find((n) => getNodeId(n) === currentStep) || nodes[0] || null;
    const activeNodeId = activeNode ? getNodeId(activeNode) : null;

    const setItemValue = useChecklistStore((s) => s.setItemValue);

    return (
        <ResizableColumns
            className="min-h-0 flex-1"
            columns={[
                {
                    key: "main",
                    content: (
                        <MainMonitoringPanel
                            nodes={nodes}
                            currentStep={currentStep}
                            formulaCtx={formulaCtx}
                            getNodeId={getNodeId}
                            onFocusNode={focusNode}
                            setItemValue={setItemValue}
                        />
                    ),
                },
                {
                    key: "aux",
                    content: (
                        <AuxiliaryPanel
                            activeNode={activeNode}
                            activeNodeId={activeNodeId}
                            formulaCtx={formulaCtx}
                            panelRef={auxPanelRef}
                            setItemValue={setItemValue}
                        />
                    ),
                },
                {
                    key: "video",
                    content: (
                        <VideoPanel
                            videoFocus={PASSENGER_VIDEO_FOCUS}
                            category={passengerBypassFlight?.category ?? template?.category}
                            panelRef={videoPanelRef}
                        />
                    ),
                },
            ]}
        />
    );
}
