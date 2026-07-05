import React, { useEffect } from "react";
import dayjs from "dayjs";
import { Edit3, Plus } from "lucide-react";
import DetailStatisticsTable from "./DetailStatisticsTable";
import { dialogStore } from "../../../store/dialog.store";
import { useUserStore } from "@/store/user.store";
import { useDutyStore } from "@/store/duty.store";
import { useAppStore } from "@/store/app.store";
import { useStatisticsStore } from "@/store/statistics.store";

function LikeExcel() {
    const { openDutyDialog } = dialogStore();
    const { selectedUser } = useUserStore();
    const { selectedYear, selectedMonth } = useAppStore();

    const { dutyRecords, loading } = useDutyStore();
    const { userDutyDurationStatistics, fetchUserDutyDurationStatistics } = useStatisticsStore();

    useEffect(() => {
        if (selectedUser) {
            fetchUserDutyDurationStatistics();
        }
    }, [selectedYear, selectedMonth, selectedUser]);

    if (loading) {
        return <div className="flex-1">加载中...</div>;
    }

    return (
        <>
            <div className="flex-1 flex flex-row justify-start items-start gap-2 overflow-auto flex-wrap min-h-0 cursor-pointer text-sm">
                <table>
                    <thead>
                        <tr>
                            <td className="border border-slate-600 px-1 text-nowrap text-center">修改</td>
                            <td className="border border-slate-600 px-1 text-nowrap text-center">日 期</td>
                            <td className="border border-slate-600 px-1 text-nowrap text-center">岗 位</td>
                            <td className="border border-slate-600 px-1 text-nowrap text-center ">上岗时刻</td>
                            <td className="border border-slate-600 px-1 text-nowrap text-center">交接班</td>
                            <td className="border border-slate-600 px-1 text-nowrap text-center">离岗时刻</td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center text-xs">
                                打卡
                                <br />
                                时长
                            </td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center text-xs">
                                打卡
                                <br />
                                白班
                            </td>
                            <td className="border border-slate-600 text-nowrap text-center text-xs px-2">
                                打卡
                                <br />
                                夜班
                            </td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center text-xs">
                                教员
                                <br />
                                小时
                            </td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center text-xs">
                                教员
                                <br />
                                白班
                            </td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center text-xs">
                                教员
                                <br />
                                夜班
                            </td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center text-xs">
                                见习
                                <br />
                                小时
                            </td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center text-xs">
                                见习
                                <br />
                                白班
                            </td>
                            <td className="border border-slate-600 px-2 text-nowrap text-center text-xs">
                                见习
                                <br />
                                夜班
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        {dutyRecords.map((x, index) => {
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
                                                    openDutyDialog({
                                                        type: "edit",
                                                        dutyRecord: x,
                                                        selectedUser: selectedUser,
                                                    });
                                                }}
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        </div>

                                        {/* <>{x.id}</> */}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                        {dayjs(x.inTime).format("MM-DD")}
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
                                        {x.rawDuration || ""}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                        {x.rawDayDuration || ""}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                        {x.rawNightDuration || ""}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                        {x.teacherShift || ""}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                        {x.teacherDayShift || ""}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                        {x.teacherNightShift || ""}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                        {x.studentShift || ""}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                        {x.studentDayShift || ""}
                                    </td>
                                    <td className="border border-slate-600 px-2 text-nowrap text-center group-hover:bg-slate-400">
                                        {x.studentNightShift || ""}
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
                                        disabled={selectedUser === null}
                                        onClick={() => {
                                            openDutyDialog({
                                                type: "add",
                                                dutyRecord: {
                                                    userId: selectedUser?.id,
                                                    username: selectedUser?.username,
                                                    position: null,
                                                    dutyType: null,
                                                    roleType: null,
                                                    relatedDutyTableRowId: null,
                                                    inTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                                                    outTime: dayjs().add(2, "hour").format("YYYY-MM-DD HH:mm:ss"),
                                                },
                                                selectedUser: selectedUser,
                                            });
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <DetailStatisticsTable dutyStatistics={userDutyDurationStatistics} />
            </div>
        </>
    );
}

export default LikeExcel;
