import React, { useEffect, useMemo, useState } from "react";
import { MonthCalender } from "@sn/MonthCalender";
import { Button, Popover } from "@radix-ui/themes";
import { useCalendar } from "@sn/useCalender";
import MonthStatistics from "./MonthStatistics";
import useStore from "../../utils/store/userStore";
import { API_URL } from "../../utils/const/Const";

function DetailPage({ year, month }) {
    const [selectedUserHrDutySummary, setSelectedUserHrDutySummary] = useState([]);
    const { selectedUser } = useStore();

    useEffect(() => {
        if (year && month && selectedUser) {
            const q = new URLSearchParams();
            q.append("year", year);
            q.append("month", month);
            q.append("userId", selectedUser?.userId);

            fetch(`${API_URL.duty}/hr-duty/list?${q}`)
                .then((r) => r.json())
                .then((data) => {
                    setSelectedUserHrDutySummary(data);
                })
                .catch(() => {
                    setSelectedUserHrDutySummary([]);
                });
        }
    }, [year, month, selectedUser]);

    const displayDutyMap = useMemo(() => {
        const map = {};

        selectedUserHrDutySummary.forEach((item) => {
            map[item.duty_date] = item;
        });

        return map;
    }, [selectedUserHrDutySummary]);
    return (
        <div className="flex-1 w-full h-full p-4 gap-4 flex flex-row  overflow-clip text-sm">
            <div className=" overflow-y-auto ">
                <MonthStatistics month={month} year={year} />
                <div className="text-xs text-red-500 italic font-semibold w-[470px] font-sans text-wrap ">
                    备注：如14号当日晚上24：00之后的夜班，归属到14号； 但是，当天00:00-24:00值班时间统计,归属今天。
                </div>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto ">
                <div className="flex flex-1 overflow-auto">
                    <MonthCalender
                        title={<></>}
                        year={year}
                        month={month}
                        cellRender={(x) => {
                            const duty = displayDutyMap[x];

                            return (
                                <div
                                    className={`w-full h-full cursor-pointer p-1  flex items-center justify-center text-center text-gray-600 hover:bg-blue-100  text-gray-800"
                                    `}
                                >
                                    {duty?.value_text ?? ""}
                                </div>
                            );
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default DetailPage;

// useEffect(() => {
//     if (!parentRef.current) return;

//     const resizeObserver = new ResizeObserver((entries) => {
//         const { width, height } = entries[0].contentRect;
//         setParentSize({ width, height });
//     });

//     resizeObserver.observe(parentRef.current);

//     return () => {
//         resizeObserver.disconnect(); // 清理监听
//     };
// }, []);
