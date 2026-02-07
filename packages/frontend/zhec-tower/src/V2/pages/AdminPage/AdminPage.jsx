import React, { useState } from "react";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import { TabNav } from "@radix-ui/themes";
import TakePhoto from "./TakePhotoPage/Page";
import OffLineOnDutyUser from "./OffLineData/OffLineOnDutyUser";
import { useLocalStorageState } from "ahooks";

function AdminPage() {
    const tabURL = [
        { title: "用户管理", url: "users" },
        { title: "设置", url: "setting" },
        { title: "未同步数据", url: "offline" },
    ];

    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="flex flex-col gap-1">
            <TabNav.Root>
                {tabURL.map((item, index) => {
                    return (
                        <TabNav.Link
                            asChild
                            key={index}
                            active={activeTab === index}
                            onClick={() => {
                                setActiveTab(index);
                            }}
                        >
                            <Link to={item.url} relative="admin">
                                {item.title}
                            </Link>
                        </TabNav.Link>
                    );
                })}
            </TabNav.Root>
            <Outlet />
        </div>
    );
}

const ChildComponent2 = () => <div>Child Component 2</div>;

function AdminPageRoutes() {
    return (
        <Route>
            <Route index path="users" element={<TakePhoto />} />
            <Route path="setting" element={<ChildComponent2 />} />
            <Route path="offline" element={<OffLineOnDutyUser />} />
        </Route>
    );
}

export { AdminPage, AdminPageRoutes };
