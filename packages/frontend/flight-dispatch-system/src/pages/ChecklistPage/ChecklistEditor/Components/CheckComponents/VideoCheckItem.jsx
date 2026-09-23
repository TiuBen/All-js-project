import { memo } from "react";
import { cn } from "../../../../../lib/utils";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "../OtherComponents/statusBadge";
// 填写数据在 checklistDraft（内存 + IndexedDB）：逐项订阅 + 绑定 uuid 的写入器
import { useVideoCheckItem, useVideoCheckSetter } from "../../../../../store/checklistDraft";
// 检查记录输入：文字 + 1 张截图（Ctrl+V 粘贴 / 选择 / 拖拽）
import BaseCheckInput from "../../../../../components/BaseCheckInput";

/**
 * ============================================================
 * VideoCheckItem —— 视频监管检查重点「单项」（填写模式）
 * ------------------------------------------------------------
 * 由 VideoPanel 按 groups 分组渲染，一行 = 一条视频监管检查重点：
 *   描述 / 状态（单击循环切换）/ 检查记录（文字 + 1 张截图）
 *
 * ★ 检查记录交给 BaseCheckInput（受控：note + image 两个 prop）
 *   - 文字：item.note → 受控 textarea
 *   - 截图：item.image → Ctrl+V 粘贴 / 选择文件 / 拖入；
 *     二进制作 Blob 原样交给 checklistDraft 存 IndexedDB（不转 Base64）
 *   - 截图**不**走 useRegister：粘贴/选择/拖拽三个来源都要写回同一字段，
 *     还带缩略图与"再次添加即替换"，React 受控比非受控直白
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

            {/* 检查记录：文字 + 截图（截图以 Blob 存 IndexedDB，刷新 / 离线都在） */}
            <BaseCheckInput
                note={item.note || ""}
                image={item.image || null}
                onNoteChange={(v) => setField("note", v)}
                onImageChange={(img) => setField("image", img)}
                placeholder="检查记录 / 截图信息，可直接 Ctrl + V 粘贴截图"
            />
        </div>
    );
});
