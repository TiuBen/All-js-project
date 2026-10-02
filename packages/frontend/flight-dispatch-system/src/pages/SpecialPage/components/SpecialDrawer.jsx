import { ClipboardCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../lib/utils";

/**
 * ============================================================
 * SpecialDrawer —— 生鲜保障页右侧可收缩抽屉（外壳）
 * ------------------------------------------------------------
 * 结构：主线内容是「[主区] [贴边书签开关] [抽屉面板]」三个横向排列的块。
 *   - 开关是**常驻的贴边书签**：抽屉收起时零距离贴在页面右边，
 *     展开时自动贴到抽屉左边缘（靠 flex 顺序，不用绝对定位，不会被裁）
 *   - 抽屉面板用「外层动画宽度 + 内层固定宽度 + overflow-hidden」实现滑出，
 *     内层 ml-auto 让右边缘钉住，视觉上是**往右滑出**而不是被从右往左抹掉
 *
 * ★ 只负责外壳与开关，内容由 children 决定（本页放 SpecialChecklist）。
 *
 * @param {boolean}  open       是否展开
 * @param {Function} onToggle   点击书签开关
 * @param {string}   title      抽屉标题
 * @param {string}   [subtitle] 标题右侧小字（如当前航班）
 * @param {string}   [badge]    书签上显示的进度文字，如「3/15」
 * @param {string}   [hint]     书签 title 提示
 * @param {number}   [width]    展开宽度，默认 380
 * @param {React.ReactNode} children
 * ============================================================
 */
export default function SpecialDrawer({ open, onToggle, title, subtitle, badge, hint, width = 380, children }) {
    return (
        <>
            {/* ---------- 贴边书签开关 ---------- */}
            <button
                onClick={onToggle}
                className={cn(
                    "flex shrink-0 cursor-pointer flex-col items-center gap-1 self-center rounded-l-lg border border-r-0 py-2.5 pl-1 pr-0.5 text-[10px] font-medium shadow-sm transition-colors",
                    open
                        ? "border-slate-200 bg-white text-primary-600"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-primary-600"
                )}
                title={hint || (open ? "收起保障清单" : "展开保障清单")}
            >
                {open ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                <ClipboardCheck size={13} />
                <span className="[writing-mode:vertical-rl] tracking-wide">保障清单{badge ? ` ${badge}` : ""}</span>
            </button>

            {/* ---------- 抽屉面板 ---------- */}
            <div
                className="shrink-0 overflow-hidden transition-[width] duration-200 ease-out"
                style={{ width: open ? width : 0 }}
            >
                <div className="ml-auto h-full" style={{ width }}>
                    <Card className="flex h-full flex-col overflow-hidden">
                        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
                            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                            <div className="flex items-center gap-2">
                                {subtitle && (
                                    <span className="text-[11px] font-medium text-primary-600">{subtitle}</span>
                                )}
                                <button
                                    onClick={onToggle}
                                    className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                    title="收起"
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
                    </Card>
                </div>
            </div>
        </>
    );
}
