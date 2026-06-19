import React from 'react'
import { Link } from 'react-router-dom';
import { useUser } from '../../../utils';

export const HorizontalNav = () => {
    const { user, logout } = useUser();

    return (
        <header id='header' className="flex  flex-shrink-0 flex-row h-[2rem] px-8 justify-between items-center text-white bg-blue-700  font-yahei antialiased ">
            <section className='flex gap-4'>
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
                            <Link to="disk">公司网盘</Link>
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
        </header>
    )
}
