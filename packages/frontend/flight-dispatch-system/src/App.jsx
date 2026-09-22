import { Routes, Route, Navigate } from "react-router-dom";
import MainPageLayout from "./Layout/MainPageLayout";
import FipsPage from "./pages/FipsPage/FipsPage";
import RecordsPage from "./pages/RecordsPage/RecordsPage";
import SpecialPage from "./pages/SpecialPage/SpecialPage";
import Drafts from "./pages/ChecklistPage/Drafts/Drafts";
import ChecklistEditor from "./pages/ChecklistPage/ChecklistEditor/ChecklistEditor";
import ChecklistViewer from "./pages/ChecklistPage/ChecklistViewer/ChecklistViewer";

/**
 * ============================================================
 * App —— 路由表（嵌套路由：MainPageLayout 作为布局路由）
 * ------------------------------------------------------------
 * MainPageLayout 渲染顶部导航 + <Outlet/>，各页面作为子路由
 * 挂载在 <Route element={<MainPageLayout />}> 之下。
 *
 * Tab 对应：
 *   /fips     航班列表（原 FlightSchedulePage 已并入 FipsPage）
 *   /checklist 检查单工作台（Drafts，草稿箱）
 *   /special  生鲜保障（原 FreshGuaranteePage）
 *   /records  填写记录
 * ============================================================
 */
export default function App() {
    return (
        <Routes>
            <Route element={<MainPageLayout />}>
                <Route path="/" element={<Navigate to="/fips" replace />} />
                <Route path="/fips" element={<FipsPage />} />

                {/* 检查单工作台（/checklists 兼容旧链接） */}
                <Route path="/checklist" element={<Drafts />} />
                <Route path="/checklists" element={<Drafts />} />
                {/* 航班维度的检查单：/checklists/flight/:flightId?checkTemplate=1 */}
                <Route path="/checklists/flight/:flightId" element={<ChecklistEditor />} />
                {/* 检查单详情（主键维度）：/checklists/:checkedId（编辑态由页面读 ?mode=edit 处理） */}
                <Route path="/checklists/:checkedId" element={<ChecklistViewer />} />

                <Route path="/records" element={<RecordsPage />} />

                <Route path="/special" element={<SpecialPage />} />

                <Route path="*" element={<Navigate to="/fips" replace />} />
            </Route>
        </Routes>
    );
}
