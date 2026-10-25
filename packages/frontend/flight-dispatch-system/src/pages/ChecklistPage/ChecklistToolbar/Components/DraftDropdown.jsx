/**
 * 草稿箱 dropdown —— 工具栏右侧（原"保存草稿"按钮的位置）
 * 列出浏览器本地保存的未完成检查单草稿（最多 MAX_DRAFTS 个），点击切换到那一条。
 *
 * 一条草稿 = 一个「航班 × 模板类型」，所以卡片上要同时标出航班与类型 ——
 * 同一航班的不同类型、同一类型的多个航班，在箱子里是并列的多条。
 * 点击 / 删除都交给上层（onSelect / 本组件内的删除动作），本组件只管内容。
 *
 * 定位与关闭（外点 / Esc / 视口碰撞翻转）全部由通用 Dropdown
 * （components/ui/Dropdown.jsx，Radix Popover 封装）处理。
 *
 * 渲染性能：只有「新建 / 删除 / 切模板 / 打开某条」才会动草稿索引
 * （节点正文的防抖落盘不碰索引），所以这里直接订阅整份列表，不会跟着打字重渲染。
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Dropdown, DropdownTrigger, DropdownContent } from "../../../../components/ui/Dropdown";
import { useDraftStore, draftFlightLabel } from "../../../../store/checklistDraft.store";
import { MAX_DRAFTS } from "../../../../utils/checklistCache";
import { Inbox, Trash2, Clock, ChevronDown } from "lucide-react";

function timeAgo(ms) {
    if (!ms) return "";
    const diff = Date.now() - ms;
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
}

/**
 * @param {Function} onSelect   选中某条草稿（上层跳转到「该航班 × 该模板」）
 * @param {string}   currentKey 当前正在编辑的草稿键（删到它就回草稿箱）
 */
export default function DraftDropdown({ onSelect, currentKey }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const drafts = useDraftStore((s) => s.drafts);
    const dropDraftWithData = useDraftStore((s) => s.dropDraftWithData);

    const handleDelete = async (draft) => {
        const isCurrent = draft.key === currentKey;
        const ok = window.confirm(
            `删除 ${draftFlightLabel(draft)} 的「${draft.templateType}」草稿？` +
                (isCurrent ? "\n（正是当前编辑的这条，删除后本页填写的内容会一并清空）" : "")
        );
        if (!ok) return;

        await dropDraftWithData(draft.key);

        // 删掉的正是当前这条 → 回草稿箱，别停在一个已经没草稿的编辑页上
        if (isCurrent) navigate("/checklist");
    };

    return (
        <Dropdown open={open} onOpenChange={setOpen}>
            <DropdownTrigger asChild>
                <Button variant="outline" size="sm" title="草稿保存在本地,编辑时自动保存">
                    <Inbox size={14} /> 草稿箱
                    {drafts.length > 0 && (
                        <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                            {drafts.length}
                        </span>
                    )}
                    <ChevronDown size={12} />
                </Button>
            </DropdownTrigger>

            <DropdownContent className="flex max-h-[min(360px,calc(100vh-24px))] w-80 max-w-[calc(100vw-16px)] flex-col overflow-hidden p-0">
                <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                    <Inbox size={12} className="inline-block" /> 草稿箱（{drafts.length}/{MAX_DRAFTS}）
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                    {drafts.length === 0 ? (
                        <div className="px-3 py-6 text-center text-xs text-slate-400">暂无草稿</div>
                    ) : (
                        drafts.map((draft) => (
                            <div
                                key={draft.key}
                                className={`flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 hover:bg-slate-50 ${
                                    draft.key === currentKey ? "bg-amber-50/60" : ""
                                }`}
                            >
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        onSelect?.(draft);
                                    }}
                                    className="flex-1 text-left"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-semibold text-slate-800">
                                            {draftFlightLabel(draft)}
                                        </span>
                                        {/* 同航班的不同检查单类型各有草稿 → 标出类型以区分 */}
                                        <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-500">
                                            {draft.templateType}
                                        </span>
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                        <Clock size={10} /> {timeAgo(draft.updatedAt)}
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(draft);
                                    }}
                                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                    title="删除这条草稿（本地内容一并清空）"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </DropdownContent>
        </Dropdown>
    );
}
