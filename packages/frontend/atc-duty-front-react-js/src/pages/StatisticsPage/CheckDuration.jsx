import React, { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import { useUserStore } from "../../store/user.store";
import { useOutletContext } from "react-router-dom";
import { http } from "../../service/http";

const WEEKDAY_MAP = ["日", "一", "二", "三", "四", "五", "六"];

function UserCheckDurationRow({ userId, username, year, month }) {
    const [checkResult, setCheckResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const dialogRef = useRef(null);

    useEffect(() => {
        const fetchNightCount = async () => {
            try {
                const data = await http.get(`/check-duration`, {
                    params: { userId: userId, year: year, month: month + 1 },
                });
                setLoading(false);
                // console.log(data);
                setCheckResult(data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchNightCount();
    }, [userId, year, month]);

    const openDialog = () => {
        if (dialogRef.current) {
            dialogRef.current.showModal();
        }
    };

    const closeDialog = () => {
        if (dialogRef.current) {
            dialogRef.current.close();
        }
    };

    if (loading)
        return (
            <tr className="hover:bg-slate-400">
                <td className="border border-black w-[5rem] bg-blue-50">{username}</td>
                <td className="border border-black">核对数据中...</td>
                <td className="border border-black">核对数据中...</td>
                <td className="border border-black">核对数据中...</td>
            </tr>
        );

    const result24 = checkResult?.result24hour;

    const result7 = checkResult?.result7day;

    const hasViolation = checkResult?.hasViolation;

    return (
        <>
            <>
                <tr className="hover:bg-slate-400">
                    <td className="border border-black w-[5rem] bg-blue-50">{username}</td>
                    <td className="border border-black"></td>
                    <td className="border border-black">
                        {result24.length !== 0 ? (
                            <span className="text-red-600 font-bold">存在超时</span>
                        ) : (
                            <span className="text-green-600">√</span>
                        )}
                    </td>
                    <td className="border border-black">
                        {result7.length !== 0 ? (
                            <span className="text-red-600 font-bold">存在超时</span>
                        ) : (
                            <span className="text-green-600">√</span>
                        )}
                    </td>
                    <td className="border border-black"> {hasViolation ? "❌" : "✅"}</td>
                    <td className="border border-black text-center">
                        {hasViolation && (
                            <button
                                className="text-blue-600 underline hover:text-blue-800"
                                onClick={() => openDialog(true)}
                            >
                                查看
                            </button>
                        )}
                    </td>
                </tr>
                <dialog
                    ref={dialogRef}
                    className="rounded-lg shadow-2xl w-[80%]  p-0 m-auto backdrop:bg-black/50"
                    onClose={closeDialog}
                >
                    <div className="flex flex-col max-h-[90vh]">
                        {/* 标题栏 */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">执勤时长违规详情</h2>
                                <span className="text-sm text-gray-500 ml-2">- {username}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {hasViolation ? (
                                    <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                                        ❌ 违规
                                    </span>
                                ) : (
                                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                        ✅ 合规
                                    </span>
                                )}
                                <button
                                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                    onClick={closeDialog}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* 内容区域 */}
                        <div className="p-4 overflow-y-auto flex-1">
                            {/* 24小时违规详情 */}
                            {checkResult?.result24hour?.length > 0 && (
                                <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-red-600">
                                            ⚠️24小时执勤违规（{checkResult.result24hour.length}次）
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        {checkResult.result24hour.map((item, index) => (
                                            <div key={index} className="border border-red-200 rounded-lg bg-red-50">
                                                {/* 标题 */}
                                                <div className="flex justify-start gap-4 items-center px-4 py-3 border-b bg-red-100 rounded-t-lg">
                                                    <div className="font-semibold text-red-700">
                                                        第 {index + 1} 个违规情况
                                                    </div>
                                                    <div className="text-sm font-bold">
                                                        实际{item.totalHours.toFixed(2)}h / 手册要求
                                                        {item.thresholdHours}h
                                                    </div>
                                                </div>

                                                {/* 信息 */}
                                                <div className="grid grid-cols-3 grid-rows-2 items-center gap-2 text-sm p-2 bg-white text-wrap">
                                                    <div>
                                                        超时：
                                                        <span className="text-red-600 font-bold">
                                                            {item.overtimeHours.toFixed(2)}h
                                                        </span>
                                                    </div>

                                                    <div>
                                                        原因：
                                                        <span className="font-medium">{item.statusMessage}</span>
                                                    </div>

                                                    <div>计算规则：从第一段开始24H</div>
                                                    <div>
                                                        原始累计：
                                                        {item.originalTotalHours.toFixed(2)}h
                                                    </div>

                                                    <div>
                                                        涉及记录：
                                                        {item.validRecords.length} 条
                                                    </div>

                                                    <div>
                                                        {item.validRecords[0].inTime} ~
                                                        {dayjs(item.validRecords[0].inTime)
                                                            .add(1, "day")
                                                            .format("MM-DD HH:mm:ss")}
                                                    </div>
                                                </div>

                                                {/* 执勤记录 */}
                                                <div className="border-t bg-gray-50">
                                                    {item.records.map((record, i) => (
                                                        <div
                                                            key={record.id}
                                                            className="flex flex-row justify-between items-center px-4 py-2 border-b last:border-0"
                                                        >
                                                            <div className="space-y-1 flex flex-row items-start font-medium text-xs text-center text-gray-500">
                                                                <div className="space-y-1 flex flex-col items-start">
                                                                    {record.records?.map((r, index) => {
                                                                        return (
                                                                            <div key={index}>
                                                                                #{r?.id} 席位~{r?.position}~ 打卡时间~
                                                                                {r?.inTime}~下卡时间 ~{r?.outTime}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {record.merged && (
                                                                    <span className="inline-block text-xs bg-orange-500 text-white rounded px-2 py-0.5">
                                                                        存在休息间隔小于30分钟,合并
                                                                        {record.originalIds.length} 条记录
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="text-blue-600 font-bold">
                                                                {record.durationHours.toFixed(2)} h
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* 被排除记录 */}
                                                {item.removedRecords?.length > 0 && (
                                                    <div className="bg-yellow-50 border-t p-4">
                                                        <div className="font-medium text-yellow-700 mb-2">
                                                            休息间隔大于8小时,被排除记录
                                                        </div>

                                                        {item.removedRecords.map((record, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex flex-col justify-between text-sm py-1"
                                                            >
                                                                {record?.records?.map((r, index) => {
                                                                    return (
                                                                        <div key={index}>
                                                                            #{r?.id} 席位~
                                                                            {r?.position}~ 打卡时间~
                                                                            {r.inTime}~下卡时间 ~{r.outTime}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 7天违规详情 */}
                            {/* 7天违规 */}
                            {checkResult?.result7day?.length > 0 && (
                                <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-red-600">
                                            ⚠️7天执勤违规（{checkResult.result7day.length}次）
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        {checkResult.result7day.map((item, index) => (
                                            <div key={index} className="border border-red-200 rounded-lg bg-red-50">
                                                {/* 标题 */}
                                                <div className="flex justify-start gap-4 items-center px-4 py-3 border-b bg-red-100 rounded-t-lg">
                                                    <div className="font-semibold text-red-700">
                                                        第 {index + 1} 个违规情况
                                                    </div>
                                                    <div className="text-sm font-bold">
                                                        实际{item.totalHours.toFixed(2)}h / 手册要求
                                                        {item.thresholdHours}h
                                                    </div>
                                                </div>

                                                {/* 信息 */}
                                                <div className="grid grid-cols-3 grid-rows-2 items-center gap-2 text-sm p-2 bg-white text-wrap">
                                                    <div>
                                                        超时：
                                                        <span className="text-red-600 font-bold">
                                                            {item.overtimeHours.toFixed(2)}h
                                                        </span>
                                                    </div>

                                                    <div>原因：超时</div>

                                                    <div>计算规则：从第一段开始7天</div>
                                                    <div>
                                                        原始累计：
                                                        {item?.totalHours?.toFixed(2)}h
                                                    </div>

                                                    <div>
                                                        涉及记录：
                                                        {item.records.length} 条
                                                    </div>

                                                    <div>
                                                        {item.records[0].inTime} ~
                                                        {dayjs(item.records[0].inTime)
                                                            .add(1, "D")
                                                            .format("MM-DD HH:mm:ss")}
                                                    </div>
                                                </div>

                                                {/* 执勤记录 */}
                                                <div className="border-t bg-gray-50">
                                                    {item.records.map((record, i) => (
                                                        <div
                                                            key={record.id}
                                                            className="flex flex-row justify-between items-center px-4 py-2 border-b last:border-0"
                                                        >
                                                            <div className="space-y-1 flex flex-row items-center font-medium text-xs text-center text-gray-500">
                                                                #{i + 1} 席位~{record.records?.[0]?.position}~ 打卡时间~
                                                                {record.inTime}~下卡时间 ~{record.outTime}
                                                                {record.merged && (
                                                                    <span className="inline-block text-xs bg-orange-500 text-white rounded px-2 py-0.5">
                                                                        休息间隔小于30分钟,合并
                                                                        {record.originalIds.length} 条记录
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="text-blue-600 font-bold">
                                                                {record.durationHours.toFixed(2)} h
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 无违规 */}
                            {!checkResult?.result24hour?.length && !checkResult?.result7day?.length && (
                                <div className="py-12 text-center">
                                    <div className="text-6xl mb-3">✅</div>

                                    <div className="text-lg text-green-600 font-semibold">本月未发现执勤时长违规</div>
                                </div>
                            )}
                        </div>

                        {/* 底部 */}
                        <div className="flex justify-end p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                                onClick={closeDialog}
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </dialog>
            </>
        </>
    );
}

export default function CheckDuration() {
    const { year, month } = useOutletContext();
    const { allDetailUsers } = useUserStore();

    const monthStart = dayjs().year(year).month(month).date(1);

    const daysInMonth = Array.from({ length: monthStart.daysInMonth() }, (_, i) =>
        monthStart.startOf("month").add(i, "day")
    );

    // const weekRangeLabel = (() => {
    //     if (!selectedDay) return "日历周内执勤总时长";
    //     const weekStart = selectedDay.startOf("week");
    //     const weekEnd = selectedDay.endOf("week");
    //     return `日历周(${weekStart.format("M月DD日")}-${weekEnd.format("M月DD日")})内执勤总时长`;
    // })();

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
            {/* <div className="flex flex-row gap-1 flex-nowrap">
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
            </div> */}

            <table className="w-full border-collapse text-nowrap">
                <thead>
                    <tr>
                        <th className="border border-black">姓名</th>
                        <th className="border border-black">
                            单次打卡最长执勤时间
                            <span className="text-red-500">(&le;6H)</span>
                        </th>
                        <th className="border border-black">
                            24小时内执勤总计时长
                            <span className="text-red-500">(&le;10sH)</span>
                        </th>
                        <th className="border border-black">
                            {/* {weekRangeLabel} */}日历周内执勤总时长
                            <span className="text-red-500">(&le;40H)</span>
                        </th>
                        <th className="border border-black">是否合规</th>
                        <th className="border border-black">详情</th>
                    </tr>
                </thead>
                <tbody>
                    {allDetailUsers.map((user, index) => (
                        <UserCheckDurationRow
                            key={index}
                            userId={user.id}
                            username={user.username}
                            year={year}
                            month={month}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
