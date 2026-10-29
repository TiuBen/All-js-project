import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import FlightSearchCard from "../../../components/search/FlightSearchCard";
import Calendar from "../../../components/search/Calendar";
import { Plus, Pencil, Trash2, Leaf, Ban, Lock, FileText } from "lucide-react";
import { useSidebarStore } from "../../../store/sidebar.store";
import { useChecklistStore, TYPE_ORDER } from "../../../store/checklistEditorPage.store";
import { useDraftStore, draftFullHint } from "../../../store/checklistDraft.store";
import { useAppStore } from "../../../store/app.store";
import {
    isReadonlySource,
    sourceNameOf,
    templateKeyOf,
    TEMPLATE_TYPE_BY_KEY,
} from "../../../config/dataSource";

/** 没选中行时所有「对选中航班」按钮的统一提示 */
const SELECT_HINT = "请先点击表格中的一行选中航班";

/**
 * ============================================================
 * FipsPage 私有 Sidebar —— 左侧边栏
 * ------------------------------------------------------------
 * 搜索卡 + 日期 + 两组操作，两组的作用对象完全不同：
 *
 *   ① 对**选中的航班**的动作 —— 任何数据源都显示，没选中时整组禁用
 *        创建检查单 / 标记为生鲜 / 取消生鲜标记
 *      检查单（records_checklist）与生鲜台账（records_special）都是**独立记录**，
 *      只挂航班外键、不写航班表本身，所以只读源一样能建能标。
 *
 *   ② 写**航班表**的动作 —— 只有 manual_fips 显示（添加 / 修改 / 删除）
 *      后端只有这张表提供 POST / PUT / DELETE。
 *      ★ 只读源是「整组不渲染」而不是「渲染出来禁用」：禁用态容易被理解成
 *        「我这边操作有问题」，不出现才能一眼看出当前源压根没这个能力；
 *        空出来的位置给一句只读说明，顺便告诉用户去哪儿切源。
 *
 * ★ **不接任何 props**：数据与动作全部来自 fips.store（选中行 / 对话框 / 行操作），
 *   数据源读 app.store —— 所以换源 / 换选中行，这排按钮自己就跟着变。
 * ============================================================
 */
