import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { ArrowLeft, Loader2, Lock, PenLine, Save, X } from "lucide-react";

import { Button } from "../../../components/ui/button";
import PanelSwitcher from "./Components/PanelSwitcher";
import { typeColorOf } from "../../../store/checklistEditorPage.store";
import { EDIT_LOCK_HOURS, useChecklistViewerStore } from "../../../store/checklistViewer.store";

/**
 * ============================================================
 * ViewerToolbar —— 检查单**查看 / 修改页**顶部固定区
 * ------------------------------------------------------------
 * 目录：ChecklistPage/ChecklistToolbar/ViewerToolbar.jsx（本文件）
 *      外层 ChecklistToolbar.jsx 按路由分流，只有 /checklists/:recordId
 *      会渲染到这里。
 * ------------------------------------------------------------
 * ★ **零 props**：记录与修改态全部来自 checklistViewer.store（与正文
 *   ChecklistViewer 共用同一份），本文件只订阅、只发起动作。
 *
 * 按钮可见性（与填写页的差别，全靠路由分流保证）：
 *   三栏显隐    ✔ 与填写页同一个 store，切过去不会变
 *   检查单类型  ✔ 但**禁用** —— 记录的类型就是提交时的类型，不许换
 *   修改        ✔ 展示态且未超 24h 才有；超时显示红色锁定提示
 *   取消 / 保存 ✔ 只在修改态
 *   类型下拉 / 草稿箱 / 流程图 / 小地图 / 独立展示 / 提交   ✘ 全不出现
 * ============================================================
 */
export default function ViewerToolbar() {
    const navigate = useNavigate();

    const record = useChecklistViewerStore((s) => s.record);
    const mode = useChecklistViewerStore((s) => s.mode);
    const saving = useChecklistViewerStore((s) => s.saving);
    const locked = useChecklistViewerStore((s) => s.locked);
    const enterEdit = useChecklistViewerStore((s) => s.enterEdit);
    const cancelEdit = useChecklistViewerStore((s) => s.cancelEdit);
    const save = useChecklistViewerStore((s) => s.save);

    const editing = mode === "edit";
    // 记录的类型名（= 落库 checklist_category），配色与填写页同一张表
    const templateType = record?.checklist_category ?? "";
    const typeColor = typeColorOf(templateType) || "#475569";

    const handleSave = async () => {
        try {
            const saved = await save();
            alert(`修改成功：记录 #${saved?.id} 已更新`);
        } catch (err) {
            alert(`修改失败：${err.message}`);
        }
    };

    return (
        <div className="shrink-0 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* 左：返回 + 航班号 + 类型 + 检查人 / 创建时间 */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div className="flex items-baseline gap-2" style={{ color: typeColor }}>
                        <h2 className="text-base font-bold">{record?.callsign || "—"}</h2>
                        <span className="text-xs font-medium">{templateType}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                        检查人：{record?.inspector?.name ?? "—"} · 创建于{" "}
                        {record?.created_at ? dayjs(record.created_at).format("YYYY-MM-DD HH:mm") : "—"}
                    </span>
                </div>

                {/* 右：三栏显隐 + 类型（只读）+ 修改 / 保存 */}
                <div className="flex flex-wrap items-center gap-2">
                    <PanelSwitcher />

                    {/* 记录的类型就是提交时的类型，不给换 */}
                    <Button variant="outline" size="sm" disabled title="查看记录不能切换检查单类型">
                        {templateType || "模板"}
                    </Button>

                    {locked && !editing && (
                        <span className="flex items-center gap-1 text-[11px] text-red-500">
                            <Lock size={11} /> 已提交超过 {EDIT_LOCK_HOURS} 小时，不能再修改
                        </span>
                    )}

                    {editing ? (
                        <>
                            <Button variant="outline" size="sm" onClick={cancelEdit} disabled={saving}>
                                <X size={14} /> 取消
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                保存修改
                            </Button>
                        </>
                    ) : (
                        <Button
                            size="sm"
                            onClick={enterEdit}
                            disabled={locked}
                            title={locked ? `已提交超过 ${EDIT_LOCK_HOURS} 小时，不能再修改` : "进入修改模式"}
                        >
                            <PenLine size={14} /> 修改
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
