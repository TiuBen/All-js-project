import React, { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import BrushIcon from "@mui/icons-material/Brush";

function VerticalNav() {
    const items = [
        {
            title: "应用",
            url: "/app",
            subNav: [
                { title: "日历", url: "/calendar", icon: <CalendarMonthIcon /> },
                { title: "表单", url: "/form", icon: <BrushIcon /> },
                { title: "项目进度", url: "/gant" },
                { title: "Word", url: "/word" },
                { title: "Excel", url: "/excel" },
                { title: "邮箱", url: "/email" },
                { title: "网盘", url: "/disk" },
            ],
        },
        {
            title: "供应链",
            url: "/client",
            subNav: [
                { title: "客户资料", url: "/info", icon: <PermContactCalendarIcon /> },
                { title: "产品", url: "/product" },
                { title: "供应商", url: "/product" },
                { title: "客户", url: "/product" },
                { title: "物流", url: "/product" },
                { title: "订单/询价", url: "/product" },
            ],
        },
        {
            title: "工厂",
            url: "/factory",
            icon: <CalendarMonthIcon />,
            subNav: [
                { title: "物料", url: "/todo" },
                { title: "生产信息", url: "/请假" },
            ],
        },
        {
            title: "财务",
            url: "/fiance",
            icon: <CalendarMonthIcon />,
            subNav: [
                { title: "支出", url: "/支出" },
                { title: "收入", url: "/收入" },
                { title: "资产", url: "/资产" },
                { title: "账目", url: "/账目" },
            ],
        },
        {
            title: "知识库",
            url: "/know",
            icon: <CalendarMonthIcon />,
            subNav: [
                { title: "wiki", url: "/wiki" },
                { title: "论坛", url: "/forum" },
            ],
        },
    ];

    return (
        <nav className="flex flex-col flex-shrink-0 w-[8rem] pt-2 gap-2  bg-neutral-200 overflow-y-auto ">
            {items.map((outer, index) => {
                return (
                    <ul key={index} className="flex flex-col pl-2">
                        <li>
                            <div  className="font-bold">
                                {outer.title}
                            </div>

                            <div>
                                <ul className="ml-2 flex flex-col text-sm gap-0">
                                    {outer.subNav.map((inner, index2) => {
                                        return (
                                            <li key={index2}>
                                                <a href={outer.url + inner.url}>{inner.title}</a>
                                                {inner.icon}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </li>
                    </ul>
                );
            })}
        </nav>
    );
}

export { VerticalNav };
