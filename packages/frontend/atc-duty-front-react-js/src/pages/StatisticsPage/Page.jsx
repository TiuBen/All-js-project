import React, { useEffect } from "react";
import { TabNav } from "@radix-ui/themes";
import { useStatisticsStore } from "../../store/statistics.store";
import YearMonthTab from "../../components/YearMonthTab";
import { useRouterStore } from "../../store/router.store";
function Page(year = 2026) {
    const { statistics, loading, query, setQuery, fetchStatistics } = useStatisticsStore();
    const push = useRouterStore((s) => s.push);

    useEffect(() => {
        fetchStatistics();
        console.log(statistics);
    }, []);
    return (
        <div className="flex flex-col">
            <YearMonthTab />

            {/* 你的 Tab 控制栏 */}
            <TabNav.Root>
                <TabNav.Link
                    href="/statistics/night-count"
                    active
                    onClick={(e) => {
                        e.preventDefault();
                        push("/statistics/night-count");
                    }}
                >
                    夜班频次
                </TabNav.Link>
                <TabNav.Link href="#">个人执勤</TabNav.Link>
                <TabNav.Link href="#">席位统计</TabNav.Link>
                <TabNav.Link href="#">合规检查</TabNav.Link>
            </TabNav.Root>
        </div>
    );
}

export default Page;
