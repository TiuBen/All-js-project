import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { MonthCalendarProps } from "./MonthCalendar.types";

export function MonthCalendar<T = any>({
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
    data = {},
    title,
    cellRender,
}: MonthCalendarProps<T>) {
    const [dates, setDates] = useState<string[]>([]);

    useEffect(() => {
        const daysInMonth = new Date(year, month, 0).getDate();
        const startDay = new Date(year, month - 1, 1).getDay();

        const offset = startDay === 0 ? 6 : startDay - 1;

        const rows = 6;
        const cells = rows * 7;

        const arr: string[] = [];

        for (let i = 0; i < cells; i++) {
            const date = dayjs(new Date(year, month - 1, i - offset + 1)).format("YYYY-MM-DD");
            arr.push(date);
        }

        setDates(arr);
    }, [year, month]);

    return (
        <div aria-roledescription="month-calendar" className="grid grid-cols-7 flex-1">
            {title && <div className="col-span-7">{title}</div>}

            {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((d) => (
                <div key={d} className="outline outline-1 outline-gray-300 font-bold text-center">
                    {d}
                </div>
            ))}

            {dates.map((date) => {
                const isToday = dayjs(date).isSame(dayjs(), "day");

                return (
                    <div key={date} className="outline outline-1 outline-gray-300 flex flex-col hover:bg-blue-50">
                        <div className={`px-2 text-center ${isToday ? "bg-blue-600 text-white" : ""}`}>
                            {dayjs(date).format("D")}
                        </div>

                        <div className="flex-1">{cellRender?.(date, data?.[date])}</div>
                    </div>
                );
            })}
        </div>
    );
}
