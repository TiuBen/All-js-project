import React, { useEffect, useRef, useState } from "react";
import { MonthCalender } from "@sn/MonthCalender";
import { Button, Popover } from "@radix-ui/themes";
import { useCalendar } from "@sn/useCalender";
import MonthStatistics from "./MonthStatistics";
import useStore from "../../utils/store/userStore";
import { API_URL } from "../../utils/const/Const";
import dayjs from "dayjs";
import TimelineDutyDialog from "../Dialog/TimelineDutyDialog";
function Cell({ date }) {
    const parentRef = useRef(null);
    const [parentSize, setParentSize] = useState({ width: 0, height: 0 });
    const [dutyRecords, setDutyRecords] = useState([]);
    // 想要的效果是 显示
    // 白班 xx小时
    // 夜班 xx小时
    // 教员 xx小时
    // 学员 xx小时
    const [dutyStatics, setDutyStatics] = useState({});

    const { selectedUser, selectedUserNightCount } = useStore();
    const [selectedUserThisDateDutyRecords, setSelectedUserThisDateDutyRecords] = useState([]);

    useEffect(() => {
        if (date && selectedUser) {
            fetch(
                `${API_URL.users}/${selectedUser?.userId}/dutyStatistics?startDate=${dayjs(date, "YYYY-MM-DD").format(
                    "YYYY-MM-DD"
                )}&startTime=00:00:00&endDate=${dayjs(date, "YYYY-MM-DD")
                    .add(1, "day")
                    .format("YYYY-MM-DD")}&endTime=00:00:01&calculate=true`
            )
                .then((res) => res.json())
                .then((data) => {
                    setDutyStatics(data);
                });

       

            const q = new URLSearchParams();
            q.append("userId", selectedUser?.userId);
            q.append("startDate", dayjs(date, "YYYY-MM-DD").format("YYYY-MM-DD"));
            q.append("startTime", "00:00:00");
            q.append("endDate", dayjs(date, "YYYY-MM-DD").add(1, "day").format("YYYY-MM-DD"));
            q.append("endTime", "00:00:01");

            fetch(`${API_URL.duty}?${q}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    setSelectedUserThisDateDutyRecords(data);
                });
        }
    }, [selectedUser, date]);

    const _t = selectedUserNightCount?.[selectedUser?.username]?.[date]?.["夜班次数"];
    return (
        <>
            {/* <div
                ref={parentRef}
                className=" flex-1 border-t-[1px] min-h-[8rem] min-w-[4rem] flex flex-col items-start p-2"
            >
                {dutyStatics?.["totalTime"]?.["dayShift"] > 0 ? (
                    <div>{"白班" + dutyStatics?.["totalTime"]?.["dayShift"]?.toFixed(2) + "小时"}</div>
                ) : (
                    <div></div>
                )}
                {dutyStatics?.["totalTime"]?.["nightShift"] > 0 ? (
                    <div>{"夜班" + dutyStatics?.["totalTime"]?.["nightShift"].toFixed(2) + "小时"}</div>
                ) : (
                    <div></div>
                )}
                <div>{_t ? _t + `次夜班` : ""}</div>
            </div> */}
            {/* 我想怎么用 这个 popover  */}

            <Popover.Root>
                <Popover.Trigger asChild>
                    <div
                        ref={parentRef}
                        className=" flex-1 border-t-[1px] border-blue-200 min-h-[8rem] min-w-[4rem] flex flex-col items-start p-2 text-xs"
                    >
                        {dutyStatics?.["totalTime"]?.["dayShift"] > 0 ? (
                            <div>{"白班" + dutyStatics?.["totalTime"]?.["dayShift"]?.toFixed(2) + "小时"}</div>
                        ) : (
                            <div></div>
                        )}
                        {dutyStatics?.["totalTime"]?.["nightShift"] > 0 ? (
                            <div>{"夜班" + dutyStatics?.["totalTime"]?.["nightShift"].toFixed(2) + "小时"}</div>
                        ) : (
                            <div></div>
                        )}
                        <div>{_t ? _t + `次夜班` : ""}</div>
                    </div>
                </Popover.Trigger>
                {selectedUserThisDateDutyRecords?.length > 0 && (
                    <Popover.Content size={2} maxWidth="500px">
                        <ul className="w-[400px] text-nowrap">
                            {selectedUserThisDateDutyRecords?.map((item, index) => (
                                <li key={index} className={`${index !== 0 ? "border-t-[1px]" : ""}`}>
                                    <div className="flex flex-row flex-nowrap rounded-lg px-1 gap-1">
                                        {index + 1}
                                        <div className=" p-1">
                                            <div>开始时间 {item.inTime}</div>
                                            <div>结束时间 {item.outTime}</div>
                                        </div>
                                        <div className="p-1">
                                            <div>席位:{item.position}</div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Popover.Content>
                )}
                {/* <Popover.Content size={2} maxWidth="400px">
                    <div className="w-[300px]">{JSON.stringify(selectedUserThisDateDutyRecords)}</div>
                </Popover.Content> */}
            </Popover.Root>
        </>
    );
}

function DetailPage() {
    const { year, month, addOneMonth, subOneMonth } = useCalendar();

    return (
        <div className="flex-1 w-full h-full p-4 flex flex-row gap-4 overflow-clip text-sm">
            <div className="flex-shrink-0 overflow-y-auto ">
                <MonthStatistics month={month} year={year} />
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto relative">
                <div className=" overflow-y-auto">
                    <MonthCalender
                        title={
                            <div className="flex flex-row flex-1 flex-shrink-0 items-center justify-between p-2">
                                <div className="flex flex-row flex-1 gap-1 items-center ">
                                    <div className=" text-3xl font-bold">
                                        {year}年{month + 1}月
                                    </div>
                                    <Button
                                        size="1"
                                        onClick={() => {
                                            subOneMonth();
                                        }}
                                    >
                                        上一月
                                    </Button>
                                    <Button
                                        size="1"
                                        onClick={() => {
                                            addOneMonth();
                                        }}
                                    >
                                        下一月
                                    </Button>
                                </div>

                                <div className="text-sm text-gray-500">共31天</div>
                            </div>
                        }
                        year={year}
                        month={month}
                        cellRender={(x) => {
                            return <Cell date={x} />;
                        }}
                    />
                </div>

                <span className="text-xs text-red-500 italic font-semibold font-sans  ">
                    备注：如14号当日晚上24：00之后的夜班，归属到14号；但是，当天00:00-24:00值班时间统计,归属今天。
                </span>
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
