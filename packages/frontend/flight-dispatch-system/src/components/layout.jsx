import { useTabsStore } from "../store/tabsStore";
import { useDraftStore } from "../store/draftStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Plane, ClipboardCheck, ListChecks, CalendarDays } from "lucide-react";
import DigitalClock from "./DigitalClock";
import { cn } from "../lib/utils";

const tabs = [
    { id: "flights", label: "航班列表", icon: CalendarDays, path: "/" },
    { id: "checklist", label: "检查单", icon: ClipboardCheck, path: "/checklist" },
    { id: "records", label: "填写记录", icon: ListChecks, path: "/records" },
];

export default function Layout({ children }) {
    const { activeTab, setActiveTab } = useTabsStore();
    const drafts = useDraftStore((s) => s.drafts);
    const navigate = useNavigate();
    const location = useLocation();

    const handleTabClick = (tab) => {
        setActiveTab(tab.id);
        navigate(tab.path);
    };

    return (
        <div className="flex min-h-screen flex-col">
            {/* 顶部导航栏 —— 全站固定 */}
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="flex h-16 items-center justify-between gap-4 px-6">
                    {/* 左侧：Logo + 标题 + 数码管时钟 */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                                <Plane size={20} />
                            </div>
                            <div>
                                <h1 className="text-[15px] font-bold leading-tight text-slate-900">航班调度检查系统</h1>
                                <p className="text-[11px] leading-tight text-slate-400">Flight Dispatch Check System</p>
                            </div>
                        </Link>
                        <DigitalClock />
                    </div>

                    {/* 中间：三 TAB 导航（全站可见） */}
                    <nav className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const draftCount = tab.id === 'checklist' ? Math.min(drafts.length, 5) : 0;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab)}
                                    className={cn(
                                        "relative flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-white text-primary-700 shadow-sm"
                                            : "text-slate-600 hover:text-slate-900",
                                    )}
                                >
                                    <Icon size={15} />
                                    {tab.label}
                                    {/* 检查单：未提交草稿数小红点（最多 5） */}
                                    {draftCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow">
                                            {draftCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="flex-1 overflow-hidden p-2">{children}</main>
        </div>
    );
}