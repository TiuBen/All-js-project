import React, { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { useUserStore } from "../../store/user.store";
import { useStatisticsStore } from "../../store/statistics.store";
import { Tooltip } from "@radix-ui/themes";
import { useAppStore } from "@/store/app.store";

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

            <td className="m-0 px-4 border border-black text-center">
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
    const { allDetailUsers } = useUserStore();
    const { selectedYear, selectedMonth } = useAppStore();

    const { isNightCountLoading, nightCount, fetchNightCount } = useStatisticsStore();

    // 1. 在组件内部直接计算，每次年月改变时，它会在渲染瞬间零延迟计算完成！
    const daysArray = useMemo(() => {
        const daysInMonth = dayjs().year(selectedYear).month(selectedMonth).daysInMonth();

        // 获取当月的第一天作为基准
        const startOfMonth = dayjs().year(selectedYear).month(selectedMonth).startOf("month");

        return Array.from({ length: daysInMonth }, (_, index) => {
            // ✅ 基于第一天，依次累加天数，并格式化
            return startOfMonth.add(index, "day").format("YYYY-MM-DD");
        });
    }, [selectedYear, selectedMonth]); // 只有年月变了才重新计算，性能拉满

    // 2. 原来 useEffect 里的另外一个异步请求，带到它自己的单独 Effect 里去
    useEffect(() => {
        fetchNightCount();
    }, [selectedYear, selectedMonth, fetchNightCount]);

    return (
        <div className="flex flex-row justify-start items-start text-center text-sm overflow-x-auto">
            <table className="w-auto border-collapse text-nowrap">
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
                                year={selectedYear}
                                month={selectedMonth}
                                nightCount={nightCount?.[user.id] || {}}
                                isLoading={isNightCountLoading}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
