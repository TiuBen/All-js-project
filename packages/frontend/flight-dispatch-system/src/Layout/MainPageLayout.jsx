import { useEffect } from "react";
import { useAppStore } from "../store/app.store";
import { useDraftStore } from "../store/checklistDraft.store";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { Plane, ClipboardCheck, ListChecks, CalendarDays, Leaf, Settings } from "lucide-react";
import DigitalClock from "../components/DigitalClock";
import SwitchUserDialog from "../components/SwitchUserDialog";
import { cn } from "../utils/cn";
import { MAX_DRAFTS } from "../utils/checklistCache";

/**
 * ============================================================
 * MainPageLayout —— 主页面布局（顶部导航栏 + 内容区）
 * ------------------------------------------------------------
 * 在 App.jsx 顶层包裹所有路由：
 *   - 顶部导航栏（全站固定，路径驱动高亮，检查单草稿数角标）
 *   - 内容区 <main>（children = 各页面；页面内部可用
 *     Layout/ContentLayout 再做左右布局）
 *
 * ★ 右上角还有两个**全局入口**（都不进 tabs 数组，因为它们不是「业务页签」）：
 *   - 切换用户：`<SwitchUserDialog />` —— 按钮和弹窗都在那个组件里，
 *     它自己读写 app.store 的 currentUser，所以这边不需要任何 props / 状态；
 *   - 设置（齿轮图标）：点击 → /setting，高亮同样由当前路径决定。
 * ============================================================
 */

const tabs = [
    { id: "fips", label: "航班列表", icon: CalendarDays, path: "/fips" },
    { id: "checklist", label: "检查单", icon: ClipboardCheck, path: "/checklist" },
    { id: "special", label: "生鲜保障", icon: Leaf, path: "/special" },
    { id: "records", label: "填写记录", icon: ListChecks, path: "/records" },
];

export default function MainPageLayout() {
    // 高亮由当前路由路径决定（见下方 isActive）；setActiveTab 仅用于点击 tab 时持久化记忆
    const { setActiveTab } = useAppStore();
    // 只订阅条数（角标用）：草稿索引只在新建 / 删除 / 切模板 / 打开时变，
    // 节点正文的防抖落盘不碰索引 —— 所以这里不会跟着编辑器打字重渲染
    const draftCount = useDraftStore((s) => s.drafts.length);
    const loadDrafts = useDraftStore((s) => s.load);

    // 外壳挂载时读一次本地索引（刷新后角标才是对的）
    useEffect(() => {
        loadDrafts();
    }, [loadDrafts]);
    const navigate = useNavigate();
    const location = useLocation();

    const handleTabClick = (tab) => {
        setActiveTab(tab.id);
        navigate(tab.path);
    };

    // 设置入口：不是业务 TAB，单独走一个按钮（同样记忆 last tab 便于后续扩展）
    const isSetting = location.pathname.startsWith("/setting");
    const handleSettingsClick = () => {
        setActiveTab("setting");
        navigate("/setting");
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
                        {/* 切换用户：按钮 + 原生 <dialog> 弹窗都在组件内（自己读写 app.store） */}
                        <SwitchUserDialog />
                        <DigitalClock />
                    </div>

                    {/* 右侧：TAB 导航（全站可见） + 设置入口 */}
                    <div className="flex items-center gap-3">
                        <nav className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                // 以当前路由路径决定高亮（任何入口跳转都准确，不依赖手动同步 activeTab）
                                // fips：/ 与 /fips 都激活「航班列表」tab
                                const isActive =
                                    tab.id === "fips"
                                        ? location.pathname === "/" || location.pathname.startsWith("/fips")
                                        : location.pathname.startsWith(tab.path);
                                const badgeCount = tab.id === "checklist" ? Math.min(draftCount, MAX_DRAFTS) : 0;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab)}
                                        className={cn(
                                            "relative flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                                            isActive
                                                ? "bg-white text-primary-700 shadow-sm"
                                                : "text-slate-600 hover:text-slate-900"
                                        )}
                                    >
                                        <Icon size={15} />
                                        {tab.label}
                                        {/* 检查单：未提交草稿数小红点（最多 MAX_DRAFTS） */}
                                        {badgeCount > 0 && (
                                            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow">
                                                {badgeCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* 设置：齿轮图标 → /setting（当前在设置页时高亮） */}
                        <button
                            onClick={handleSettingsClick}
                            className={cn(
                                "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                                isSetting
                                    ? "border-primary-200 bg-primary-50 text-primary-700"
                                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            )}
                            title={isSetting ? "系统设置（当前）" : "系统设置"}
                            aria-label="系统设置"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex flex-col flex-1 overflow-hidden p-2">
                <Outlet />
            </main>
        </div>
    );
}
