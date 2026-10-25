import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
// 主体三块：三个 CheckList（各自零 props，自订阅 store + 自己的扁平视图数据）
import MainCheckList from "./Components/MainCheckList";
import AuxiliaryCheckList from "./Components/AuxiliaryCheckList";
import VideoCheckList from "./Components/VideoCheckList";
// import { useChecklistStore, useIsLocked, typeColorOf, checkTemplateOfType } from "../../../store/checklist.store";
import { AlertCircle, ArrowLeft, FilePlus2, Loader2, Pencil } from "lucide-react";

/**
 * ============================================================
 * ChecklistViewer —— 检查单详情（只读查看器）
 * ------------------------------------------------------------
 * ★ **零 props**：身份来自 URL（/checklists/:checkedId），数据全部自订阅 store
 *   - checkedId          → loadRecord() 拉记录并装配 航班 / 模板 / 记录元数据
 *   - flight / template  → 标题栏（航班号 · 航线 · 机型 · 检查单类型配色）
 *   - loadedRecord  → 只读展示：**三个并排的 CheckList**
 *                       主监控指标   MainCheckList
 *                       辅助监控指标 AuxiliaryCheckList
 *                       视频监管     VideoCheckList
 *   - recordStatus / checkedAt / isLocked → 已提交徽章 · 24h 锁定
 *
 * ★ 三块列表都是「一维」，不是树
 *   查看页要的是通读：拍平这件事在编译期做完了
 *   （EditorTemplateJson → scripts/gen-view-static.cjs → ViewTemplateJson），
 *   所以三个 List 只管 map 数组，三个列表组件各自零 props、各自订阅。
 *   配色统一走 utils/ViewColor.js（目前异常红、其余灰）。
 *
 * ★ 两个出口各走一条装载路径（URL 决定提交语义，不靠 store 残留态猜）：
 *   - **新建检查单（默认动作）**：回该航班的编辑器，**URL 不带 ?record** →
 *     openFlight 装一张空表，提交调 createRecord（POST）**新增一条记录**，
 *     旧记录原样保留（一个航班可以有多份检查单）。
 *   - **修改**（次要）：回编辑器并带 **?record=<当前记录 id>** → openRecordForEdit
 *     把落库内容灌进填写层，进去即是原填写内容，提交调 updateRecord（PUT）改这一条。
 * ============================================================
 */
export default function ChecklistViewer() {
    const { checkedId } = useParams();
    const navigate = useNavigate();

    // // ===== store 订阅（细粒度 selector：取自渲染真正需要的）=====
    // const flight = useChecklistStore((s) => s.flight);
    // const loadedRecord = useChecklistStore((s) => s.loadedRecord);
    // const tplId = useChecklistStore((s) => s.template?.id);
    // const recordStatus = useChecklistStore((s) => s.recordStatus);
    // const checkedAt = useChecklistStore((s) => s.checkedAt);
    // const loadRecord = useChecklistStore((s) => s.loadRecord);
    // const reset = useChecklistStore((s) => s.reset);
    // const isLocked = useIsLocked();

    // 拉取记录：store 里已是同一条（刚提交跳进来）就跳过，避免多余请求
    // useEffect(() => {
    //     if (String(loadedRecord?.id) === String(checkedId)) return;
    //     loadRecord(checkedId);
    // }, [checkedId, loadedRecord?.id, loadRecord]);

    /**
     * 新建检查单：为该航班**新增**一张空白检查单（不动当前这条记录）
     * 顺序要紧 —— 先在 reset 前取出航班键与类型（reset 会把它们清掉），
     * 再把 checkTemplate 带在 URL 上，让编辑器装载时保持同一种检查单类型；
     * ★ 刻意**不带 ?record** —— 编辑器据此走新建态，提交调 createRecord（POST 新增一条）。
     */
    // const handleCreateNew = () => {
    //     const s = useChecklistStore.getState();
    //     const flightKey = s.flight?.uuid || s.flight?.queryId;
    //     if (!flightKey) return;
    //     const ct = checkTemplateOfType(s.template?.id);
    //     reset(); // 清 recordId（否则提交走 update）/ loadedRecord / 填写层内存
    //     navigate(`/checklists/flight/${flightKey}${ct ? `?checkTemplate=${ct}` : ""}`);
    // };

    // 首帧（记录未到位）—— 与"加载中"占位同一个出口
    // if (!flight) {
    //     return (
    //         <div className="flex h-[calc(100vh-112px)] items-center justify-center text-sm text-slate-400">
    //             <Loader2 className="mr-2 animate-spin" size={18} /> 正在加载记录…
    //         </div>
    //     );
    // }

    return (
        <div className="flex h-[calc(100vh-112px)] flex-col gap-2 overflow-hidden">
            {/* 顶部标题栏 */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
