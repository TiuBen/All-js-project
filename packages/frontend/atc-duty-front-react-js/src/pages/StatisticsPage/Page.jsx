import React from "react";
import { TabNav } from "@radix-ui/themes";
import YearMonthTab from "../../components/YearMonthTab";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

function Page() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isActive = (path) => pathname === path || (path === "/statistics/night-count" && pathname === "/statistics");

    return (
        <div className="flex flex-col gap-2">
            <YearMonthTab />

            <TabNav.Root>
                <TabNav.Link
                    className="h-4 text-lg"
                    href="/statistics/night-count"
                    active={isActive("/statistics/night-count")}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/statistics/night-count");
                    }}
                >
                    夜班频次
                </TabNav.Link>
                <TabNav.Link
                    href="/statistics/detail"
                    active={isActive("/statistics/detail")}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/statistics/detail");
                    }}
                >
                    个人时长摘要
                </TabNav.Link>
                <TabNav.Link
                    href="/statistics/position"
                    active={isActive("/statistics/position")}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/statistics/position");
                    }}
                >
                    席位统计
                </TabNav.Link>
                <TabNav.Link
                    href="/statistics/check"
                    active={isActive("/statistics/check")}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/statistics/check");
                    }}
                >
                    合规检查
                </TabNav.Link>
            </TabNav.Root>
            <div>
                <Outlet />
            </div>
        </div>
    );
}

export default Page;
