import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Settings, Edit3, Plus } from "lucide-react";
import DetailStatisticsTable from "./DetailStatisticsTable";

function LikeExcel({
    selectedMonth = dayjs().get("month"),
    selectedUser,
    selectedUserDutyRows,
    selectedUserDutyStatistics = {},
}) {
    return (
        <>
            <div className="flex-1 flex flex-row justify-start items-start gap-2 overflow-auto min-h-0 cursor-pointer ">
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
                                        dayjs(x.outTime).diff(dayjs(x.inTime, "YYYY-MM-DD HH:mm:ss"), "h", true) > 8.0
                                            ? "text-red-600"
                                            : ""
                                    }`}
                                >
                                    <td className="border border-slate-600 px-1 text-nowrap text-center group-hover:bg-slate-400  align-middle">
                                        <div className="flex flex-row justify-center items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    console.log("clicked " + x.id);
                                                    // setDialogPayload({
                                                    //     ...payload,
                                                    //     editSheetDisplay: true,
                                                    //     editSheetRowId: x.id,
                                                    // });
                                                    // useStore.setState({ selectedDutyRecord: x });
                                                }}
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        </div>

                                        {/* <>{x.id}</> */}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                        {dayjs(x.inTime).format("YYYY-MM-DD")}
                                    </td>
                                    <td className="border border-slate-600 pr-2 text-nowrap group-hover:bg-slate-400">
                                        <span
                                            className={`text-xs italic ml-2 ${
                                                x.relatedDutyTableRowId && x.position !== "领班" ? "bg-slate-400" : ""
                                            }  ${x.roleType ? "bg-slate-400 line-through" : ""} `}
                                        >
                                            {x.position}
                                        </span>
                                        {x.roleType && <span className="text-xs italic ml-1   ">见习</span>}
                                        {Array.isArray(x.relatedDutyTableRowId) && (
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
                                        {dayjs(x.inTime).format("MM-DD HH:mm:ss")}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                        {x.outTime !== null ? "完成" : ""}
                                    </td>
                                    <td
                                        className={`border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400 ${
                                            dayjs(x.outTime).month() !== selectedMonth ? "bg-red-400" : " "
                                        }`}
                                    >
                                        {dayjs(x.outTime).format("MM-DD HH:mm:ss")}
                                    </td>
                                    <td
                                        className={`border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400 `}
                                    >
                                        {Math.floor(
                                            dayjs(x.outTime).diff(dayjs(x.inTime, "YYYY-MM-DD HH:mm:ss"), "h", true) *
                                                100
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
                                    "border border-slate-600 px-1 text-nowrap text-center hover:bg-blue-500 hover:text-white  align-middle"
                                }
                            >
                                <div className="flex flex-row justify-center items-center gap-1">
                                    <button
                                        className=" disabled:cursor-not-allowed disabled:text-red-700"
                                        disabled={!selectedUser}
                                        onClick={() => {
                                            if (selectedUser) {
                                                setDialogPayload({
                                                    ...payload,
                                                    AddNewDutyRecordDialogDisplay: true,
                                                });
                                            }
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <DetailStatisticsTable dutyStatistics={selectedUserDutyStatistics} />
            </div>
        </>
    );
}

export default LikeExcel;
