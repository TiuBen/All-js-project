import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useUserStore } from "../../store/user.store";
import { useOutletContext } from "react-router-dom";

const WEEKDAY_MAP = ["日", "一", "二", "三", "四", "五", "六"];

function UserCheckDurationRow({ username }) {
    return (
        <tr className="hover:bg-slate-400">
            <td className="border border-black w-[5rem] bg-blue-50">{username}</td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
        </tr>
    );
}

export default function CheckDuration() {
    const { year, month } = useOutletContext();
    const { allDetailUsers, fetchAllDetailUsers } = useUserStore();
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        fetchAllDetailUsers();
    }, [fetchAllDetailUsers]);

    const monthStart = dayjs().year(year).month(month).date(1);
    const daysInMonth = Array.from({ length: monthStart.daysInMonth() }, (_, i) =>
        monthStart.startOf("month").add(i, "day")
    );

    const weekRangeLabel = (() => {
        if (!selectedDay) return "日历周内执勤总时长";
        const weekStart = selectedDay.startOf("week");
        const weekEnd = selectedDay.endOf("week");
        return `日历周(${weekStart.format("M月DD日")}-${weekEnd.format("M月DD日")})内执勤总时长`;
    })();

    const getWeekBg = (day) => {
        if (!selectedDay) return "";
        const selectedWeekStart = selectedDay.startOf("week");
        const selectedWeekEnd = selectedDay.endOf("week");
        if (day.isBetween(selectedWeekStart, selectedWeekEnd, "day", "[]")) {
            return "bg-blue-100";
        }
        return "";
    };

    return (
        <div className="flex flex-col gap-2 text-sm overflow-x-auto">
            <div className="flex flex-row gap-1 flex-nowrap">
                {daysInMonth.map((day, i) => (
                    <button
                        key={i}
                        className={`flex flex-col items-center border rounded px-1 py-1 cursor-pointer hover:bg-gray-200 ${getWeekBg(
                            day
                        )} ${selectedDay && day.isSame(selectedDay, "day") ? "bg-blue-200 font-bold" : ""}`}
                        onClick={() => setSelectedDay(day)}
                    >
                        <span>{day.format("D")}</span>
                        <span className="text-xs text-gray-500">({WEEKDAY_MAP[day.day()]})</span>
                    </button>
                ))}
                <div>查询</div>
            </div>

            <table className="w-full border-collapse text-nowrap">
                <thead>
                    <tr>
                        <th className="border border-black">姓名</th>
                        <th className="border border-black">单次打卡最长执勤时间</th>
                        <th className="border border-black">24小时内执勤总计时长</th>
                        <th className="border border-black">{weekRangeLabel}</th>
                        <th className="border border-black">主班席最长执勤时间</th>
                    </tr>
                </thead>
                <tbody>
                    {allDetailUsers.map((user, index) => (
                        <UserCheckDurationRow key={index} username={user.username} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
