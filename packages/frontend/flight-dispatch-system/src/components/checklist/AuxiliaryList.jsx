import { cn } from "../../lib/utils";
import { statusStyle, StatusIcon } from "./statusView";

/**
 * ============================================================
 * AuxiliaryList —— 辅助监控指标（只读展示）
 * ------------------------------------------------------------
 * 渲染一个主节点下的全部辅助监控指标（type: time）：
 *   标题行（名称 + 时间 + 状态） + 描述行（可换行） + 备注
 * 兼容新（a.id）与旧（a.row / a.source.row）定位键。
 * ============================================================
 */
export default function AuxiliaryList({ auxiliaries = [], items = {} }) {
    if (!auxiliaries.length) {
        return <div className="px-3 py-1 text-[11px] text-slate-400">该节点无辅助监控指标</div>;
    }

    return (
        <ul className="space-y-1 px-2 pb-2 pt-1">
            顶顶顶顶顶顶顶顶顶顶顶
            {auxiliaries.map((a, ai) => {
                // 定位键：新结构 a.id；兼容旧结构 a.row / a.source.row
                const aKey = `aux-${a.id ?? a.row ?? a.source?.row}`;
                const aItem = items[aKey] || items[`aux-${a.row}`] || {};
                return (
                    <li key={aKey ?? `${ai}-aux`} className="rounded-md border border-slate-100 bg-white">
                        {/* 标题行：名称 + 时间 + 状态图标 */}
                        <div className="flex items-center gap-1 px-3 py-1.5">
                            <span className="pl-2 text-[11px] text-slate-400">↳</span>单独
                            <span
                                className={cn("min-w-0 flex-1 truncate text-[12px] font-medium", statusStyle(aItem))}
                                title={a.name}
                            >
                                {a.name}
                            </span>
                            {aItem.time && (
                                <span className="shrink-0 tabular-nums text-[11px] text-slate-500">{aItem.time}</span>
                            )}
                            <span className="shrink-0">
                                <StatusIcon item={aItem} />
                            </span>
                        </div>
                        {/* 描述行：独立行，支持换行 */}
                        {a.desc && (
                            <div className="whitespace-normal break-words px-3 pb-1 pl-9 text-[10px] leading-snug text-slate-500">
                                {a.desc}单独
                            </div>
                        )}
                        {/* 备注行 */}
                        {aItem.note && (
                            <div className="whitespace-normal break-words px-3 pb-1 pl-9 text-[11px] text-slate-500">
                                {aItem.note}是
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
