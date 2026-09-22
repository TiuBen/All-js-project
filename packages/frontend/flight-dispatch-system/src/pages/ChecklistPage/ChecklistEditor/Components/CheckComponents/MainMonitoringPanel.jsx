import { useCallback, useRef } from "react";
import { ListChecks } from "lucide-react";
import MainCheckItem from "./MainCheckItem";

/**
 * ============================================================
 * MainMonitoringPanel —— 主要监控指标面板（填写模式）
 * ------------------------------------------------------------
 * 顶部标题栏 + 节点纵向流（卡片本身由 MainCheckItem 渲染）：
 *   - 内容超宽时出现横向滚动条，鼠标滚轮上下 → 水平移动
 *   - 点击卡片选中节点（写入 store.selectedCheckNode，辅助栏/流程图自动跟随）
 *
 * ★ 数据源由所属面板组显式声明
 *   `<MainMonitoringPanel source={cargoBypassFlight} />`
 *   source 就是面板组顶部**静态 import** 的那份模板（编译期确定、零网络），
 *   节点集 = source.schema（source 由面板组静态 import 后传入，必然存在）。
 *
 * ★ 本面板**不订阅 items / selectedCheckNode**
 *   内容与高亮全部由 MainCheckItem 自己订阅，因此选中某张卡时
 *   nodes.map 不会重跑，其余卡片连 props diff 都不做。
 * ============================================================
 * @param {Object|string} props.source 本类型的静态模板（或其在 utils 中的导出名）
 * ============================================================
 */
export default function MainMonitoringPanel({ source }) {
    const mainTableRef = useRef(null); // 横向滚动容器（滚轮 → 水平移动）

    const nodes = source?.schema || [];

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
                    {nodes.map((n, index) => (
                        <MainCheckItem key={`main-${n.uuid}`} node={n} index={index} />
                    ))}
                    {nodes.length === 0 && (
                        <div className="px-3 py-8 text-center text-slate-400">该航班类型的检查单暂未配置</div>
                    )}
                </div>
            </div>
        </div>
    );
}
