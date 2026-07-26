import React, { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { useUserStore } from "../../store/user.store";
import { Tooltip } from "@radix-ui/themes";
import { useAppStore } from "@/store/app.store";
import { useDutyStore } from "../../store/duty.store";

// 子组件：单行用户数据
function UserNightCountRow({ userId, username, selectedMonthDateArray, userDutyMap }) {
    return (
        <tr className="hover:bg-slate-100 transition-colors">
            <td className="border border-gray-300 w-24 bg-blue-50 font-xs text-center sticky left-0 z-10">
                {username}
            </td>
            {selectedMonthDateArray.map((dateStr, index) => {
                // 从 Map 中获取当天的数据
                const dayData = userDutyMap?.[dateStr];

                // 解析数据
                const value = dayData?.value; // 例如: "1", "2", "C", null
                const valueText = dayData?.value_text; // 例如: "1段夜班", "出差", "不上班/轮休"

                // 判断是否显示内容
                let displayContent = null;
                let tooltipContent = null;
                let cellClass = "text-gray-300"; // 默认灰色空值

                if (dayData) {
                    const val = dayData.value;
                    const txt = dayData.value_text;

                    // 1. 处理夜班 (1, 2, 3)
                    if (["1", "2", "3"].includes(val)) {
                        displayContent = `${val}`;
                        cellClass = "text-blue-600 font-bold cursor-pointer hover:text-blue-800";
                        tooltipContent = txt || `${val}段夜班`;
                    }
                    // 2. 处理行政班 (0)
                    else if (val === "0") {
                        displayContent = "0"; // 或者显示 "0"
                        cellClass = "text-gray-500 text-[10px]";
                        tooltipContent = txt || "行政班/调度席且无夜班";
                    }
                    // 3. 处理出差 (C)
                    else if (val === "C") {
                        displayContent = "C";
                        cellClass = "text-orange-500 font-bold bg-orange-50";
                        tooltipContent = txt || "出差";
                    }
                    // 4. 处理事假 (S)
                    else if (val === "S") {
                        displayContent = "S";
                        cellClass = "text-purple-500 text-[10px]";
                        tooltipContent = txt || "事假";
                    }
                    // 5. 处理病假 (B)
                    else if (val === "B") {
                        displayContent = "B";
                        cellClass = "text-purple-500 text-[10px]";
                        tooltipContent = txt || "病假";
                    }
                    // 6. 处理产假 (●)
                    else if (val === "●") {
                        displayContent = "●";
                        cellClass = "text-pink-500 text-[10px]";
                        tooltipContent = txt || "产假";
                    }
                    // 7. 处理年休假 (N)
                    else if (val === "N") {
                        displayContent = "年";
                        cellClass = "text-green-600 text-[10px]";
                        tooltipContent = txt || "年休假";
                    }
                    // 8. 处理其他 (■)
                    else if (val === "■") {
                        displayContent = "■";
                        cellClass = "text-gray-500 text-[10px]";
                        tooltipContent = txt || "其他";
                    }
                    // 9. 处理空值/轮休 ("")
                    else if (val === "" || val == null) {
                        displayContent = "\u00A0";
                        cellClass = "text-gray-100 "; // 几乎不可见，保持占位
                        tooltipContent = "不上班/轮休";
                    }
                    // 兜底：如果有 value_text 但没匹配到上面任何规则
                    else if (txt) {
                        displayContent = txt.length > 4 ? txt.substring(0, 4) + ".." : txt;
                        cellClass = "text-gray-500 text-[10px]";
                        tooltipContent = txt;
                    }
                }

                return (
                    <td key={index} className="m-0 px-0 w-8 text-xs border border-black text-center ">
                        {displayContent ? (
                            <Tooltip content={tooltipContent}>
                                <span
                                    className={`${cellClass}  cursor-pointer`}
                                    dangerouslySetInnerHTML={{ __html: displayContent }}
                                />
                            </Tooltip>
                        ) : (
                            // <span className="text-gray-100">·</span> // 占位符，保持格子高度
                            <></>
                        )}
                    </td>
                );
            })}
        </tr>
    );
}

export default function HrDutyExcel() {
    const { allDetailUsers } = useUserStore();
    const { selectedYear, selectedMonth } = useAppStore();
    const { selectedUserHrDutySummary, getHrDutySummary, isSelectedUserHrDutySummaryLoading } = useDutyStore();

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

    // 2. 触发数据加载
    useEffect(() => {
        // 只要年月存在，就尝试获取数据
        if (selectedYear && selectedMonth != null) {
            getHrDutySummary(true);
        }
    }, [selectedYear, selectedMonth, getHrDutySummary]);

    if (!selectedYear || selectedMonth == null) {
        return <div className="p-10 text-center text-gray-500">请选择年份和月份</div>;
    }

    return (
        <>
            <h2 className="text-center text-blue-500 font-bold text-2xl ">
                {selectedYear + "年" + (selectedMonth + 1)}月人力统计表格
                {isSelectedUserHrDutySummaryLoading && (
                    <span className="text-sm text-blue-500 animate-pulse">加载中...</span>
                )}
            </h2>
            <div className="flex flex-row justify-start items-start text-center text-sm overflow-x-auto">
                <table className="w-auto border-collapse text-nowrap">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2 w-24 bg-blue-50 sticky left-0 z-30">姓名</th>
                            {daysArray.map((dateStr, index) => {
                                const dayJsDate = dayjs(dateStr);
                                const isWeekend = dayJsDate.day() === 0 || dayJsDate.day() === 6;
                                return (
                                    <th
                                        key={index}
                                        className={`border border-gray-300 p-1  text-xs font-normal ${
                                            isWeekend ? "bg-red-50 text-red-500" : "bg-white text-gray-700"
                                        }`}
                                    >
                                        <div>{dayJsDate.date()}</div>
                                        <div className="text-[10px] opacity-60">
                                            {["日", "一", "二", "三", "四", "五", "六"][dayJsDate.day()]}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {allDetailUsers.map((user) => {
                            const userDutyMap = selectedUserHrDutySummary?.[user.id] || {};

                            return (
                                <UserNightCountRow
                                    key={user.id}
                                    userId={user.id}
                                    username={user.username}
                                    selectedMonthDateArray={daysArray}
                                    userDutyMap={userDutyMap}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
