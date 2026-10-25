/**
 * ============================================================
 * 检查单工作台 —— /checklist
 * ------------------------------------------------------------
 * 只展示**草稿箱里的未完成检查单**，点「继续编辑」回到那一条（航班 × 模板）。
 * 新建检查单的入口在航班列表页（那边才有航班信息与模板推断），这里给一个跳转。
 * 草稿索引的读写规则见 store/checklistDraft.store.js + utils/checklistCache.js。
 * ============================================================
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import DraftSection from "./components/DraftSection";
import { useDraftStore } from "../../../store/checklistDraft.store";
import { MAX_DRAFTS } from "../../../utils/checklistCache";
import { Inbox, FileText } from "lucide-react";

export default function Drafts() {
    const navigate = useNavigate();
    const drafts = useDraftStore((s) => s.drafts);
    const load = useDraftStore((s) => s.load);

    // 进工作台现读一遍本地索引（别的标签页删过 / 加过草稿也能对上）
    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="flex flex-col items-stretch space-y-4 p-2">
            {/* 顶部标题 + 入口说明 */}
            <div className="self-center">
                <h1 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <Inbox size={20} className="text-amber-500" />
                    检查单工作台
                    {drafts.length > 0 && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                            {drafts.length} 份草稿
                        </span>
                    )}
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                    选择下方草稿继续编辑,最多保留 {MAX_DRAFTS} 份；或从航班列表创建新的检查单 ;
                </p>
            </div>

            {drafts.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Inbox size={26} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-slate-700">暂无未完成检查单</div>
                            <div className="mt-1 text-xs text-slate-400">
                                在航班列表点击“创建检查单”开始填写，会自动保存在草稿箱
                            </div>
                        </div>
                        <Button className="mt-2" onClick={() => navigate("/fips")}>
                            <FileText size={13} /> 前往航班列表
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <DraftSection
                    onContinue={(d) => {
                        // 草稿 = 航班 × 模板：URL 两者都带，装载时才能取到"这一份"
                        navigate(`/checklists/flight/${d.flightUuid}?template=${d.templateKey}`);
                    }}
                />
            )}
        </div>
    );
}
