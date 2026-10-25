/**
 * ============================================================
 * 草稿箱草稿展示区 —— 检查单工作台（/checklist）
 * ------------------------------------------------------------
 * 有一条草稿就铺一张卡片，点「继续编辑」回那条草稿（跳转由父级 Drafts 传进来的
 * onContinue 决定），点垃圾桶删掉它（索引 + 本机正文一起清）。
 * 一条草稿 = 一个「航班 × 检查单类型」（key = 航班::模板），所以同一航班的不同
 * 类型会各占一张卡片 —— 卡片上标出检查单类型加以区分。
 * ============================================================
 */
import { useDraftStore, draftFlightLabel } from "../../../../store/checklistDraft.store";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Inbox, FileEdit, Trash2, Clock } from "lucide-react";

function timeAgo(ms) {
    if (!ms) return "";
    const diff = Date.now() - ms;
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
}

export default function DraftSection({ onContinue }) {
    const drafts = useDraftStore((s) => s.drafts);
    const dropDraftWithData = useDraftStore((s) => s.dropDraftWithData);

    if (drafts.length === 0) return null;

    const handleDelete = async (draft) => {
        if (!window.confirm(`删除 ${draftFlightLabel(draft)} 的「${draft.templateType}」草稿？`)) return;

        await dropDraftWithData(draft.key);
    };

    return (
        <Card className="border-amber-200 bg-amber-50/40">
            <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                    <Inbox size={15} className="text-amber-600" />
                    <span className="text-sm font-semibold text-slate-800">未完成检查单（草稿箱）</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {drafts.map((draft) => (
                        <div
                            key={draft.key}
                            className="flex flex-col rounded-lg border border-amber-200 bg-white p-3 shadow-sm transition-shadow hover:shadow"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-800">{draftFlightLabel(draft)}</span>
                                <button
                                    onClick={() => handleDelete(draft)}
                                    className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500"
                                    title="删除草稿（本机填写内容一并清空）"
                                >
                                    <Trash2 size={13} className="text-red-600" />
                                </button>
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock size={10} /> 更新于 {timeAgo(draft.updatedAt)}
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                                <span className="rounded bg-slate-100 px-1.5 py-0.5">{draft.templateType}</span>
                            </div>
                            <div className="mt-3">
                                <Button size="sm" className="w-full" onClick={() => onContinue(draft)}>
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
