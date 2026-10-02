import { Check } from "lucide-react";
import { CHECKLIST_GROUPS } from "../../../config/specialSpec";
import { cn } from "../../../lib/utils";

/**
 * ============================================================
 * SpecialChecklist —— 生鲜保障清单（可打勾确认）
 * ------------------------------------------------------------
 * 条目与分组来自 config/specialSpec.js 的 CHECKLIST_GROUPS
 * （即用户提供的 15 条文字注释，原文见该文件文末附录）：
 *   1° 航班入位前（1-10）      2° 卸机作业与机坪驳运（11-15）
 *
 * ★ 一份清单 = 一个航班：勾选状态存在 specialStore.checks[flightKey] 里，
 *   换航班即换一份，互不影响。
 * ★ 本组件不关心数据从哪来，只收「当前航班的勾选表 + 三个回调」。
 * ★ 条目排版：一行 = [`勾选框` + `序号 + 正文`]，整行 **垂直居中**
 *   （button 用 items-center），文字换行时勾选框落在整块文字的中线上。
 *
 * @param {Object}   flight             当前航班（用于标题展示航班号）
 * @param {Object}   checks             { [itemKey]: true }
 * @param {Function} onToggle           (itemKey) => void
 * @param {string}   [className]
 * ============================================================
 */
export default function SpecialChecklist({ flight, checks = {}, onToggle, className }) {
    return (
        <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
            {/* ---------- 分组清单 ---------- */}
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                {!flight ? (
                    <div className="flex h-full items-center justify-center px-4 text-center text-[11px] leading-relaxed text-slate-400">
                        先在左侧日历选日期，再在上方选一架生鲜航班
                        <br />
                        清单按航班各存一份
                    </div>
                ) : (
                    CHECKLIST_GROUPS.map((group, gi) => {
                        const groupKeys = group.items.map((i) => i.key);
                        const groupDone = groupKeys.filter((k) => checks[k]).length;
                        return (
                            <section key={group.key} className={cn(gi > 0 && "mt-3")}>
                                {/* 分组标题 + 本组进度 */}
                                <div className="mb-1 flex items-center justify-between gap-2 px-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-semibold text-slate-700">{group.title}</span>
                                        <span className="text-[10px] text-slate-400">
                                            {groupDone}/{groupKeys.length}
                                        </span>
                                    </div>
                                </div>

                                {/* 条目 */}
                                <ul className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const checked = !!checks[item.key];
                                        return (
                                            <li key={item.key} className="flex flex-row items-center justify-center">
                                                <button
                                                    onClick={() => onToggle(item.key)}
                                                    className={cn(
                                                        // items-center：勾选框与文字块**垂直居中对齐**
                                                        // （文字换行成两三行时，勾选框落在整块文字的中线上）
                                                        "flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors",
                                                        checked
                                                            ? "border-emerald-200 bg-emerald-50/70"
                                                            : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {/* 勾选框（不再需要 mt 微调：父级已 items-center） */}
                                                    <span
                                                        className={cn(
                                                            "flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded border transition-colors",
                                                            checked
                                                                ? "border-emerald-500 bg-emerald-500 text-white"
                                                                : "border-slate-300 bg-white text-transparent"
                                                        )}
                                                    >
                                                        <Check size={11} strokeWidth={3} />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span
                                                            className={cn(
                                                                "mr-1 text-[10px] font-semibold tabular-nums",
                                                                checked ? "text-emerald-600" : "text-slate-400"
                                                            )}
                                                        >
                                                            {item.no}.
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                "text-[11px] leading-relaxed",
                                                                checked ? "text-emerald-900/80" : "text-slate-600"
                                                            )}
                                                        >
                                                            {item.text}
                                                        </span>
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        );
                    })
                )}
            </div>
        </div>
    );
}
