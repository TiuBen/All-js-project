import { useCallback } from "react";
import ResizableColumns from "../../CommonComponents/ResizableColumns";
import MainMonitoringPanel from "../Components/MainMonitoringPanel";
import AuxiliaryPanel from "../Components/AuxiliaryPanel";
import VideoPanel from "../Components/VideoPanel";
// 本检查单专属数据：模板 + 视频监管（编译期静态导入，不请求后端）
// 约定：模板导出标识符 = 文件名（shunhangFlight）；视频监管用大写下划线常量
import shunhangFlight from "../../utils/shunhangFlight";
import { SHUNHANG_VIDEO_FOCUS } from "../../utils/shunhangVideoFocus";
import { useChecklistStore } from "../../../../store/checklistStore";

/**
 * ============================================================
 * ShunhangFlight —— 顺航检查单 面板组
 * ------------------------------------------------------------
 * 「穷举法」：一个检查单类型 = 一个组件，模板与视频监管都在本文件顶部
 * **静态 import**，编译期即确定，不做任何按 category 的运行时查找。
 *
 * 本组件只负责三列面板（主要 / 辅助 / 视频）的内容，
 * 工具栏、流程图全屏、右下角小地图仍由 ChecklistEditor/index.jsx 统一渲染。
 *
 * ★ 本类型的特殊之处：**模板是占位模板，schema 为空**
 *   后端 data/checklists 里顺航只有视频监管数据（4 组 42 条），
 *   没有节点保障模板。为避免 `loadTemplate("顺航检查单")` 查表得 null 抛错
 *   （CSS 前缀航班会默认落到顺航），在 utils/ 下手工建了 shunhangFlight.js 占位。
 *   因此当前：
 *     - 主监控列 / 辅助监控列 → 各面板自行显示空态
 *     - 视频监管列 → 正常展示 42 条顺航专属条目
 *   拿到顺航真实节点清单后，填进 `utils/shunhangFlight.js` 的 schema 即可，
 *   本组件**无需改动**。
 *
 * ★ currentStep / formulaCtx 由 index.jsx 以 props 传入；
 *   填写数据（items / videoItems）走全局 store，逐项订阅下沉在卡片/行内部。
 *   本组件**不订阅 items / videoItems**，只订阅 setItemValue（引用稳定）。
 * ============================================================
 * @param {Object}   props.flight      航班对象
 * @param {Object}   props.template    当前模板（= 顺航检查单，schema 暂为空）
 * @param {string|number} props.currentStep    当前聚焦节点 id
 * @param {Object}   props.formulaCtx  公式求值上下文（引用稳定）
 * @param {Function} props.getNodeId   节点取 id 的方法（引用稳定）
 * @param {Function} props.onFocusNode 聚焦节点回调（引用稳定）
 * @param {Ref}      props.auxPanelRef   辅助面板内容区
 * @param {Ref}      props.videoPanelRef 视频面板内容区
 * ============================================================
 */
export default function ShunhangFlight({
    flight,
    template,
    currentStep,
    formulaCtx,
    getNodeId,
    onFocusNode,
    auxPanelRef,
    videoPanelRef,
}) {
    // 节点集用本文件静态 import 的模板（穷举法，类型固定；顺航当前为空数组）
    const nodes = shunhangFlight?.schema || [];

    // 视频监管项数：顺航是**独立一份**，不含 applicable="客运" 的廊桥/桥载条目，
    // 因此过滤口径与 VideoPanel 保持一致（当前即全量 42 条）
    const videoTotal = (SHUNHANG_VIDEO_FOCUS.groups || []).reduce(
        (s, g) => s + (g.items || []).filter((it) => it.applicable !== "客运").length,
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
        // videoTotal 由静态 import 的数据算出，每次渲染相等，无需进依赖
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getNodeId, onFocusNode]
    );

    // schema 为空时 activeNode 为 null → AuxiliaryPanel 显示空态
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
                        // 视频监管数据是本文件静态 import 的 SHUNHANG_VIDEO_FOCUS（42 条）；
                        // 每条视频项自行订阅 store，此处不传 videoItems
                        <VideoPanel
                            videoFocus={SHUNHANG_VIDEO_FOCUS}
                            category={shunhangFlight?.category ?? template?.category}
                            panelRef={videoPanelRef}
                        />
                    ),
                },
            ]}
        />
    );
}
