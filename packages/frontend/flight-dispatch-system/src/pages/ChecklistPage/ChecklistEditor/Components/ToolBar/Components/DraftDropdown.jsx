/**
 * 草稿箱 dropdown —— 工具栏右侧（原"保存草稿"按钮的位置）
 * 列出浏览器本地保存的未完成检查单草稿（最多 5 个），点击切换。
 *
 * 定位与关闭（外点 / Esc / 视口碰撞翻转）全部由通用 Dropdown
 * （components/ui/Dropdown.jsx，Radix Popover 封装）处理，
 * 本组件只管内容。
 *
 * 渲染性能：只订阅草稿**条数**（角标用），完整列表在展开时才用
 * useDraftStore.getState() 现取 —— 否则每 800ms 一次的草稿落盘都会
 * 让这个下拉（连带工具栏）重渲染。
 */
import { useState } from "react";
import { useDraftStore } from "../../../../../../store/draftStore";
import { removeIdbDraft } from "../../../../../../store/checklistDraft";
import { Button } from "../../../../../../components/ui/button";
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
} from "../../../../../../components/ui/Dropdown";
import { Inbox, Trash2, Clock, ChevronDown } from "lucide-react";

function timeAgo(iso) {
    if (!iso) return "";
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60000) return "刚刚";
    if (ms < 3600000) return `${Math.floor(ms / 60000)}分钟前`;
    if (ms < 86400000) return `${Math.floor(ms / 86400000)}小时前`;
    return `${Math.floor(ms / 86400000)}天前`;
}

export default function DraftDropdown({ onSelect }) {
    const draftCount = useDraftStore((s) => s.drafts.length);
    const removeDraft = useDraftStore((s) => s.removeDraft);
    const [open, setOpen] = useState(false);

    // 展开时才读取完整列表（不订阅，避免落盘即重渲染）
    const drafts = open ? useDraftStore.getState().drafts : [];

    return (
        <Dropdown open={open} onOpenChange={setOpen}>
            <DropdownTrigger asChild>
                <Button variant="outline" size="sm" title="草稿保存在本地,编辑时自动保存">
                    <Inbox size={14} /> 草稿箱
                    {draftCount > 0 && (
                        <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                            {draftCount}
                        </span>
                    )}
                    <ChevronDown size={12} />
                </Button>
            </DropdownTrigger>

            <DropdownContent className="flex max-h-[min(360px,calc(100vh-24px))] w-80 max-w-[calc(100vw-16px)] flex-col overflow-hidden p-0">
                <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                    <Inbox size={12} className="inline-block" /> 草稿箱（{drafts.length}/5）
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                    {drafts.length === 0 ? (
                        <div className="px-3 py-6 text-center text-xs text-slate-400">暂无草稿</div>
                    ) : (
                        drafts.map((d) => (
                            <div
                                key={d.key}
                                className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 hover:bg-slate-50"
                            >
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        onSelect?.(d);
                                    }}
                                    className="flex-1 text-left"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-semibold text-slate-800">
                                            {d.flightNo}
                                        </span>
                                        {/* 同航班的不同检查单类型各有草稿 → 标出类型以区分 */}
                                        <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-500">
                                            {d.templateId}
                                        </span>
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                        <Clock size={10} /> {timeAgo(d.updatedAt)}
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`删除 ${d.flightNo} 的「${d.templateId}」草稿？`)) {
                                            removeDraft(d.key); // 草稿箱索引
                                            removeIdbDraft(d.key); // IndexedDB 正文
                                        }
                                    }}
                                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
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
