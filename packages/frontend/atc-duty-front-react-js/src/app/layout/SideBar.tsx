import React, { ReactNode } from "react";
import {
    MessageCircle,
    ClipboardPenLine,
    BicepsFlexed,
    CalendarDays,
    ChartLine,
    Sheet,
    Settings,
    FileDown,
} from "lucide-react";
import { Pages, PageKey } from "@/app/router/routes";
import { useAppStore } from "@/store/app.store";

const LeftNavItem = ({ title, page, Icon, isExpanded, subNav }) => {
    const setPage = useAppStore((s) => s.setPage);

    if (isExpanded) {
        return (
            <div className={`flex items-start gap-1 text-nowrap flex-col text-white-900`}>
                <a
                    onClick={() => setPage(page)}
                    className={"flex flex-row gap-1 flex-nowrap hover:cursor-pointer hover:font-extrabold"}
                >
                    <Icon size={"1.5rem"} />
                    <h2 className={`text-lg text-white-800`}>{title}</h2>
                </a>

                {subNav && (
                    <div className="flex ml-2 flex-col gap-1">
                        {subNav.map((item) => {
                            return (
                                <a
                                    key={item.page}
                                    onClick={() => setPage(item.page)}
                                    className={`flex flex-row gap-1 flex-nowrap text-base`}
                                >
                                    {item.Icon()}
                                    <h2 className={`text-base`}>{item.title}</h2>
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <a
            onClick={(e) => {
                e.preventDefault();
                setPage(page);
            }}
            className={`self-center flex gap-1 items-center flex-col`}
        >
            <Icon size={"2rem"} />
            <h2 className={`text-sm`}>{title}</h2>
        </a>
    );
};

const items = [
    {
        title: "执勤",
        page: Pages.DASHBOARD,
        Icon: () => <MessageCircle {...props} strokeWidth={1.5} />,
        active: true,
        subNav: [
            {
                title: "岗位状态",
                page: Pages.DUTY,
                Icon: () => <BicepsFlexed {...props} strokeWidth={1.5} />,
            },
            {
                title: "日历",
                page: Pages.CALENDAR,
                Icon: () => <CalendarDays {...props} strokeWidth={1.5} />,
            },
            {
                title: "统计",
                page: Pages.STATS,
                Icon: () => <ChartLine {...props} size={"1.5em"} strokeWidth={1.5} />,
            },
        ],
    },
    {
        title: "后台",
        page: Pages.ADMIN_SHEET,
        Icon: () => <ClipboardPenLine {...props} strokeWidth={1.5} />,
        subNav: [
            {
                title: "执勤表格",
                page: Pages.ADMIN_SHEET,
                Icon: () => <Sheet {...props} size={"1.5em"} strokeWidth={1.5} />,
            },
            {
                title: "设置",
                page: Pages.ADMIN_SETTING,
                Icon: () => <Settings {...props} size={"1.5em"} strokeWidth={1.5} />,
            },
            {
                title: "导出",
                page: Pages.ADMIN_EXPORT,
                Icon: () => <FileDown {...props} size={"1.5em"} strokeWidth={1.5} />,
            },
        ],
    },
];

function SideBar() {
    const { isLeftBarOpen, toggleLeftBar } = useAppStore();

    return (
        <aside
            className={` overflow-y-auto flex flex-row  bg-blue-600  text-blue-50 ${isLeftBarOpen ? "w-[10rem]" : ""} `}
        >
            <div className="flex flex-col flex-1 items-start gap-2 p-4 text-accent font-semibold ">
                {items.map((item, index) => {
                    return (
                        <LeftNavItem
                            key={index}
                            title={item.title}
                            page={item.page}
                            Icon={(props) => item.Icon()}
                            active={item.active}
                            isExpanded={isLeftBarOpen}
                            subNav={item.subNav}
                        />
                    );
                })}
            </div>

            <button
                onClick={toggleLeftBar}
                className={`w-[0.6rem] hover:cursor-ew-resize  shadow-md  font-mono font-semibold hover:bg-blue-300 duration-200`}
            >
                {isLeftBarOpen ? "<" : ">"}
            </button>
        </aside>
    );
}

export default SideBar;
