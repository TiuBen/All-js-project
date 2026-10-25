import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
import {
    useChecklistStore,
    TYPE_COLORS,
    TYPE_ORDER,
    typeColorOf,
    withAlpha,
} from "../../../../store/checklistEditorPage.store";
import { useDraftStore, draftFullHint } from "../../../../store/checklistDraft.store";
import { TEMPLATE_KEY_BY_TYPE } from "../../../../config/dataSource";
import { draftKeyOf } from "../../../../utils/checklistCache";

/**
 * TemplateChooseDropdown —— 检查单类型下拉（顺航 / 货运始发 / 货运过站 / 客运始发 / 客运过站）
 * ------------------------------------------------------------
 * ★ 切类型 = 换一条草稿（一个航班 × 一种模板 = 一条草稿），所以除了
 *   setTemplateType + 改 URL，还要把草稿箱整理一下，规则见
 *   checklistDraft.store 的 switchTemplate：
 *     草稿箱没满 → 旧模板那份原样保留，**问用户**要不要顺手清掉它的本地内容
 *     草稿箱已满 → 没得选，**静默**清掉旧模板那份腾位置（否则就 6 条了）
 * ------------------------------------------------------------
 */
export default function TemplateChooseDropdown() {
    const [open, setOpen] = useState(false); // 弹层开关（组件内状态，切换类型不影响整页）
    const navigate = useNavigate();
    const location = useLocation();
    const { flightUuid } = useParams();

    // ===== 订阅 store（细粒度 selector）=====
    // templateType 存的是「类型名」= 模板 id = 落库 checklist_category
    const { templateType, setTemplateType } = useChecklistStore();
    const switchTemplate = useDraftStore((s) => s.switchTemplate);
    const dropDraftWithData = useDraftStore((s) => s.dropDraftWithData);
    const activeColor = typeColorOf(templateType);

    const handleSelect = async (label) => {
        setOpen(false);
        if (label === templateType) return;

        const templateKey = TEMPLATE_KEY_BY_TYPE[label];
        if (!templateKey) return;

        const res = await switchTemplate({
            flightUuid: flightUuid,
            templateKey,
            templateType: label,
            oldKey: draftKeyOf(flightUuid, TEMPLATE_KEY_BY_TYPE[templateType]),
            oldTemplateType: templateType,
        });

        if (res.cleared) {
            // 满了，只能清掉旧的那份：说一句就好，别让用户以为数据丢了是 bug
            console.info(`草稿箱已满：已清空「${res.cleared.templateType}」在本机缓存的填写内容`);
        } else if (res.kept) {
            // 没满：旧模板那份还留在草稿箱里，问一句要不要顺手清掉（内容还在，不确认就不动）
            const yes = window.confirm(
                `已切到「${label}」。\n` +
                    `原「${res.kept.templateType}」的草稿仍保留在草稿箱里，可以随时回去继续编辑。\n\n` +
                    `点「确定」= 清空它缓存在本机的内容；点「取消」= 留着。`
            );
            if (yes) await dropDraftWithData(res.kept.key);
        } else if (!res.ok) {
            alert(`${draftFullHint()}。`);
        }

        setTemplateType(label);

        // 切完让 URL 上的 ?template= 跟着走（刷新 / 分享链接能还原到同一个类型）。
        // 中文类型名 → 模板标识；保留其它 query（如 ?record=），用 replace 免得刷一堆历史。
        const params = new URLSearchParams(location.search);
        params.set("template", templateKey);
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
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
                {templateType || "选择检查单类型"}
                <ChevronDown size={12} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    {TYPE_ORDER.map((label, key) => (
                        <button
                            key={key}
                            type="button"
                            role="option"
                            onClick={() => handleSelect(label)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium transition-colors hover:bg-slate-50"
                            style={{ color: TYPE_COLORS[label] }}
                        >
                            {label}
                            {/* 选中态用 ✔ 表示（不再靠加粗 / 变色区分） */}
                            {templateType === label && <Check size={13} className="ml-auto shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
