import React, { useState, useEffect } from "react";
import { TabNav, Tabs } from "@radix-ui/themes";
import NightCountByHourSlot from "./NightCountByHourSlot";
import NightCountByMonth from "./NightCountByMonth";

function NightPage() {
    // 根据当前路径匹配路由

    const [first, setfirst] = useState(1);
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
                return <div>Unknown Type</div>;
        }
    };

    return (
        <div className="flex-1">
            <TabNav.Root>
                <TabNav.Link
                    href="/admin/night/1"
                    active={first === 1}
                    onClick={(e) => {
                        setfirst(1);
                        e.preventDefault();
                    }}
                >
                    <label className="text-2xl font-bold">小时统计</label>
                </TabNav.Link>
                <TabNav.Link
                    href="/admin/night/2"
                    active={first === 2}
                    onClick={(e) => {
                        setfirst(2);
                        e.preventDefault();
                    }}
                >
                    <label className="text-2xl font-bold">月度统计</label>
                </TabNav.Link>
             
            </TabNav.Root>
            <div className=" p-4">{renderComponent()}</div>
        </div>
    );
}



export default NightPage