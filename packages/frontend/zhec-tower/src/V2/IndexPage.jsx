import { useLocalStorageState, useNetwork } from "ahooks";

import { DialogContextProvider } from "./context/DialogContext.js";
import { OnDutyUserContextProvider } from "./context/OnDutyUserContext.js";
import { BrowserRouter as Router, Routes, Route, Outlet, Link } from "react-router-dom";
import StaticPageRoutes from "./pages/StaticPage/StaticPage.jsx";
import MainPageRoutes from "./pages/MainPage/MainPage.jsx";
import DateTimeRangeSelector from "./pages/StaticPage/Component/DateTimeRangeSelector.jsx";
import PositionSelector from "./pages/StaticPage/Component/PositionSelector.jsx";
import UserNameSelector from "./pages/StaticPage/Component/UserNameSelector.jsx";
import ViewByName from "./pages/StaticPage/ViewByName.jsx";

function IndexPage() {
    const [selectedPosition] = useLocalStorageState("position", { listenStorageChange: true });
    const [username] = useLocalStorageState("username", { listenStorageChange: true });
    // const { online } = useNetwork();

    return (
        <OnDutyUserContextProvider>
            <DialogContextProvider>
                <div id="app-root" className="h-[100vh]  overflow-x-hidden overflow-y-auto">
                    <nav className="h-[4rem] bg-blue-600 text-white flex flex-row-reverse items-center gap-2 px-[2rem] sticky top-0 z-[1000] w-full">
                        <h3 className="text-xl  font-semibold text-ellipsis">湖北国际物流机场塔台执勤系统</h3>
                        {/* <h1 className="text-xl   font-semibold text-red-600">
                            {!online ? "未连接到网络，数据将保存在本地" : ""}
                        </h1> */}
                    </nav>

                    <main className="flex flex-row h-[calc(100%-4rem)]">
                        <aside className="basis-1/10 flex-shrink-0  bg-slate-300">
                            <nav className=" bg-slate-300 ">
                                <ul className="flex flex-col w-18 text-2xl gap-2 text-black font-semibold text-center ">
                                    <li className="hover:text-blue-600  hover:bg-slate-400 p-2">
                                        <Link to="/">主页</Link>
                                    </li>
                                    {/* <li className="hover:text-blue-600  hover:bg-slate-400 p-2">
                            <a href="/prepare">岗前准备</a>
                        </li>
                        <li className="hover:text-blue-600  hover:bg-slate-400 p-2">
                            <a href="/shift">交接班</a>
                        </li> */}
                                    <li className="hover:text-blue-600  hover:bg-slate-400 p-2">
                                        <Link to="/statics">统计</Link>
                                    </li>
                                    {/* <li className="hover:text-blue-600  hover:bg-slate-400 p-2">
                                        <a href="/admin">后台</a>
                                    </li> */}
                                </ul>
                            </nav>
                        </aside>
                        <div className="basis-9/10 flex-1 overflow-x-auto ">
                            <Outlet />
                        </div>
                    </main>
                    {/* <div className="flex flex-row items-stretch bg-slate-400 p-2 ">
                <PositionList />
                <div className="w-fit  text-black text-xl font-bold min-w-[8rem]">
                    <h3 className=" text-blue-600 ">已选择</h3>
                    <div> 席位:{selectedPosition}</div>
                    <div>员工:{username}</div>
                </div>
                <UserList />
            </div> */}
                </div>
            </DialogContextProvider>
        </OnDutyUserContextProvider>
    );
}

const AppV2 = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<IndexPage />}>
                    {MainPageRoutes()}
                    {StaticPageRoutes()}
                    <Route
                        path="/test"
                        element={
                            <div>
                                <DateTimeRangeSelector />
                                <PositionSelector />
                                <UserNameSelector />
                                <ViewByName />
                            </div>
                        }
                    />
                </Route>
            </Routes>
        </Router>
    );
};

export default AppV2;
