// src/layouts/AdminLayout.jsx - 后台风格布局：左侧边栏 + 顶栏 + 内容区
// 顶栏角标数量来自 taskStore.stats，侧边栏高亮当前路由
import { NavLink, Outlet, Link } from "react-router-dom";
import { useEffect } from "react";
import { LayoutDashboard, CalendarDays, BookOpen, FolderOpen, User } from "lucide-react";
import useTaskStore from "../store/taskStore";

const MENU = [
    { to: "/workbench", label: "工作台", Icon: LayoutDashboard },
    { to: "/simulator-form", label: "模拟机培训/考核", Icon: CalendarDays, dotKey: "todo" },
    { to: "/theory-form", label: "理论培训", Icon: BookOpen },
    { to: "/training-items", label: "训练项目库", Icon: FolderOpen },
    { to: "/profile", label: "个人信息", Icon: User },
];

export default function AdminLayout() {
    const stats = useTaskStore((s) => s.stats);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* 左侧边栏 */}
            <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col">
                <div className="h-14 flex items-center px-5 border-b border-gray-100">
                    <span className="font-bold text-primary text-base">培训/考核工作台</span>
                </div>
                <nav className="flex-1 py-3">
                    {MENU.map((m) => (
                        <NavLink
                            key={m.to}
                            to={m.to}
                            className={({ isActive }) =>
                                "flex items-center gap-3 mx-3 px-3 py-2.5 rounded-md text-sm transition-colors " +
                                (isActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-gray-600 hover:bg-gray-50")
                            }
                        >
                            <m.Icon size={16} />
                            <span className="flex-1">{m.label}</span>
                            {m.dotKey && stats[m.dotKey] > 0 && (
                                <span className="min-w-5 h-5 px-1.5 rounded-full bg-danger text-white text-xs leading-5 text-center">
                                    {stats[m.dotKey]}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">v6 · e-train 培训系统</div>
            </aside>

            {/* 右侧：顶栏 + 内容 */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
                    <span className="text-sm text-gray-400">
                        模拟机培训 / 考核管理系统（网页版 · 对齐微信小程序功能）
                    </span>
                    <Link to="/workbench" className="text-sm text-gray-500 hover:text-primary transition-colors">
                        消息提醒
                        {stats.message > 0 && (
                            <span className="ml-1.5 min-w-5 h-5 px-1.5 inline-block rounded-full bg-danger text-white text-xs leading-5 text-center">
                                {stats.message}
                            </span>
                        )}
                    </Link>
                </header>
                <main className="flex-1 min-h-0 overflow-y-auto w-full mx-auto p-2">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
