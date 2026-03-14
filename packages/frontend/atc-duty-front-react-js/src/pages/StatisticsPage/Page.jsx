import React, { useEffect } from "react";
import { TabNav } from "@radix-ui/themes";
import { useStatisticsStore } from "../../store/statistics.store";
import YearMonthTab from "../../components/YearMonthTab";

function Page(year = 2026) {
    const { statistics, loading, query, setQuery, fetchStatistics } = useStatisticsStore();

    useEffect(() => {
        fetchStatistics();
        console.log(statistics);
    }, []);
    return (
        <div className="flex flex-col gap-2">
            <YearMonthTab />

            {/* 你的 Tab 控制栏 */}
            <TabNav.Root>
                <TabNav.Link href="#" active>
                    夜班频次
                </TabNav.Link>
                <TabNav.Link href="#">当月时长</TabNav.Link>
            </TabNav.Root>
        </div>
    );
}

export default Page;
