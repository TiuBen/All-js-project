// src/pages/train-simulator/index.jsx - 模拟机培训布局：仅页签容器
// 页签由嵌套路由驱动：/simulator/database(模拟机题库) /simulator/arrange(模拟机培训安排)
// /simulator/mentoring(带培记录) /simulator/training(受训记录)
// 每个页签页面内部自带左侧 TreeViewer（见各子页面），布局不共用树
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Database, CalendarDays, UserCheck, GraduationCap } from "lucide-react";
import Tabs from "../../components/Tabs";

const TABS = [
    { key: "database", label: "题库", icon: Database },
    { key: "arrange", label: "培训安排", icon: CalendarDays },
    { key: "mentoring", label: "带培", icon: UserCheck },
    { key: "training", label: "受训", icon: GraduationCap },
];

export default function TrainSimulator() {
    const nav = useNavigate();
    const { pathname } = useLocation();

    // 从 URL 反推当前页签（/simulator/exercise → exercise）
    const active = TABS.find((t) => pathname.endsWith(`/${t.key}`))?.key || TABS[0].key;

    return (
        <div className="h-full min-h-0 card p-0 overflow-hidden flex flex-col">
            <Tabs tabs={TABS} activeKey={active} onChange={(key) => nav(`/simulator/${key}`)} className="h-full">
                <Outlet />
            </Tabs>
        </div>
    );
}
