// src/pages/train-theory/index.jsx - 理论培训布局：仅页签容器
// 页签由嵌套路由驱动：/theory/database(理论题库) /theory/editor(理论出题) /theory/marking(阅卷) /theory/exam(在线考试)
// 每个页签页面内部自带左侧 TreeViewer（见各子页面），布局不共用树
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Database, PenLine, ClipboardCheck, MonitorPlay } from "lucide-react";
import Tabs from "../../components/Tabs";

const TABS = [
    { key: "database", label: "题库", icon: Database },
    { key: "editor", label: "出题", icon: PenLine },
    { key: "marking", label: "阅卷", icon: ClipboardCheck },
    { key: "exam", label: "在线考试", icon: MonitorPlay },
];

export default function TrainTheory() {
    const nav = useNavigate();
    const { pathname } = useLocation();

    // 从 URL 反推当前页签（/theory/database → database）
    const active = TABS.find((t) => pathname.endsWith(`/${t.key}`))?.key || TABS[0].key;

    return (
        <div className="h-full min-h-0 card p-0 overflow-hidden flex flex-col">
            <Tabs tabs={TABS} activeKey={active} onChange={(key) => nav(`/theory/${key}`)} className="h-full">
                <Outlet />
            </Tabs>
        </div>
    );
}
