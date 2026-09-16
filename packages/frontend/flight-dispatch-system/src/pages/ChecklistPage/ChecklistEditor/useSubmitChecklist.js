import { useCallback, useState } from "react";
import { useChecklistStore } from "../../../store/checklistStore";
import { useDraftStore } from "../../../store/draftStore";
import { useRecordsStore } from "../../../store/recordsStore";

// 已提交记录的可修改时限（小时）：超过该时限 → 锁定只读，禁止再修改/提交
const LOCK_HOURS = 24;

/**
 * ============================================================
 * useSubmitChecklist —— 检查单提交（落地后端）（ChecklistEditor 私有 hook）
 * ------------------------------------------------------------
 * 页面上唯一的显式保存动作：未提交过程中的内容由 store 内部防抖自动落本地草稿，
 * 不再需要"保存草稿"按钮。
 *
 * 提交成功后依次做：
 *   1. 回写时间基准（updated_at）与记录状态（父组件持有，供徽章展示）
 *   2. 失效记录页缓存（refreshKey+1）→ 回到填写记录页自动从后端拉最新
 *   3. 移除该航班草稿 + 重置落盘签名（重新编辑时首笔改动要能再次落盘）
 *
 * 注：一航班一检查单的关联（fips/manual_fips.checklist_uuid）由后端在
 *     create/update 时自动同步，前端无需额外标记。
 *
 * @param {Object}   入参
 * @param {Object}   入参.flight           航班对象
 * @param {boolean}  入参.isLocked         已提交且超 24h → 禁止提交
 * @param {Function} 入参.setRecordStatus  更新记录状态（父组件持有）
 * @param {Function} 入参.setCheckedAt     更新时间基准（父组件持有）
 * @returns {{ saveError, clearSaveError, submit }}
 * ============================================================
 */
export default function useSubmitChecklist({ flight, isLocked, setRecordStatus, setCheckedAt }) {
    // 保存失败提示（常驻，不自动消失，由用户手动关闭）
    const [saveError, setSaveError] = useState(null);
    // 草稿箱的删除入口（提交成功后清掉该航班草稿）
    const removeDraft = useDraftStore((s) => s.removeDraft);

    const clearSaveError = useCallback(() => setSaveError(null), []);

    const submit = useCallback(async () => {
        // 24h 锁定：已提交超时后禁止再修改/提交（前端拦截，后端同样拒绝）
        if (isLocked) {
            setSaveError(`该检查单已提交超过 ${LOCK_HOURS} 小时，不可再修改`);
            return;
        }
        try {
            const rec = await useChecklistStore.getState().save({ status: "submitted" });
            // 时间基准：updated_at（表结构已无 checked_at）
            setCheckedAt(rec.updated_at || rec.created_at || new Date().toISOString());
            setRecordStatus(rec.status);
            setSaveError(null);
            // 保存/提交成功 → 记录页数据可能已变化（如切换模板类型后 checklist_category 更新）
            useRecordsStore.getState().refresh();
            if (flight) {
                removeDraft(flight.id);
                useChecklistStore.getState().resetDraftTracking();
            }
        } catch (err) {
            console.error("save failed:", err);
            setSaveError(err.message || "保存失败，请重试");
        }
    }, [flight, isLocked, removeDraft, setCheckedAt, setRecordStatus]);

    return { saveError, clearSaveError, submit };
}
