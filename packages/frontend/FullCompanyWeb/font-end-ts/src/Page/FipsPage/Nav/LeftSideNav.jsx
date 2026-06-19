import React from "react";

function LeftSideNav() {
    return (
        <nav className="rounded-[0.5rem] border bg-background shadow">
            <ul className="w-[120px] flex flex-col gap-1">
                <li className=" relative  ">
                    <a
                        className="flex h-7 items-center  rounded-full px-2 text-center text-lg transition-colors hover:text-primary bg-muted font-semibold text-primary"
                        href="/#"
                    >
                        概况
                    </a>
                    <ul className="pl-4">
                        <li>地图航线效果</li>
                        <li>1</li>
                        <li>1</li>
                    </ul>
                </li>
                <li className="">
                    <a
                        className="flex h-7 items-center  rounded-full px-2 text-center text-lg transition-colors hover:text-primary bg-muted  font-semibold text-primary"
                        href="/#"
                    >
                        进场统计
                    </a>
                    <ul className="pl-4">
                        <li>使用跑道</li>
                        <li>集中时刻</li>
                        <li>滑行效率</li>
                    </ul>
                </li>
                <li className="">
                    <a
                        className="flex h-7 items-center  rounded-full px-2 text-center text-lg transition-colors hover:text-primary bg-muted font-semibold text-primary"
                        href="/#"
                    >
                        离场统计
                    </a>
                </li>
            </ul>
        </nav>
    );
}

export default LeftSideNav;
