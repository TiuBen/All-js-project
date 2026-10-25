import { CheckCircle2, Circle, CircleDot, XCircle, Loader, BadgeX } from "lucide-react";

/**
 * ============================================================
 * 检查单填写页（ChecklistPage）私有：状态选项与徽章
 * ------------------------------------------------------------
 * STATUS_OPTIONS：主/辅助/视频三项共用的下拉状态选项（select 用）
 * STATUS_LABELS / STATUS_ICONS / STATUS_CYCLE / nextStatus：
 *   主监控卡片"单击切换状态图标"用（hover 显示文字 hint，点击循环切换）
 * getStatusBadge：Select 右侧的小状态徽章
 * ============================================================
 */

export const STATUS_OPTIONS = [
    { value: "", label: "待检查", color: "text-blue-500" },
    { value: "ok", label: "正常", color: "text-emerald-600" },
    { value: "abnormal", label: "异常", color: "text-red-500" },
    { value: "na", label: "不适用", color: "text-amber-500" },
];

/** 状态文字颜色（按 value → tailwind 类） */
export const STATUS_COLORS = {
    "": "text-blue-500", // 待检查：蓝
    ok: "text-emerald-600", // 正常：绿
    abnormal: "text-red-500", // 异常：红
    na: "text-amber-500", // 不适用：琥珀
};

/** 状态文字（图标 hover 提示用） */
export const STATUS_LABELS = {
    "": "待检查",
    ok: "正常",
    abnormal: "异常",
    na: "不适用",
};

/** 单击循环顺序：待检查 → 正常 → 异常 → 不适用 → 待检查 */
export const STATUS_CYCLE = ["", "ok", "abnormal", "na"];

/** 状态图标（单击切换用，hover 显示 STATUS_LABELS） */
export const STATUS_ICONS = {
    "": <Loader size={16} className="text-blue-500" />, // 待检查：蓝
    ok: <CheckCircle2 size={16} className="text-emerald-500" />, // 正常：绿
    abnormal: <BadgeX size={16} className="text-red-500" />, // 异常：红
    na: <XCircle size={16} className="text-amber-500" />, // 不适用：琥珀
};

/** 下一状态（循环） */
export const nextStatus = (cur) => {
    const idx = STATUS_CYCLE.indexOf(cur ?? "");
    return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
};

export const getStatusBadge = (status) => {
    if (!status) return <Circle size={15} className="text-slate-300" />;
    if (status === "ok") return <CheckCircle2 size={15} className="text-emerald-500" />;
    if (status === "abnormal") return <CircleDot size={15} className="text-red-500" />;
    return <Circle size={15} className="text-slate-400" />;
};
