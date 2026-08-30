/**
 * 草稿箱草稿展示区 —— 检查单工作台顶部
 * 当本地草稿箱有未提交的检查单时优先展示，点击"继续编辑"回到该检查单
 */
import { useDraftStore } from "../../../store/draftStore";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Inbox, FileEdit, Trash2, Clock } from "lucide-react";

function timeAgo(iso) {
    if (!iso) return "";
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60000) return "刚刚";
    if (ms < 3600000) return `${Math.floor(ms / 60000)}分钟前`;
    if (ms < 86400000) return `${Math.floor(ms / 3600000)}小时前`;
    return `${Math.floor(ms / 86400000)}天前`;
}

export default function DraftSection({ onContinue }) {
    const drafts = useDraftStore((s) => s.drafts);
    const removeDraft = useDraftStore((s) => s.removeDraft);

    if (drafts.length === 0) return null;

    return (
        <Card className="border-amber-200 bg-amber-50/40">
            <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                    <Inbox size={15} className="text-amber-600" />
                    <span className="text-sm font-semibold text-slate-800">未完成检查单（草稿箱）</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {drafts.map((d) => (
                        <div
                            key={d.flightId}
                            className="flex flex-col rounded-lg border border-amber-200 bg-white p-3 shadow-sm transition-shadow hover:shadow"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-800">{d.flightNo}</span>
                                <button
                                    onClick={() => {
                                        if (confirm(`删除 ${d.flightNo} 草稿？`)) removeDraft(d.flightId);
                                    }}
                                    className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500"
                                    title="删除草稿"
                                >
                                    <Trash2 size={13} className="text-red-600" />
                                </button>
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock size={10} /> 更新于 {timeAgo(d.updatedAt)}
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                                <span className="rounded bg-slate-100 px-1.5 py-0.5">
                                    {d.templateId === "passenger-checklist" ? "客运" : "货运"}
                                </span>
                                <span className="truncate">
                                    {d.templateId === "passenger-checklist" ? "客运检查单" : "货运检查单"}
                                </span>
                            </div>
                            <div className="mt-3">
                                <Button size="sm" className="w-full" onClick={() => onContinue(d)}>
                                    <FileEdit size={13} /> 继续编辑
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
