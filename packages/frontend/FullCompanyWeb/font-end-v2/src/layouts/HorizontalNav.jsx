import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, ServerURL, hasPermission, actions } from "../utils/index";

import "./_layout.scss";

function HorizontalNav() {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    return (
        <div className="horizontal_navbar_container   ">
            <section>
                <div className="company_notify_container">鼎</div>
                <div className="company_notify_container">韩</div>
            </section>
            <section>
                <input type="search" className=" bg-slate-50" />
            </section>
            <section>
                <ul>
                    <li className="nav-item">通知</li>
                </ul>
            </section>
            <section>
                <nav>
                    <ul className="flex flex-row gap-3 	items-center">
                      
                        <li className="nav-item">
                            <a href="#">首页</a>
                        </li>
                        <li className="nav-item">
                            <a href="#">公司网盘</a>
                        </li>
                        <li className="nav-item">
                            <a href="#">公司留言板</a>
                        </li>
                        <li className="nav-item">
                            <a href="#">时间轴</a>
                        </li>
                        <li className="nav-item username">
                            <a href="/user">{user.name}</a>
                        </li>
                        <li
                            onClick={() => {
                                logout();
                            }}
                        >
                            退出
                        </li>
                    </ul>
                </nav>
            </section>
        </div>
    );
}

export default HorizontalNav;
