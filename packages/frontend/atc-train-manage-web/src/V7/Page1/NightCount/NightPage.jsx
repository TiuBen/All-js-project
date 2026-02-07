import React, { useState, useEffect } from "react";
import { TabNav, Tabs } from "@radix-ui/themes";
import NightCountByHourSlot from "./NightCountByHourSlot";
import NightCountByMonth from "./NightCountByMonth";
import dayjs from "dayjs";
import DefaultPage from "./DefaultPage";

function NightPage() {
    // 根据当前路径匹配路由

    const [first, setfirst] = useState(3);
    useEffect(() => {
        console.log(`Type changed to: ${first}`);
    }, [first]);
    const renderComponent = () => {
        switch (first) {
            case 1:
                return <NightCountByHourSlot />;
            case 2:
                return <NightCountByMonth />;

            default:
                return <DefaultPage />;
        }
    };

    return (
        <div className="flex flex-col gap-2 flex-1 ">
            <div className="flex flex-row items-center px-4 ">
                <h1 className=" self-center text-2xl font-bold text-blue-700 text-center">
                    {dayjs().get("year")}年每月统计
                </h1>
                <TabNav.Root>
                    <TabNav.Link
                        href="/admin/night/1"
                        active={first === 1}
                        onClick={(e) => {
                            setfirst(1);
                            e.preventDefault();
                        }}
                    >
                        <label className="text-2xl font-bold">夜班时段</label>
                    </TabNav.Link>
                    <TabNav.Link
                        href="/admin/night/2"
                        active={first === 2}
                        onClick={(e) => {
                            setfirst(2);
                            e.preventDefault();
                        }}
                    >
                        <label className="text-2xl font-bold">夜班频次</label>
                    </TabNav.Link>
                    <TabNav.Link
                        href="/admin/night/3"
                        active={first === 3}
                        onClick={(e) => {
                            setfirst(3);
                            e.preventDefault();
                        }}
                    >
                        <label className="text-2xl font-bold">当月时长</label>
                    </TabNav.Link>
                </TabNav.Root>
            </div>

            <>{renderComponent()}</>
        </div>
    );
}

export default NightPage;

// {
//     Array.from({ length: dayjs().month() + 1 }).map((_, index) => (
//         <DownloadExcel key={index} fileName={`${dayjs().get("year")}年${index + 1}月执勤.xlsx`} />
//     ));
// }

// {
//     Array.from({ length: dayjs().month() + 1 }).map((v, index) => {
//         return (
//             <div key={index}>
//                 {v}/{index}
//             </div>
//         );
//     });
// }
