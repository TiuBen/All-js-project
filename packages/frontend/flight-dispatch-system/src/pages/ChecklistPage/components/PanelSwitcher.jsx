import { cn } from "../../../lib/utils";

/**
 * ============================================================
 * PanelSwitcher —— 多选分段控制器（模仿 iOS Segmented Control，但可多选）
 * ------------------------------------------------------------
 * 三个按钮（主要 / 辅助 / 视频）可独立切换选中态：
 *   - 选中：白底 + 阴影（iOS 风格），未选中：透明浅灰
 *   - disabled：变灰不可点（客运无辅助节点时"辅助"禁用）
 *   - 至少保留一个选中（全部取消时最后一项忽略）
 * ============================================================
 * @param {Array}  options  [{ key, label, disabled? }]
 * @param {Array}  value    当前选中的 key 数组（如 ["main","aux","video"]）
 * @param {Function} onChange (key) 切换单个按钮的选中状态
 */
export default function PanelSwitcher({ options = [], value = [], onChange, className }) {
    const toggle = (key, disabled) => {
        if (disabled) return;
        const selected = value.includes(key);
        // 至少保留一个面板
        if (selected && value.length === 1) return;
        onChange(key);
    };

    return (
        <div
            className={cn(
                "inline-flex items-center gap-0.5 rounded-lg border border-slate-300 bg-slate-200/70 p-0.5",
                className
            )}
        >
            {options.map((o) => {
                const selected = value.includes(o.key);
                return (
                    <button
                        key={o.key}
                        type="button"
                        disabled={o.disabled}
                        title={o.disabled ? o.disabledTitle : ""}
                        onClick={() => toggle(o.key, o.disabled)}
                        className={cn(
                            "rounded-md px-3.5 py-1 text-[13px] font-medium transition-all duration-150",
                            selected
                                ? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/80"
                                : "text-slate-500 hover:text-slate-700",
                            o.disabled && "cursor-not-allowed opacity-40 hover:text-slate-500"
                        )}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}
