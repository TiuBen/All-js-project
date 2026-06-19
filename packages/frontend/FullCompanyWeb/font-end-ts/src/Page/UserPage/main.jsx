import React, { useState } from "react";
import { createBrowserRouter, createRoutesFromElements, Link, Outlet, Route } from "react-router-dom";
import "./setting.css";
import Account from "./subPages/account";
import CheckIn from "./subPages/CheckIn";

function Main() {
    const [selected, setSelected] = useState(-1);
    return (
        <div className="border   flex-1 flex flex-row gap-2 m-2 p-2 rounded-sm shadow-sm">
            <nav className="test setting--nav px-2  border-r-2">
                <ul className="flex flex-col gap-1">
                    {[
                        { link: "account", title: "基本信息" },
                        { link: "attendance", title: "考勤" },
                        { link: "memo", title: "私人备忘录" },
                        { link: "projects", title: "工作项目" },
                        { link: "money", title: "财务" },
                        { link: "forum", title: "论坛" },
                    ].map((x, index) => {
                        return (
                            <li
                                key={index}
                                className={`flex gap-1 item rounded-sm ${
                                    index === selected ? "bg-slate-200 cursor-pointer" : " hover:bg-slate-100"
                                } `}
                                onClick={() => {
                                    setSelected(index);
                                }}
                            >
                                <span
                                    className={` inline-block w-1 min-h-full ${
                                        index === selected ? "bg-blue-500" : ""
                                    }`}
                                ></span>
                                <Link to={x.link}>{x.title}</Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <Outlet />
        </div>
    );
}

// You can do this:
const settingRouter = () => {
    return (
        <Route path="/user" element={<Main />} errorElement={<div> eeeee</div>}>
            <Route path="money" element={<div>滴滴滴</div>} />
            <Route path="attendance" element={<CheckIn />} />
            <Route path="account" element={<Account />} />
            <Route path="*" element={<div>Not found</div>} />
            <Route index element={<div>index</div>} />
        </Route>
    );
};

export default settingRouter;
