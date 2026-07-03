import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useUserStore } from "../../store/user.store";
import { useStatisticsStore } from "../../store/statistics.store";
import { http } from "../../service/http";
import { useOutletContext } from "react-router-dom";
import { Tooltip } from "@radix-ui/themes";

function UserNightCountRow({ userId, username, selectedMonthDateArray, nightCount, isLoading }) {
    if (isLoading) {
        return (
            <tr className="hover:bg-slate-400">
                <td className="border border-black w-20 bg-blue-50">{username}</td>
                {selectedMonthDateArray.map((date, index) => (
                    <td key={index} className="m-0 px-0 w-8 text-xs border border-black text-center"></td>
                ))}
                <td className="border border-black w-20 bg-blue-50">{"...夜/...段/...元"}</td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-slate-400">
            <td className="border border-black w-20 bg-blue-50">{username}</td>
            {selectedMonthDateArray.map((date, index) => {
                // 获取该日期的数据
                const dayData = nightCount?.[date] || {};
                const nightSegments = dayData?.["夜班段数"] || 0;
                const specificAttendance = dayData?.["具体考勤"] || [];

                // 检查是否有夜班数据（夜班段数大于0）
                const hasNightShift = nightSegments > 0;

                return (
                    <td key={index} className="m-0 px-0 w-8 text-xs border border-black text-center">
                        {hasNightShift ? (
                            <Tooltip
                                content={
                                    <div className="p-2 max-w-xs">
                                        {specificAttendance.map((item, idx) => (
                                            <div key={idx}>
                                                {item?.["position"]} {item?.["dutyType"]} {item?.["inTime"]} -
                                                {item?.["outTime"]}
                                            </div>
                                        ))}
                                    </div>
                                }
                            >
                                <span className="cursor-pointer hover:text-blue-600">{nightSegments}段</span>
                            </Tooltip>
                        ) : (
                            <span className="text-gray-300"></span>
                        )}
                    </td>
                );
            })}

            <td className="m-0 px-0 border border-black text-center">
                {nightCount?.summary?.["夜班段数"] ? (
                    <>
                        {nightCount.summary["夜班次数"] || 0}夜/
                        {nightCount.summary["夜班段数"] || 0}段/
                        {parseInt(nightCount.summary["夜班段数"] || 0) * 10}元
                    </>
                ) : (
                    ""
                )}
            </td>
        </tr>
    );
}
export default function NightCount() {
    const { year, month } = useOutletContext();
    const { allDetailUsers } = useUserStore();
    const [daysArray, setDaysArray] = useState([]);
    const { loading, allUserNightCount } = useStatisticsStore();

    useEffect(() => {
        const daysInMonth = dayjs().year(year).month(month).daysInMonth();
        const newDaysArray = Array.from({ length: daysInMonth }, (_, index) => {
            return dayjs().year(year).month(month).startOf("month").add(index, "day").format("YYYY-MM-DD");
        });
        setDaysArray(newDaysArray);
    }, [year, month]);

    return (
        <div className="flex flex-row justify-start items-start text-center text-sm overflow-x-auto">
            <table className="w-full border-collapse text-nowrap">
                <thead>
                    <tr>
                        <th className="border border-black">姓名</th>
                        {daysArray.map((date, index) => (
                            <th
                                key={index}
                                className={`border border-black ${index % 7 === 0 ? "bg-gray-200 text-blue-600" : ""}`}
                            >
                                {index + 1}
                            </th>
                        ))}
                        <th className="border border-black">总次数/补贴</th>
                    </tr>
                </thead>
                <tbody>
                    {allDetailUsers.map((user, index) => {
                        return (
                            <UserNightCountRow
                                key={index}
                                userId={user.id}
                                username={user.username}
                                selectedMonthDateArray={daysArray}
                                year={year}
                                month={month}
                                nightCount={allUserNightCount?.[user.id] || {}}
                                isLoading={loading}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
