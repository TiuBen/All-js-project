import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocalStorageState } from "ahooks";
import dayjs from "dayjs";
import useSWR, { mutate } from "swr";
import { FETCHER, usePage } from "@utils";
import { Settings, Edit3, Plus } from "lucide-react";
import { API_URL } from "../../../../utils/const/Const";
import useStore from "../../../../utils/store/userStore";
import useDialog from "../../../../utils/hooks/useDialog";
import DetailStatisticsTable from "./DetailStatisticsTable";

function LikeExcel({
    selectedMonth,
    setSelectedMonth,
    selectedUserDutyRows,
    selectedUserDutyStatistics,
    reGetSelectedUserDutyRows,
    reGetSelectedUserDutyStatistics,
}) {
    // const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
    const { payload, setPayload } = usePage();

    const { selectedUser } = useStore();
    const { setDialogPayload } = useDialog();

    const [searchParams, setSearchParams] = useState(null);
    // // 使用useSWR监听searchTerm，当searchTerm为空时不发送请求
    // const { data: selectedUserDutyRows, mutate: reGetSelectedUserDutyRows } = useSWR(
    //     searchParams ? `${API_URL.duty}?${searchParams}` : null,
    //     FETCHER,
    //     {
    //         // 可选配置：防抖等逻辑通常需要在输入框层面处理，这里可以配置一些SWR选项
    //         revalidateOnFocus: true, // 例如，搜索结果可能不需要在窗口聚焦时重新验证
    //         fallbackData: [],
    //     }
    // );

    // const { data: selectedUserDutyStatistics, mutate: reGetSelectedUserDutyStatistics } = useSWR(
    //     searchParams ? `${API_URL.users}/${searchParams.get("userId")}/dutyStatistics?${searchParams}` : null,
    //     FETCHER,
    //     {
    //         // 可选配置：防抖等逻辑通常需要在输入框层面处理，这里可以配置一些SWR选项
    //         revalidateOnFocus: true, // 例如，搜索结果可能不需要在窗口聚焦时重新验证
    //         fallbackData: {},
    //     }
    // );

    // useEffect(() => {
    //     // append 可以添加多个相同名称的参数

    //     if (selectedMonth && selectedUser) {
    //         let q = new URLSearchParams();

    //         q.append("userId", selectedUser.id);
    //         q.append("username", selectedUser.username);

    //         // Append startDate and startTime
    //         q.append("startDate", dayjs().month(selectedMonth).date(1).format("YYYY-MM-DD"));
    //         q.append("startTime", "00:00:00");

    //         // Append endDate and endTime
    //         q.append(
    //             "endDate",
    //             dayjs()
    //                 .month(selectedMonth + 1)
    //                 .date(1)
    //                 .format("YYYY-MM-DD")
    //         );
    //         q.append("endTime", "00:00:01");

    //         setSearchParams(q);
    //     }
    // }, [selectedMonth, selectedUser, payload]);

    return (
        <>
            <div className="flex  items-center">
                {["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"].map(
                    (x, index) => {
                        return (
                            <div
                                key={index}
                                className={`flex-1 border border-black text-center rounded-t-lg hover:font-bold ${
                                    index === selectedMonth ? " bg-inherit font-extrabold  " : "bg-slate-200"
                                }`}
                                onClick={() => {
                                    setSelectedMonth(index);
                                }}
                            >
                                {x}
                            </div>
                        );
                    }
                )}
            </div>
            <div className="flex-1 flex flex-row justify-start items-start gap-2 overflow-auto min-h-0 ">
                <div>
                    <table>
                        <thead>
                            <tr>
                                <td className="border border-slate-600 px-1 text-nowrap text-center">修改</td>
                                <td className="border border-slate-600 px-1 text-nowrap text-center">日 期</td>
                                <td className="border border-slate-600 px-1 text-nowrap text-center">岗 位</td>
                                <td className="border border-slate-600 px-1 text-nowrap text-center ">上岗时刻</td>
                                <td className="border border-slate-600 px-1 text-nowrap text-center">交接班</td>
                                <td className="border border-slate-600 px-1 text-nowrap text-center">离岗时刻</td>
                                <td className="border border-slate-600 px-1 text-nowrap text-center text-xs w-[4rem]">
                                    时段
                                    <br />
                                    工作小时
                                </td>
                                <td className="border border-slate-600 px-2 text-nowrap text-center">白班小时</td>
                                <td className="border border-slate-600 text-nowrap text-center text-xs w-[4rem]">
                                    夜班小时 <br /> (0000-0800)
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedUserDutyRows.map((x, index) => {
                                return (
                                    <tr
                                        key={index}
                                        className={`text-sm font-bold group hover:bg-transparent ${
                                            dayjs(x.outTime).diff(dayjs(x.inTime, "YYYY-MM-DD HH:mm:ss"), "h", true) >
                                            8.0
                                                ? "text-red-600"
                                                : ""
                                        }`}
                                    >
                                        <td className="border border-slate-600 px-1 text-nowrap text-center group-hover:bg-slate-400">
                                            <button
                                                onClick={() => {
                                                    console.log("clicked " + x.id);
                                                    setDialogPayload({
                                                        ...payload,
                                                        editSheetDisplay: true,
                                                        editSheetRowId: x.id,
                                                    });
                                                    useStore.setState({ selectedDutyRecord: x });
                                                }}
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            {/* <>{x.id}</> */}
                                        </td>
                                        <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                            {dayjs(x.inTime).format("YYYY-MM-DD")}
                                        </td>
                                        <td className="border border-slate-600 pr-2 text-nowrap group-hover:bg-slate-400">
                                            <span
                                                className={`text-xs italic ml-2 ${
                                                    x.relatedDutyTableRowId && x.position !== "领班"
                                                        ? "bg-slate-400"
                                                        : ""
                                                }  ${x.roleType ? "bg-slate-400 line-through" : ""} `}
                                            >
                                                {x.position}
                                            </span>
                                            {x.roleType && <span className="text-xs italic ml-1   ">见习</span>}
                                            {Array.isArray( x.relatedDutyTableRowId) && (
                                                <span
                                                    className={`text-xs italic ml-2 ${
                                                        x.position === "领班" ? "bg-slate-400 line-through" : ""
                                                    }`}
                                                >
                                                    教员
                                                </span>
                                            )}
                                            {x.dutyType && <span className="text-xs  ml-1">({x.dutyType})</span>}
                                        </td>
                                        <td
                                            className={`border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400 ${
                                                dayjs(x.inTime).month() !== selectedMonth ? "bg-red-400" : " "
                                            }`}
                                        >
                                            {dayjs(x.inTime).format("YYYY-MM-DD HH:mm:ss")}
                                        </td>
                                        <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                            {x.outTime !== null ? "完成" : ""}
                                        </td>
                                        <td
                                            className={`border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400 ${
                                                dayjs(x.outTime).month() !== selectedMonth ? "bg-red-400" : " "
                                            }`}
                                        >
                                            {dayjs(x.outTime).format("YYYY-MM-DD HH:mm:ss")}
                                        </td>
                                        <td
                                            className={`border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400 `}
                                        >
                                            {Math.floor(
                                                dayjs(x.outTime).diff(
                                                    dayjs(x.inTime, "YYYY-MM-DD HH:mm:ss"),
                                                    "h",
                                                    true
                                                ) * 100
                                            ) / 100}
                                        </td>
                                        <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                            {x.dayShift === 0 ? "" : x.dayShift}
                                        </td>
                                        <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                            {x.nightShift === 0 ? "" : x.nightShift}
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr>
                                <td
                                    className={
                                        "border border-slate-600 px-1 text-nowrap text-center hover:bg-blue-500 hover:text-white  items-center justify-center"
                                    }
                                >
                                    <button
                                        className=" disabled:cursor-not-allowed disabled:text-red-700"
                                        disabled={!selectedUser}
                                        onClick={() => {
                                            if (selectedUser) {
                                                setDialogPayload({ ...payload, AddNewDutyRecordDialogDisplay: true });
                                            }
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <DetailStatisticsTable dutyStatistics={selectedUserDutyStatistics} />
            </div>
        </>
    );
}

export default LikeExcel;


