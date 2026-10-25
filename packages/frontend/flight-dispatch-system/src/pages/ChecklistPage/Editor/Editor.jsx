import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import ChecklistToolbar from "../ChecklistToolbar/ChecklistToolbar";
import ContentLayout from "../../../Layout/ContentLayout";
import { useChecklistStore } from "../../../store/checklistEditorPage.store";
import { TEMPLATE_TYPE_BY_KEY } from "../../../config/dataSource";

import VideoList from "./Components/VideoList";
import MainList from "./Components/MainList";
import AuxiliaryList from "./Components/AuxiliaryList";

/**
 * ============================================================
 * Editor —— 检查单填写页（/checklists/flight/:flightUuid?template=...）
 * ------------------------------------------------------------
 * ★ 本文件只做两件事：
 *     ① 把**路由上的航班 / 模板**同步进 checklistEditorPage.store
 *     ② 按三栏显隐把三个面板摆出来
 *   面板自己是一个字都不用传的 —— 模板数据、草稿键、选中主项全在 store 里，
 *   各自订阅（MainList / AuxiliaryList / VideoList 源码顶部有对应说明）。
 *
 * ★ 「航班 + 模板」= 一条草稿：草稿键由 store 的 setFlightUuid /
 *   setTemplateType 统一重算（规则在 utils/checklistCache 的 draftKeyOf），
 *   页面里不再出现任何拼接 key 的代码。
 * ============================================================
 */
function Editor() {
    // 航班身份就是路由上的 :flightUuid（= 航班表主键 uuid）
    const { flightUuid } = useParams();

    const mainColVisible = useChecklistStore((s) => s.mainColVisible);
    const auxColVisible = useChecklistStore((s) => s.auxColVisible);
    const videoColVisible = useChecklistStore((s) => s.videoColVisible);
    const templateType = useChecklistStore((s) => s.templateType);
    const setFlightUuid = useChecklistStore((s) => s.setFlightUuid);
    const setTemplateType = useChecklistStore((s) => s.setTemplateType);

    // ① 路由上的航班 → store（草稿键随之重算）
    useEffect(() => {
        setFlightUuid(flightUuid);
    }, [flightUuid, setFlightUuid]);

    /**
     * ② URL 上带 ?template=<标识> 就把它翻译成中文类型名写进 store。
     * ★ 跟着 URL 走、而不是只在挂载时认一次：从草稿箱点另一条草稿进来时
     *   URL 换了但组件不会重新挂载，只认首次就会一直用错模板。
     *   切模板下拉是「先 setTemplateType 再改 URL」，两边值一致 → 这里不会反过来覆盖。
     * ★ 认不出来的标识（没带参数 / 写错了）保持 store 原值，不报错。
     */
    const [searchParams] = useSearchParams();
    const templateFromUrl = TEMPLATE_TYPE_BY_KEY[searchParams.get("template")];
    useEffect(() => {
        if (templateFromUrl && templateFromUrl !== templateType) setTemplateType(templateFromUrl);
    }, [templateFromUrl, templateType, setTemplateType]);

    return (
        <ContentLayout>
            <ChecklistToolbar />
            {/* min-h-0 是必须的：flex 项默认 min-height:auto，会拒绝收缩到内容高度以下
                → 这一行会被最长的列撑高，列高 = 内容高，overflow-y-auto 永远没东西可滚
                （内容被 ContentLayout 的 overflow-hidden 直接裁掉）。
                加 min-h-0 后本行高度 = 剩余空间（确定值），列才能各自内部滚动。 */}
            <div className="flex min-h-0 flex-row gap-2 flex-1 mt-2">
                <div className={`${!mainColVisible ? "hidden" : ""}  flex-1 overflow-y-auto`}>
                    <MainList />
                </div>
                <div className={`${!auxColVisible ? "hidden" : ""} flex-1 overflow-y-auto `}>
                    <AuxiliaryList />
                </div>
                <div className={`${!videoColVisible ? "hidden" : ""} flex-1 overflow-y-auto `}>
                    <VideoList />
                </div>
            </div>
        </ContentLayout>
    );
}

export default Editor;

// main
// ├── input type time
// ├── input type text
// └── auxiliary
//     ├── input type text
//     ├── input type file
//     └── input type time
//     └── auxiliary
//     ├── input type text
//     ├── input type file
//     └── input type time
