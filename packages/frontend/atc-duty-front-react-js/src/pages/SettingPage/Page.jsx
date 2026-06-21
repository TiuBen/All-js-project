import React, { useState } from "react";
import { TabNav } from "@radix-ui/themes";
import UserSettingPage from "./UserSettingPage/UserSettingPage";
import PositionSetting from "./PositionSettingPage/PositionSetting";
import TeamSettingPage from "./TeamSettingPage/TeamSettingPage";
import StatisticSetting from "./StatisticSettingPage/StatisticSetting";

function Page() {
    const [activeTab, setActiveTab] = useState(1);

    const renderComponent = () => {
        switch (activeTab) {
            case 1:
                return <UserSettingPage />;
            case 2:
                return <PositionSetting />;
            case 3:
                return <TeamSettingPage />;
            case 4:
                return <StatisticSetting />;
            default:
                return <div>Unknown Type</div>;
        }
    };

    return (
        <div>
            <TabNav.Root>
                <TabNav.Link
                    active={activeTab === 1}
                    onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(1);
                    }}
                >
                    <label className="text-2xl font-bold cursor-pointer">用户管理</label>
                </TabNav.Link>
                <TabNav.Link
                    active={activeTab === 2}
                    onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(2);
                    }}
                >
                    <label className="text-2xl font-bold cursor-pointer">席位管理</label>
                </TabNav.Link>
                <TabNav.Link
                    active={activeTab === 3}
                    onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(3);
                    }}
                >
                    <label className="text-2xl font-bold cursor-pointer">班组管理</label>
                </TabNav.Link>
                <TabNav.Link
                    active={activeTab === 4}
                    onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(4);
                    }}
                >
                    <label className="text-2xl font-bold cursor-pointer">小时统计管理</label>
                </TabNav.Link>
            </TabNav.Root>
            <div className="p-4">{renderComponent()}</div>
        </div>
    );
}

export default Page;
