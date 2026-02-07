import { useState, useEffect } from "react";
import { Theme } from "@radix-ui/themes";

import { Route, Outlet, BrowserRouter, Routes, Link } from "react-router-dom";
import { DialogContextProvider, PageContextProvider } from "@utils";
import Skeleton from "./Skeleton/Skeleton";
import LeftBar from "./BarLeft/LeftBar";
import BottomBar from "./BarBottom/BottomBar";

import TopNav from "./TopNav/TopNav";
import useStore from "../utils/store/userStore";
import EditDutyRecordSheet from "./Dialog/EditDutyRecordSheet";
import EditPositionDialog from "./Dialog/EditPositionDialog";
import PositionList from "./CommonComponent/PositionList";
import MonthPage from "./Page1/MonthPage";
import MainMonth from "./Page1/MonthPage/MainMonth";
import DutyPageMain from "./Page1/OnDutyPage/DutyPageMain";
import DefaultPage from "./Page2/DefaultPage/DefaultPage";
import SettingPage from "./Page2/SettingPage/SettingPage";
import Sheet from "./Page2/SheetPage/Sheet";
import NightPage from "./Page1/NightCount/NightPage";
import DownloadExcelPage from "./Page2/DownloadExcel/DownloadExcelPage";
import { API_URL } from "../utils/const/Const";
import AddNewDutyRecordDialog from "./Dialog/AddNewDutyRecordDialog";
import Page2 from "./Page2/Page2";
import TimeLinePage from "./Page1/DefaultPage/TimeLinePage";
import ProtectedRoute from "./Skeleton/ProtectedRoute";
import LoginPage from "./Skeleton/LoginPage";

function AppV7() {
    const { fetchUsers, fetchPositions, users } = useStore();
    // useEffect(() => {
    //     fetchUsers();
    //     fetchPositions();
    // }, [fetchUsers,fetchPositions]);

    const [navWidth, setNavWidth] = useState("8rem");

    // const [isLoggedIn, setIsLoggedIn] = useState(false);

    // useEffect(() => {
    //     // 检查本地 token 是否存在
    //     const token = localStorage.getItem("token");
    //     if (token) setIsLoggedIn(true);
    // }, []);

    // const handleLogout = () => {
    //     localStorage.removeItem("token");
    //     setIsLoggedIn(false);
    // };

    return (
        <PageContextProvider>
            <DialogContextProvider>
                {/* {JSON.stringify(users)} */}
                <Theme accentColor="indigo">
                    <BrowserRouter>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <Skeleton topNav={<TopNav />} LeftSidebar={<LeftBar />} bottomBar={<BottomBar />} />
                                }
                            >
                                <Route index element={<TimeLinePage />} />

                                <Route path="duty" element={<DutyPageMain />} />
                                <Route path="calendar" element={<MainMonth />} />
                                <Route path="login" element={<LoginPage />} />
                                <Route path="night" element={<NightPage />} />
                                <Route
                                    path="admin"
                                    element={
                                            <Page2 />
                                        // <ProtectedRoute>
                                        // </ProtectedRoute>
                                    }
                                >
                                    <Route index element={<DefaultPage />} />
                                    <Route path="sheet" element={<Sheet />} />
                                    <Route path="setting" element={<SettingPage />} />
                                    <Route path="excel" element={<DownloadExcelPage />} />
                                </Route>
                            </Route>
                        </Routes>
                    </BrowserRouter>
                    <AddNewDutyRecordDialog />
                    <EditDutyRecordSheet />
                </Theme>
            </DialogContextProvider>
        </PageContextProvider>
    );
}

export default AppV7;

{
    /* <div className="grid grid-rows-[3rem_1fr_1.5rem] grid-cols-[auto_1fr] h-[100vh] w-[100vw] overflow-hidden">
<header className="col-span-2 bg-yellow-200">header</header>
<nav className={`w-[${navWidth}] bg-green-200 h-[calc(100vh-4.5rem)] overflow-y-auto`}>
    nav
    <div className="">
        {Array(20)
            .fill(0)
            .map((_, index) => (
                <a to={`/admin/sheet/${index}`} key={index}>
                    <div className="h-[2rem]">{index}</div>
                </a>
            ))}
    </div>
    <button
        onClick={() => {
            if (navWidth === "8rem") {
                setNavWidth("12rem");
            } else {
                setNavWidth("8rem");
            }
        }}
    >
        width
    </button>
</nav>
<main className="w-full h-full">
    <div className="flex h-[calc(100vh-4.5rem)]">
        <div className="flex-1  w-[calc(100vw-16rem)] ">
            <div className=" h-[1.5rem] bg-slate-300">ddddddddddd</div>
            <div className="h-[calc(100vh-6rem)]  overflow-auto">
                <table className="w-[1000px] h-[500px] bg-slate-400"></table>
            </div>
        </div>
        <aside className="flex-shrink-0 overflow-y-auto bg-cyan-300">
            <div className="min-h-0 w-[4rem]">
                {Array(20)
                    .fill(0)
                    .map((_, index) => (
                        <a to={`/admin/sheet/${index}`} key={index}>
                            <div className="h-[2rem]">{index}</div>
                        </a>
                    ))}
            </div>
        </aside>
    </div>
</main>
<footer className="col-span-2 bg-blue-300">footer</footer>
</div>




<div class="flex h-screen ">
<div className="flex-1 flex flex-col bg-blue-50">
    <div className="h-16 bg-blue-200 flex items-center justify-center">Header (固定高度)</div>

    <div className="flex-1 overflow-scroll  min-w-0 bg-blue-100 p-4">
        <div className="flex space-x-4 ">
            <table className="w-[500px] border bg-white">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">表1 - 列1</th>
                        <th className="border px-4 py-2">表1 - 列2</th>
                        <th className="border px-4 py-2">表1 - 列3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border px-4 py-2">数据 A1</td>
                        <td className="border px-4 py-2">数据 A2</td>
                        <td className="border px-4 py-2">数据 A3</td>
                    </tr>
                    <tr>
                        <td className="border px-4 py-2">数据 B1</td>
                        <td className="border px-4 py-2">数据 B2</td>
                        <td className="border px-4 py-2">数据 B3</td>
                    </tr>
                </tbody>
            </table>

            <table className="min-w-[200px] border bg-white">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">表2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border px-4 py-2">数据 1</td>
                    </tr>
                    <tr>
                        <td className="border px-4 py-2">数据 2</td>
                    </tr>
                    <tr>
                        <td className="border px-4 py-2">数据 3</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div className="w-48 flex flex-col bg-green-200 h-[calc(100vh - 80px - 32px)]">
    <div className="h-12 bg-green-400 flex items-center justify-center">侧栏标题</div>
    <div className="flex-1 overflow-y-auto min-h-0 bg-green-100 p-2">
        <p>用户 1</p>
        <p>用户 2</p>
        <p>用户 3</p>
        <p>用户 4</p>
        <p>用户 5</p>
        <p>用户 6</p>
        <p>用户 7</p>
        <p>用户 8</p>
        <p>用户 9</p>
        <p>用户 10</p>
        <p>用户 11</p>
        <p>用户 12</p>
    </div>
</div>
</div> */
}