export default function Sidebar() {
    const navigate = useNavigate();

    // 搜索卡的筛选状态已经搬到 FlightSearchCard 内部（直连 fips.store），这里不再订阅
    // 选中行 + 行操作 + 对话框（动作都在 sidebar.store，这里只负责点按钮和确认框）
    const { selectedFlight, openAdd, openEdit, removeSelected, markSelectedFresh, unmarkSelectedFresh } =
        useSidebarStore();
    // 创建检查单时要把模板类型先写进编辑器 store（详见 handleCreateChecklist）
    const setTemplateType = useChecklistStore((s) => s.setTemplateType);
    // 草稿箱：跳转前先把「这个航班 × 这个模板」登记成一条草稿（满 5 条就拦下）
    const createDraft = useDraftStore((s) => s.createDraft);

    // 当前数据源 —— 决定「写航班」那一组出不出来
    const source = useAppStore((s) => s.source);
    /** 能不能写航班表：只有 manual_fips 可以（fips / ecyilang 后端只有 GET） */
    const canWriteFlight = !isReadonlySource(source);

    // 选中行就是 selectedFlight 本身（原始行，含 uuid / flight_no / a|d_flight_no_full）。
    // ⚠️ 千万别再包一层 `const selected = selectedFlight !== null` 这种布尔别名 ——
    //   它会把下面所有 selected.xxx 全变成 undefined（true.uuid === undefined），
    //   URL 就会被拼成 /checklists/flight/undefined，提交时报
    //   「flightUuid 必须是航班 uuid：undefined」。
    // 生鲜台账按「航班号 + 日期」定位：没有航班号的行写不进去（store 会抛错），
    // 所以提前禁用 + 换提示，别让用户点了才吃一个报错
    const noFlightNo = !!selectedFlight && !selectedFlight.flight_no;
    /** 「标记 / 取消生鲜」两个按钮共用的可用性与提示 */
    const freshDisabled = !selectedFlight || noFlightNo;
    const freshTitle = (action) =>
        (!selectedFlight ? SELECT_HINT : noFlightNo ? "该行没有航班号，无法写入生鲜台账" : action);

    /** 删除选中航班（不可逆，先确认） */
    const handleDelete = async () => {
        if (!selectedFlight) return;
        if (!window.confirm(`确定删除航班 ${selectedFlight.flight_no || ""} 吗？`)) return;
        try {
            // 生鲜台账不用手动清：后端删 manual_fips 时会把该航班的台账一并删掉
            await removeSelected();
        } catch (err) {
            alert(`删除失败：${err.message}`);
        }
    };

    /** 标记为生鲜 / 取消标记（都落在台账 nodes.freshMark） */
    const handleMarkFresh = async () => {
        try {
            await markSelectedFresh();
        } catch (err) {
            alert(`标记失败：${err.message}`);
        }
    };
    const handleUnmarkFresh = async () => {
        try {
            await unmarkSelectedFresh();
        } catch (err) {
            alert(`取消失败：${err.message}`);
        }
    };

    /**
     * 创建检查单：定好模板类型 + 建草稿 + 跳转带航班键的 URL，
     * 真正的装载（航班行 / 草稿正文）由编辑器按 URL 自己认。
     * ★ URL 刻意不带 ?record → 编辑器处于**新建态**，提交走 POST 新增一条，
     *   该航班以前的检查单原样保留。
     *
     * ★ 跳转前先 setTemplateType：模板类型在 store 里存的是**中文名**，
     *   而 URL 上的 ?template= 是**标识**（cargoBypassFlight 这类），两者靠
     *   TEMPLATE_TYPE_BY_KEY 互转。编辑器挂载时也会按 URL 认一次，两边值一致。
     * ★ 草稿箱最多 5 条：满了就不跳转（先让用户去草稿箱清一条）——
     *   进去也存不下，白白让用户以为填的东西被记住了。
     */
    const handleCreateChecklist = () => {
        if (!selectedFlight) return;

        const templateKey = templateKeyOf(selectedFlight.flight_no);
        // 兜底默认 = 类型下拉的第一项，和 templateKeyOf 的默认标识是同一个模板
        const templateType = TEMPLATE_TYPE_BY_KEY[templateKey] ?? TYPE_ORDER[0];

        // 草稿显示 / 提交时的 callsign：优先现成的 flight_no，
        // 原始快照行（raw）再退 d / a 侧航班号 —— 不能直接字符串相加，
        // 否则 null 会拼出 "XXnullnull" 这种垃圾
        const flightNo =
            selectedFlight.flight_no || selectedFlight.d_flight_no_full || selectedFlight.a_flight_no_full || "";

        const res = createDraft({
            flightUuid: selectedFlight.uuid,
            flightNo,
            templateKey,
            templateType,
        });

        if (!res.ok) {
            alert(`${draftFullHint()}。`);
            return;
        }

        setTemplateType(templateType);
        navigate(`/checklists/flight/${selectedFlight.uuid}?template=${templateKey}`);
    };

    return (
        <aside className="flex shrink-0 flex-col gap-2 overflow-y-auto" style={{ width: 320 }}>
            <FlightSearchCard />

            <Calendar />

            <Card>
                <CardContent className="space-y-2">
                    {/* ---------- ① 对选中的航班（任何数据源都显示） ---------- */}
                    <Button
                        size="sm"
                        className="w-full"
                        disabled={!selectedFlight}
                        onClick={handleCreateChecklist}
                        title={!selectedFlight ? SELECT_HINT : "为选中的航班创建检查单"}
                    >
                        <FileText size={14} /> 创建检查单
                    </Button>

                    {/* 生鲜标记：已生鲜的不能再标，没标过的不能取消 */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            size="sm"
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            disabled={freshDisabled || selectedFlight?.is_fresh}
                            onClick={handleMarkFresh}
                            title={freshTitle("将选中的航班标记为生鲜货物")}
                        >
                            <Leaf size={14} /> 标记为生鲜
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            disabled={freshDisabled || !selectedFlight?.is_fresh}
                            onClick={handleUnmarkFresh}
                            title={freshTitle("取消选中的航班的生鲜标记")}
                        >
                            <Ban size={14} /> 取消生鲜标记
                        </Button>
                    </div>

                    {/* ---------- ② 写航班表（只有 manual_fips 这一组） ---------- */}
                    <div className="border-t border-slate-100 pt-2">
                        {canWriteFlight ? (
                            <div className="grid grid-cols-3 gap-2">
                                <Button size="sm" className="w-full" onClick={openAdd}>
                                    <Plus size={14} /> 添加
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    disabled={!selectedFlight}
                                    onClick={openEdit}
                                    title={!selectedFlight ? SELECT_HINT : "修改选中的航班"}
                                >
                                    <Pencil size={14} /> 修改
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    disabled={!selectedFlight}
                                    onClick={handleDelete}
                                    title={!selectedFlight ? SELECT_HINT : "删除选中的航班"}
                                >
                                    <Trash2 size={14} /> 删除
                                </Button>
                            </div>
                        ) : (
                            /* 只读源：写航班的整组不渲染，换成一句说明 */
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <Lock size={13} /> 只读数据源（{sourceNameOf(source)}）
                                </div>
                                <p className="text-[11px] leading-relaxed text-slate-400">
                                    该源后端只提供查询，所以「添加 / 修改 / 删除」整组不显示 —— 写入固定落在 manual_fips
                                    表。上面的检查单与生鲜标记不受影响（各写各的 records_* 表）。
                                    需要录入航班，请到设置页把数据源切成「手动」。
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </aside>
    );
}
