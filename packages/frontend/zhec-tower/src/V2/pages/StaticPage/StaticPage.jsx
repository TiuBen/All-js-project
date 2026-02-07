import React, { useState, useEffect } from "react";
import { TabNav } from "@radix-ui/themes";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import { BrowserRouter as Router, Switch, useLocation } from "react-router-dom";

import { useLocalStorageState } from "ahooks";
import ViewByName from "./ViewByName";

const Test1 = () => {
    console.log("Test1");

    return <div>Test1</div>;
};

const Test2 = () => {
    console.log("Test2");
    return <div>Test2</div>;
};

const Test3 = () => {
    console.log("Test3");

    return <div>Test3</div>;
};

function StaticPage() {
    console.log("StaticPage");
    const [activeTab, setActiveTab] = useState(0);

    const tabURL = [
        { title: "用户管理", url: "users" },
        { title: "设置", url: "setting" },
        { title: "每人数据", url: "byName" },
        { title: "未同步数据", url: "offline" },
    ];

    return (
        <div className="flex flex-col gap-1  flex-1">
            <TabNav.Root color="indigo" >
                {tabURL.map((item, index) => {
                    return (
                        <TabNav.Link
                            asChild
                            key={index}
                            active={index===activeTab}
                        >
                            <Link
                                to={item.url}
                                relative="admin"
                                onClick={() => {
                                    setActiveTab(index);
                                }}
                            >
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

function StaticPageRoutes() {
    return (
        <>
            <Route  path="/statics" element={<StaticPage />}>
                <Route index   element={<ViewByName />} />
                <Route path="setting"   element={<Test1 />} />
                <Route path="offline" element={<Test2 />} />
                <Route path="users" element={<Test3 />} />
            </Route>
        </>
    );
}

export default StaticPageRoutes;
