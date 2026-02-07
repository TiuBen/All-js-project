import { useLocalStorageState, useNetwork } from "ahooks";
import { Outlet, Link } from "react-router-dom";
import UserList from "./pages/main/UserList";
import PositionList from "./pages/main/PositionList";
import Avatar from "./components/Avatar";

function App() {
    const [selectedPosition] = useLocalStorageState("position", { listenStorageChange: true });
    const [username] = useLocalStorageState("username", { listenStorageChange: true });

    const { online } = useNetwork();

    return (
        <div id="app-root" className="h-[100vh]  overflow-x-hidden overflow-y-auto">
            <Avatar username="沈宁"/>
            <nav className="h-[4rem] bg-blue-600 text-white flex flex-row-reverse items-center gap-2 px-[2rem] sticky top-0 z-[1000] w-full">
                <h3 className="text-xl  font-semibold text-ellipsis">湖北国际物流机场塔台执勤系统</h3>
                <h3 className="text-xl  font-semibold text-ellipsis">
                    {!online ? "暂时没有网络连接，数据将保持在本地" : ""}
                </h3>
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
                                <a href="/admin">统计</a>
                            </li>
                        </ul>
                    </nav>
                </aside>
                <div className="basis-9/10 flex-1 overflow-x-auto flex">
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
    );
}

export default App;
