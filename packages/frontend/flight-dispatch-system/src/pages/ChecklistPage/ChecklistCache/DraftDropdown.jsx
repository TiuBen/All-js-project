/**
 * 草稿箱 dropmenu —— 在"保存草稿"按钮后展示
 * 列出当前未完成检查单草稿（最多 5 个），点击切换
 */
import { useState, useEffect, useRef } from "react";
import { useDraftStore } from "../../../store/draftStore";
import { Button } from "../../../components/ui/button";
import { Inbox, Trash2, Clock, ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";

function timeAgo(iso) {
    if (!iso) return "";
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60000) return "刚刚";
    if (ms < 3600000) return `${Math.floor(ms / 60000)}分钟前`;
    if (ms < 86400000) return `${Math.floor(ms / 3600000)}小时前`;
    return `${Math.floor(ms / 86400000)}天前`;
}

export default function DraftDropdown({ onSelect }) {
    const drafts = useDraftStore((s) => s.drafts);
    const removeDraft = useDraftStore((s) => s.removeDraft);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} title="查看草稿箱">
                <Inbox size={14} /> 草稿箱
                {drafts.length > 0 && (
                    <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                        {drafts.length}
                    </span>
                )}
                <ChevronDown size={12} />
            </Button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                        <Inbox size={12} className="inline-block" /> 草稿箱（{drafts.length}/5）
                    </div>
                    <div className="max-h-72 overflow-auto">
                        {drafts.length === 0 ? (
                            <div className="px-3 py-6 text-center text-xs text-slate-400">暂无草稿</div>
                        ) : (
                            drafts.map((d) => (
                                <div
                                    key={d.flightId}
                                    className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 hover:bg-slate-50"
                                >
                                    <button
                                        onClick={() => {
                                            setOpen(false);
                                            onSelect?.(d);
                                        }}
                                        className="flex-1 text-left"
                                    >
                                        <div className="text-sm font-semibold text-slate-800">{d.flightNo}</div>
                                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                            <Clock size={10} /> {timeAgo(d.updatedAt)}
                                        </div>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`删除 ${d.flightNo} 草稿？`)) removeDraft(d.flightId);
                                        }}
                                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
