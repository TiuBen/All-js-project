import { CheckCircle2, Circle, CircleDot, MinusCircle } from "lucide-react";
import { viewStatusOf } from "../../../../utils/ViewColor";

/**
 * ============================================================
 * 查看页共享：状态显示（颜色 + 图标）
 * ------------------------------------------------------------
 * 供三个 CheckList（MainCheckList / AuxiliaryCheckList / VideoCheckList）
 * 复用 —— 一行记录的状态怎么显示，三处只有这一份实现。
 *
 * ★ 颜色**不在这里定义**：一律经 utils/ViewColor.js 的 viewStatusOf() 取，
 *   本文件只负责"把颜色画到图标上"。
 * ★ 图标与颜色都随 ViewColor 的状态表走：
 *     abnormal → 红点（唯一有色的状态）
 *     na       → 灰 minus
 *     pending  → 灰空心圈
 *     ok       → 灰勾（暂时灰，见 ViewColor 注释）
 * ============================================================
 */

/** 状态文字色（hex，配合 inline style 用） */
export const statusTextColor = (item) => viewStatusOf(item?.status).color;

/** 状态图标：颜色来自 ViewColor，形状区分四个状态（不靠颜色区分，色盲也分得清） */
export function StatusIcon({ item, size = 13 }) {
    const s = viewStatusOf(item?.status);
    const Icon =
        s.key === "abnormal" ? CircleDot : s.key === "ok" ? CheckCircle2 : s.key === "na" ? MinusCircle : Circle;
    return <Icon size={size} style={{ color: s.color }} />;
}

/** 状态文字（统计条以外的行内小标签用） */
export function StatusLabel({ item, className = "" }) {
    const s = viewStatusOf(item?.status);
    return (
        <span className={className} style={{ color: s.color }}>
            {s.label}
        </span>
    );
}
