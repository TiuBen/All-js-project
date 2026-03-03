import React from "react";
import { TowerControl, PlaneTakeoff, LogIn, LogOut, UserCircle2 } from "lucide-react";

function TopNav() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const handleLogin = () => {
        window.location.href = "/login";
    };
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/";
    };

    return (
        <header className="flex flex-row h-full items-center justify-between  flex-1 bg-blue-800 text-white col-span-2">
            <h3 className="text-xl mx-4 font-bold  flex gap-2">
                <PlaneTakeoff />
                湖北国际物流机场空管服务公司
            </h3>

            <h3 className="text-xl mx-4 font-bold flex gap-2">
                <TowerControl />
                管制执勤统计
            </h3>
            {/* 右侧 登录 / 登出 */}
            <div className="flex items-center gap-3 px-4">
                {token && username ? (
                    <>
                        <div className="flex items-center gap-2 text-sm"></div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded transition"
                        >
                            <span>{username}</span>
                            <LogOut className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded transition"
                    >
                        <LogIn className="w-4 h-4" />
                        登录
                    </button>
                )}
            </div>
        </header>
    );
}

export default TopNav;
