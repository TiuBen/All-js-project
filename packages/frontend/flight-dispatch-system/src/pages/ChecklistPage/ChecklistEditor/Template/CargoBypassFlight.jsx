import { useCallback } from "react";
import ResizableColumns from "../../CommonComponents/ResizableColumns";
import MainMonitoringPanel from "../Components/MainMonitoringPanel";
import AuxiliaryPanel from "../Components/AuxiliaryPanel";
import VideoPanel from "../Components/VideoPanel";
// 本检查单专属数据：模板 + 视频监管（编译期静态导入，不请求后端）
// 约定：模板导出标识符 = 文件名（cargoBypassFlight）；视频监管用大写下划线常量
import cargoBypassFlight from "../../utils/cargoBypassFlight";
import { CARGO_VIDEO_FOCUS } from "../../utils/cargoVideoFocus";
import { useChecklistStore } from "../../../../store/checklistStore";

/**
 * ============================================================
 * CargoBypassFlight —— 货运过站航班 检查单面板组
 * ------------------------------------------------------------
 * 「穷举法」：一个检查单类型 = 一个组件，模板与视频监管都在本文件顶部
 * **静态 import**，编译期即确定，不做任何按 category 的运行时查找。
 *
 * 本组件只负责三列面板（主要 / 辅助 / 视频）的内容，
 * 工具栏、流程图全屏、右下角小地图仍由 ChecklistEditor/index.jsx 统一渲染
 * （它们与检查单类型无关，放在这里会四处重复）。
 *
 * ★ currentStep / formulaCtx 由 index.jsx 以 props 传入
 *   这两个状态与"当前检查单类型"无关，留在 index.jsx 一处维护，
 *   本组件只消费。填写数据（items / videoItems）仍走全局 store，
 *   逐项订阅下沉在卡片/行内部（MainCheckItem / AuxiliaryCheckItem / VideoCheckItem）。
 *
 * 渲染性能（与 index.jsx 同一套约定，不要破坏）：
 *   - 本组件**不订阅 items / videoItems**，只订阅 currentStep（决定卡片高亮）
 *   - nodes 变更才重算 formulaCtx 依赖；formulaCtx 引用稳定 → 卡片 memo 命中
 * ============================================================
 * @param {Object}   props.flight      航班对象（公式取机型 / 落地时间等）
 * @param {Object}   props.template    当前模板（由 index.jsx 传入，= 货运过站航班）
 * @param {string|number} props.currentStep    当前聚焦节点 id
 * @param {Object}   props.formulaCtx  公式求值上下文（引用稳定）
 * @param {Function} props.getNodeId   节点取 id 的方法（引用稳定）
 * @param {Function} props.onFocusNode 聚焦节点回调（引用稳定）
 * @param {Ref}      props.auxPanelRef   辅助面板内容区（聚焦时滚动锚点）
 * @param {Ref}      props.videoPanelRef 视频面板内容区（聚焦时滚回顶部）
 * ============================================================
 */
export default function CargoBypassFlight({
    flight,
    template,
    currentStep,
    formulaCtx,
    getNodeId,
    onFocusNode,
    auxPanelRef,
    videoPanelRef,
}) {
    // 本检查单节点集：优先用本文件静态 import 的模板（穷举法，类型固定），
    // 兜底再取 props.template（两者内容一致，props 仅用于 category 等元信息）
    const nodes = (cargoBypassFlight ?? template)?.schema || [];

    // 视频监管项数（本组件自带的那一份，非客运模板自动隐藏 applicable="客运" 条目）
    // ⚠️ 必须定义在 focusNode 之前：focusNode 的 useCallback 闭包内引用了它，
    //    若写在后面，首次调用会命中 const 的 TDZ（块级作用域不提升）。
    const videoTotal = (CARGO_VIDEO_FOCUS.groups || []).reduce(
        (s, g) => s + (g.items || []).filter((it) => it.applicable !== "客运").length,
        0
    );

    // 聚焦节点：更新步骤 + 辅助栏锚点 + 视频栏滚顶（带自己那一份的数据，无需 index 透传）
    const focusNode = useCallback(
        (n) => {
            const nid = getNodeId(n);
            useChecklistStore.getState().setCurrentStep(nid);
            onFocusNode?.(n, {
                auxCount: n.auxiliaries?.length || 0,
                videoCount: videoTotal,
            });
            // 辅助项滚动到锚点（主要监控不自动滚动，用户手动用滚轮平移；辅助面板隐藏时跳过）
            if (auxPanelRef?.current) {
                const el = document.getElementById(`aux-anchor-${nid}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
            // 视频栏：视频监管项为全局分组列表，滚动到面板顶部
            if (videoPanelRef?.current) {
                videoPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
            }
        },
        // videoTotal 由静态 import 的数据算出，每次渲染相等，无需进依赖
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getNodeId, onFocusNode]
    );

    // 当前激活的节点（辅助栏标题/列表由此驱动）
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
                        // 视频监管数据是本文件静态 import 的 CARGO_VIDEO_FOCUS；
                        // 每条视频项自行订阅 store（useVideoCheckItem / set_vCheckIdN），此处不传 videoItems
                        <VideoPanel
                            videoFocus={CARGO_VIDEO_FOCUS}
                            category={cargoBypassFlight?.category ?? template?.category}
                            panelRef={videoPanelRef}
                        />
                    ),
                },
            ]}
        />
    );
}
