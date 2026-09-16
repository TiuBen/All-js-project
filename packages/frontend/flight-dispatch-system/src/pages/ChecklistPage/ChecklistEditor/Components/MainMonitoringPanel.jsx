import { useCallback, useRef } from "react";
import { ListChecks } from "lucide-react";
import MainCheckItem from "./MainCheckItem";
import { useChecklistStore } from "../../../../store/checklistStore";

/**
 * ============================================================
 * MainMonitoringPanel —— 主要监控指标面板（填写模式）
 * ------------------------------------------------------------
 * 顶部标题栏 + 节点纵向流（卡片本身由 MainCheckItem 渲染）：
 *   - 内容超宽时出现横向滚动条，鼠标滚轮上下 → 水平移动
 *   - 点击卡片聚焦节点（focusNode 联动辅助/视频锚点 + banner）
 *
 * 本组件只负责容器/滚动/锚点等布局职责，单张卡片的展示与交互
 * 全部下沉到同目录的 MainCheckItem（memo 化，见其注释）。
 *
 * 渲染性能：
 *   面板**自行订阅 items**（而不是由编辑器透传）。编辑器因此不必订阅 items，
 *   改一项时只有本面板重渲染；卡片 props 里未改动项的 item 仍是原引用、
 *   formulaCtx 引用稳定 → memo 命中，只有被编辑的那张卡真正重渲染。
 * ============================================================
 * @param {Array}    nodes        主监控节点数组
 * @param {string|number} currentStep 当前聚焦节点 id
 * @param {Object}   formulaCtx   公式求值上下文（引用稳定，见 useTimeFormulas）
 * @param {Function} getNodeId    节点取 id 的方法
 * @param {Function} onFocusNode  聚焦节点回调（需稳定引用）
 * @param {Function} setItemValue 写入单项字段（store 方法，引用稳定）
 * ============================================================
 */
export default function MainMonitoringPanel({
    nodes,
    currentStep,
    formulaCtx,
    getNodeId,
    onFocusNode,
    setItemValue,
}) {
    const items = useChecklistStore((s) => s.items); // 逐项填写数据（keyed by `main-{nodeId}`）
    const mainTableRef = useRef(null); // 横向滚动容器（滚轮 → 水平移动）

    // 滚轮横滚：内容横向溢出时 preventDefault + scrollBy smooth
    const onWheel = useCallback((e) => {
        const el = mainTableRef.current;
        if (!el) return;
        if (el.scrollWidth > el.clientWidth + 1) {
            e.preventDefault();
            el.scrollBy({ left: e.deltaY, behavior: "smooth" });
        }
    }, []);

    // callback ref：元素挂载/卸载自动绑定/解绑（避免视图切换后 handler 丢失）
    const setMainTableRef = useCallback(
        (el) => {
            if (mainTableRef.current) mainTableRef.current.removeEventListener("wheel", onWheel);
            mainTableRef.current = el;
            if (el) el.addEventListener("wheel", onWheel, { passive: false });
        },
        [onWheel]
    );

    return (
        <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-slate-300 bg-white">
            {/* 标题栏 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <ListChecks size={13} className="text-primary-600" />
                    主要监控指标
                </div>
                <span className="text-[10px] text-slate-400">{nodes.length} 节点</span>
            </div>

            {/* 节点流：超宽出现横向滚动条，滚轮上下 → 水平移动 */}
            <div ref={setMainTableRef} className="min-h-0 flex-1 overflow-auto">
                <div className="flex  flex-col items-stretch gap-2 p-2">
                    {nodes.map((n, index) => {
                        const nid = getNodeId(n);
                        return (
                            <MainCheckItem
                                key={`main-${nid}`}
                                node={n}
                                index={index}
                                nodeId={nid}
                                // 传原始引用（勿写 || {}）：未填写时由组件内部兜底，否则每次新对象会让 memo 失效
                                item={items[`main-${nid}`]}
                                isActive={currentStep === nid}
                                // 只有带公式的节点需要求值上下文；其引用稳定，不会破坏其他卡片的 memo
                                formulaCtx={n.formula ? formulaCtx : undefined}
                                onFocusNode={onFocusNode}
                                setItemValue={setItemValue}
                            />
                        );
                    })}
                    {nodes.length === 0 && (
                        <div className="px-3 py-8 text-center text-slate-400">该航班类型的检查单暂未配置</div>
                    )}
                </div>
            </div>
        </div>
    );
}
