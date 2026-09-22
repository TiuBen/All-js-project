import { cn } from "../../../../../../lib/utils";
import { useChecklistStore } from "../../../../../../store/checklistStore";

/**
 * ============================================================
 * PanelSwitcher —— 列显隐多选分段控制器（模仿 iOS Segmented Control，但可多选）
 * ------------------------------------------------------------
 * 目录：ChecklistPage/ChecklistEditor/Components/ToolBar/Components/PanelSwitcher.jsx
 * ------------------------------------------------------------
 * ★ **零 props**：选项与动作全部走 useChecklistStore
 *     - panels                    当前可见列（main/aux/video 的子集，持久化）
 *     - togglePanel(key)          切换某列显隐（面板组按 panels 过滤 columns）
 *
 * ★ 不做 disabled：某类型没有对应列（如顺航无辅助节点）时更应允许切到"不显示"，
 *   空列由面板组的空态 / ResizableColumns 的 falsy 过滤兜底。
 * ★ 切换守卫在 **store 的 togglePanel 内**（关最后一列无效 / 非法 key 忽略），
 *   本组件不写中转逻辑，点击直接 `togglePanel(key)`。
 *   选中：白底 + 阴影（iOS 风格），未选中：透明浅灰。
 * ============================================================
 */
export default function PanelSwitcher({ className }) {
    // ===== 订阅 store（细粒度 selector）=====
    const panels = useChecklistStore((s) => s.panels); // 可见列（main/aux/video 的子集）
    const togglePanel = useChecklistStore((s) => s.togglePanel); // create() 时定义一次，引用永久稳定

    const options = [
        { key: "main", label: "主要" },
        { key: "aux", label: "辅助" },
        { key: "video", label: "视频" },
    ];

    return (
        <div
            title="可切换列显示 · 拖拽分隔条可调宽度"
            className={cn(
                "inline-flex items-center rounded-lg border border-slate-300 bg-slate-200/70 p-1 gap-1",
                className
            )}
        >
            {options.map((o) => {
                const selected = panels.includes(o.key);
                return (
                    <button
                        key={o.key}
                        type="button"
                        onClick={() => togglePanel(o.key)}
                        className={cn(
                            "rounded-md px-3.5 py-1 text-[13px] font-medium transition-all duration-150",
                            selected
                                ? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/80"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}
