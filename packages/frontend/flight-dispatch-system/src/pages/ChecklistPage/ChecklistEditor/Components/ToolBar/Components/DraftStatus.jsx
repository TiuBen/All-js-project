import { Check, HardDrive, Loader2 } from "lucide-react";
// 草稿状态在 checklistDraft（内存 + IndexedDB），不在 checklistStore
import { useDraftStatus } from "../../../../../../store/checklistDraft";

/**
 * ============================================================
 * DraftStatus —— 草稿自动保存状态提示（工具栏行1 的一行轻量文字）
 * ------------------------------------------------------------
 * 目录：ChecklistPage/ChecklistEditor/Components/ToolBar/Components/DraftStatus.jsx
 * ------------------------------------------------------------
 * ★ **零 props**：状态全部走 checklistDraft 的 useDraftStatus()
 *     - draftPending   改动某项后 800ms 防抖期内 → 「草稿保存中…」
 *     - draftSavedAt   上次落盘时间 → 「草稿已保存 HH:MM」
 *     - 两者皆空       → 「草稿已自动保存」（默认态）
 *
 * 注：页面上没有"保存草稿"按钮 —— 草稿由 checklistDraft 在改动某项时
 *     防抖写入 IndexedDB（可存图片等大二进制），本组件只读状态做展示。
 * ============================================================
 */
export default function DraftStatus() {
    // ===== 订阅 checklistDraft 的保存状态（引用稳定，只在状态变化时重渲染）=====
    const { draftPending, draftSavedAt } = useDraftStatus();

    return (
        <span
            className="flex items-center gap-1 text-[11px] text-slate-400"
            title="草稿自动保存在浏览器本地，无需手动保存"
        >
            {draftPending ? (
                <>
                    <Loader2 className="animate-spin" size={12} /> 草稿保存中…
                </>
            ) : draftSavedAt ? (
                <>
                    <Check size={12} className="text-emerald-500" />
                    草稿已保存{" "}
                    {new Date(draftSavedAt).toLocaleTimeString("zh-CN", { hour12: false }).slice(0, 5)}
                </>
            ) : (
                <>
                    <HardDrive size={12} /> 草稿已自动保存
                </>
            )}
        </span>
    );
}
