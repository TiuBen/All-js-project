import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
// useChecklistStore + 类型配色（TYPE_COLORS / typeColorOf / withAlpha）+ 类型顺序与
// checkTemplate 参数映射（TYPE_ORDER / checkTemplateOfType）都来自 store
import {
    useChecklistStore,
    TYPE_COLORS,
    TYPE_ORDER,
    typeColorOf,
    withAlpha,
    checkTemplateOfType,
} from "../../../../../../store/checklistStore";

/**
 * ============================================================
 * TemplateChooseDropdown —— 检查单类型下拉（顺航 / 货运始发 / 货运过站 / 客运始发 / 客运过站）
 * ------------------------------------------------------------
 * 目录：ChecklistPage/ChecklistEditor/Components/ToolBar/Components/TemplateChooseDropdown.jsx
 * ------------------------------------------------------------
 * ★ **零 props**：当前类型与切换动作全部走 useChecklistStore
 *     - template.id               当前类型（= 模板 id = 落库 checklist_category）
 *     - switchChecklistType(id)   切换类型（由编辑器按 URL 装载时调用；本组件不直接调）
 *   仅"弹层开/关"是组件内部状态（useState）—— 它不影响整页，不该进 store。
 *
 * ★ **URL 是唯一驱动源（checkTemplate 参数）**
 *     - 下拉选中 → 只把 checkTemplate 写回 URL（保留其余参数）
 *     - URL 变化 → 编辑器的装载 effect 读参数 → openFlight → switchChecklistType
 *     - 每种检查单类型各有自己的一份草稿（键 = 航班键::类型），切换即"换一份草稿"，
 *       当前类型的填写会先落盘，互不覆盖。
 * ------------------------------------------------------------
 * 配色：主色 = TYPE_COLORS[label]；浅底 / 浅边框由 withAlpha 派生（inline style，
 * 绕开 Tailwind 动态类名的 JIT 限制）。选中项用 ✔ 表示。
 * 选项顺序 = store 的 TYPE_ORDER（TYPE_COLORS 键序），不再本地维护。
 * ============================================================
 */
export default function TemplateChooseDropdown() {
    const [open, setOpen] = useState(false); // 弹层开关（组件内状态，切换类型不影响整页）
    const [searchParams, setSearchParams] = useSearchParams();

    // ===== 订阅 store（细粒度 selector）=====
    const templateId = useChecklistStore((s) => s.template?.id);

    const activeColor = typeColorOf(templateId);

    /**
     * 下拉选中：**只把 checkTemplate 写回 URL**，不直接切类型。
     * 真正切换由编辑器的 URL 装载 effect 统一驱动（openFlight → switchChecklistType），
     * 一份状态一个驱动源 —— 否则"URL 同步"和"手动点击"两处都切，会重复装载、互相打架。
     * 保留其余 query 参数。
     */
    const handleSelect = (label) => {
        setOpen(false);
        const ct = checkTemplateOfType(label);
        const next = new URLSearchParams(searchParams);
        if (ct) next.set("checkTemplate", ct);
        setSearchParams(next, { replace: true });
    };

    return (
        <div className="relative">
            {/* 点击遮罩关闭（覆盖全屏，层级低于弹层） */}
            {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                style={{
                    color: activeColor,
                    borderColor: withAlpha(activeColor, 0.35),
                    backgroundColor: withAlpha(activeColor, 0.08),
                }}
            >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeColor }} />
                {templateId}
                <ChevronDown size={12} />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    {TYPE_ORDER.map((label) => (
                        <button
                            key={label}
                            onClick={() => handleSelect(label)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium transition-colors hover:bg-slate-50"
                            style={{ color: TYPE_COLORS[label] }}
                        >
                            {label}
                            {/* 选中态用 ✔ 表示（不再靠加粗 / 变色区分） */}
                            {templateId === label && <Check size={13} className="ml-auto shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
