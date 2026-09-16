import { useEffect } from "react";
import { useChecklistStore } from "../../../store/checklistStore";

/**
 * ============================================================
 * useDraftFlush —— 草稿落盘兜底（ChecklistEditor 私有 hook）
 * ------------------------------------------------------------
 * 草稿由 store 在"改动某项"时防抖写入 localStorage（默认 800ms）。
 * 页面被隐藏 / 关闭 / 组件卸载时，防抖计时器可能还没触发 → 这里立刻强制落盘，
 * 保证最后那一下编辑不丢。
 *
 * 无参数、无返回值：纯副作用 hook，调用一次即可。
 * ============================================================
 */
export default function useDraftFlush() {
    useEffect(() => {
        // 取 getState() 而非订阅：本 hook 不应因 store 任何变化而重建
        const flush = () => useChecklistStore.getState().flushDraft();
        const onVisibility = () => {
            if (document.visibilityState === "hidden") flush();
        };

        window.addEventListener("pagehide", flush);
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            window.removeEventListener("pagehide", flush);
            document.removeEventListener("visibilitychange", onVisibility);
            flush(); // 卸载时补一次
        };
    }, []);
}
