import { memo } from "react";
import { cn } from "../../../../lib/utils";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "../../CommonComponents/statusBadge";
import { useVideoCheckItem, useVideoCheckSetter } from "../../../../store/checklistStore";

/**
 * ============================================================
 * VideoCheckItem —— 视频监管检查重点「单项」（填写模式）
 * ------------------------------------------------------------
 * 由 VideoPanel 按 groups 分组渲染，一行 = 一条视频监管检查重点：
 *   描述 / 状态（单击循环切换）/ 备注（截图信息）
 *
 * 与主/辅助项不同，本组件**自行订阅 store**（不接收 item / setter props）：
 *   - useVideoCheckItem(checkId)  → 只订阅自己这条数据（key = vCheckId）
 *   - useVideoCheckSetter(checkId) → 取 store 里专属的 set_vCheckIdN
 * 因此改一条只重渲染这一行，单份最多 44 项的列表面板不会被整体刷新。
 * （这也是面板不订阅整个 videoItems 的原因，见 VideoPanel 顶部注释）
 * ============================================================
 * @param {string} props.checkId 视频监管项 id（如 vCheckId2，全局唯一）
 * @param {string} props.name    条目描述文本
 * ============================================================
 */
export default memo(function VideoCheckItem({ checkId, name }) {
    const item = useVideoCheckItem(checkId) || {};
    const setField = useVideoCheckSetter(checkId);

    return (
        <div className="rounded-lg border border-sky-100 p-2 hover:bg-sky-50/40">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 text-[13px] leading-snug text-slate-600">{name}</div>
                {/* 状态：label 包裹（文字+图标均可点击切换），hover 显示文字 */}
                <label
                    className={cn(
                        "flex shrink-0 cursor-pointer items-center gap-1.5 text-[12px]",
                        STATUS_COLORS[item.status || ""] || "text-blue-500"
                    )}
                    title={`状态：${STATUS_LABELS[item.status || ""]}（单击切换）`}
                >
                    <span>{STATUS_LABELS[item.status || ""]}</span>
                    <button
                        className="shrink-0 cursor-pointer rounded p-0.5 transition-transform hover:scale-150"
                        onClick={(e) => {
                            e.stopPropagation();
                            setField("status", nextStatus(item.status));
                        }}
                    >
                        {STATUS_ICONS[item.status || ""]}
                    </button>
                </label>
            </div>

            <textarea
                className="input mt-1.5 w-full resize-y px-1.5 py-0.5 "
                rows={2}
                placeholder="备注 / 截图信息（可换行）"
                value={item.note || ""}
                onChange={(e) => setField("note", e.target.value)}
            />
        </div>
    );
});
