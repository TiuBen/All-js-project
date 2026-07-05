import React, { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import { MonthCalendarProps } from "./MonthCalendar.types";

export function MonthCalendar<T = any>({
    year = new Date().getFullYear(),
    month = new Date().getMonth(),
    data = {},
    title,
    cellRender,
}: MonthCalendarProps<T>) {
    const dates = useMemo(() => {
        const startDay = new Date(year, month, 1).getDay();

        const offset = startDay === 0 ? 6 : startDay - 1;

        return Array.from({ length: 42 }, (_, i) => dayjs(new Date(year, month, i - offset + 1)).format("YYYY-MM-DD"));
    }, [year, month]);

    // 固定的月份基准，用于后续判断“是否为本月”
    const currentMonthView = useMemo(() => dayjs(new Date(year, month, 1)), [year, month]);

    return (
        <div aria-roledescription="month-calendar" className="grid grid-cols-7 grid-rows-[1.5rem]   flex-1 inset-0">
            {title && <div className="col-span-7 ">{title}</div>}
            {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((d) => (
                <div key={d} className="outline outline-1 bg-gray-100 outline-gray-300 font-bold text-center ">
                    {d}
                </div>
            ))}
            {dates.map((date) => {
                const isToday = dayjs(date).isSame(dayjs(), "day");
                const isCurrentMonth = dayjs(date).isSame(currentMonthView, "month");
                return (
                    <div key={date} className="outline outline-1 outline-gray-300 flex flex-col hover:bg-blue-50">
                        <div
                            className={`px-2 text-center ${
                                isCurrentMonth ? "text-blue-700 bg-blue-50" : "text-gray-400 bg-gray-50"
                            }${isToday ? "  font-bold hover:text-white hover:bg-blue-700 text-blue-400" : ""}`}
                        >
                            {/* 非本月显示 M月D号，本月只显示 D */}
                            {isCurrentMonth ? dayjs(date).format("D") : dayjs(date).format("M月D")}
                        </div>

                        <div className="flex-1">{cellRender?.(date, data?.[date])}</div>
                    </div>
                );
            })}
        </div>
    );
}
