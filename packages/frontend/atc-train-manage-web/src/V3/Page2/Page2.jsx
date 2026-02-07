import React, { useEffect, useState } from "react";
import { Route, useLoaderData, Outlet } from "react-router-dom";
import Sheet from "./SheetPage/Sheet.jsx";

import RadioButtonUserList from "../BarRight/RadioButtonUserList.jsx";
import DefaultPage from "./DefaultPage/DefaultPage.jsx";
import LikeExcel from "./SheetPage/LikeExcel/LikeExcel.jsx";

import UserSettingPage from "./SettingPage/UserSettingPage/UserSettingPage.jsx";
import SettingPage from "./SettingPage/SettingPage.jsx";
import NightPage from "./NightCount/NightPage.jsx";

const _testData = {
    "2025-01-01": () => <div>新年快乐！</div>,
    "2025-01-15": () => <div>今天是特别的日子！</div>,
};

function Page2() {
    return (
        <div className="relative">
            Page2Page2Page2
            <a href="/admin/setting/1">1</a>
            <Outlet />
        </div>
    );
}

const TestPage1 = () => {
    return <div>111111111111</div>;
};
const TestPage2 = () => {
    return <div>2222222</div>;
};

// function Page2Route() {
//     return (
//         <Route path="admin" element={<Page2 />}>
//             <Route index element={<DefaultPage />} />
//             <Route path="sheet" element={<Sheet />} />
//             <Route path="setting" element={<TestPage />} />
//         </Route>
//     );
// }

const Page2Routes = [
    {
        path: "admin",
        main: () => <DefaultPage />,
        // sidebar: ()=><></>,
        sidebar: () => null,
    },
    {
        path: "admin/sheet",
        main: () => <LikeExcel />,
        sidebar: () => <RadioButtonUserList />,
    },
    // {
    //     path: "admin/setting",
    //     main: () => {return <UserSettingPage />},
    //     sidebar: () => null,
    // },
    {
        path: "admin/setting",
        main: () => {
            return <SettingPage />;
        },
        sidebar: () => null,
    },
    {
        path: "admin/night",
        main: () => {
            return <NightPage />;
        },
        sidebar: () => null,
    },
 
];

export { Page2Routes };
