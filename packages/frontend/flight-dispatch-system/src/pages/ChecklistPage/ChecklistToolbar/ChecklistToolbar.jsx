import { useParams } from "react-router-dom";

import EditorToolbar from "./EditorToolbar";
import ViewerToolbar from "./ViewerToolbar";

/**
 * ============================================================
 * ChecklistToolbar —— 检查单页顶部固定区（路由分流的壳）
 * ------------------------------------------------------------
 * 目录：ChecklistPage/ChecklistToolbar/
 *   ChecklistToolbar.jsx  本文件：只认路由，决定渲染哪一套按钮
 *   EditorToolbar.jsx     填写页（/checklists/flight/:flightUuid）
 *   ViewerToolbar.jsx     查看页（/checklists/:recordId）
 *   Components/           两个工具栏共用 / 各用的按钮组件
 *                         （PanelSwitcher 两边都用；类型下拉、草稿箱只有填写页用）
 * ------------------------------------------------------------
 * ★ **两条路由共用这一个工具栏组件，调用方一律 `<ChecklistToolbar />`、零 props**：
 *   页面自己不用再区分「我是编辑还是查看」，插上去就对了。
 *
 * ★ 判据是**路由参数**，不是路径字符串前缀：
 *   /checklists/flight/:flightUuid  → `flightUuid` 有值、`recordId` 为 undefined
 *   /checklists/:recordId           → `recordId` 有值、`flightUuid` 为 undefined
 *   （/checklists 是草稿箱，不渲染本组件）
 *   所以只看 `recordId` 在不在就够了，不依赖 base path 有没有被改。
 *
 * ★ 为什么拆成两个子组件而不是一个组件里写 `if`：
 *   两套按钮订阅的 store 完全不同（填写页要 templateType / 草稿箱 / 小地图，
 *   查看页要记录 + 修改态），塞进同一个组件会让「只在一边用得上」的 hook
 *   也照样常驻执行。拆开后各自只订阅自己那份，也没有 hook 顺序的坑。
 * ============================================================
 */
export default function ChecklistToolbar() {
    const { recordId } = useParams();

    return recordId ? <ViewerToolbar /> : <EditorToolbar />;
}
