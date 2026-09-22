import { memo } from "react";
import { cn } from "../../../../../lib/utils";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "../OtherComponents/statusBadge";
// 填写数据在 checklistDraft（内存 + IndexedDB）：逐项订阅 + 绑定 uuid 的写入器
import { useVideoCheckItem, useVideoCheckSetter } from "../../../../../store/checklistDraft";
import useRegister from "../../hooks/useRegister";

/**
 * ============================================================
 * VideoCheckItem —— 视频监管检查重点「单项」（填写模式）
 * ------------------------------------------------------------
 * 由 VideoPanel 按 groups 分组渲染，一行 = 一条视频监管检查重点：
 *   描述 / 状态（单击循环切换）/ 备注（截图信息）
 *
 * ★ 表单写法仿 react-hook-form
 *   备注框只写一行 `{...register("note")}` —— 没有 value、没有 ref、
 *   没有手写 onChange。
 *
 * ★ 数据全部自己订阅（checklistDraft）
 *   - useVideoCheckItem(checkUuid)  → 只订阅自己这条数据（key = 视频项 uuid）
 *   - useVideoCheckSetter(checkUuid) → 绑定 uuid 的写入器（内部走 setVideoItemField）
 *   因此改一条只重渲染这一行，单份最多 42 项的列表面板不会被整体刷新。
 * ============================================================
 * @param {string} props.checkUuid 视频监管项 uuid（模板 id 已删，uuid 是唯一身份）
 * @param {string} props.name      条目描述文本
 * ============================================================
 */
export default memo(function VideoCheckItem({ checkUuid, name }) {
    const item = useVideoCheckItem(checkUuid) || {};
    const setField = useVideoCheckSetter(checkUuid); // 绑定 uuid 的写入器，引用稳定

    // 表单：取值 / 写入 / 回填全部收进 register
    const register = useRegister({ note: item.note }, setField);

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

            {/* 备注 / 截图信息：仿 RHF，一行展开 */}
            <textarea
                {...register("note")}
                className="input mt-1.5 w-full resize-y px-1.5 py-0.5 "
                rows={2}
                placeholder="备注 / 截图信息（可换行）"
            />
        </div>
    );
});
