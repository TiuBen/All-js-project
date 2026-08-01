import React, { useEffect, useState, useRef } from "react";
// import { MonthCalender } from "@sn/MonthCalender";
// import { useCalendar } from "@sn/useCalender";
// import { Button } from "@radix-ui/themes";
// import dayjs from "dayjs";
// import { ArrowLeft, ArrowRight } from "lucide-react";
// import { API_URL } from "../../../utils/const/Const";
// import RightBarSelectDayDetail from "./RightBarSelectDayDetail";
import YearMonthTab from "../../components/YearMonthTab";
import dayjs from "dayjs";
import { useUserStore } from "@/store/user.store";
import { useAppStore } from "../../store/app.store";
import { useDutyStore } from "../../store/duty.store";
import { useStatisticsStore } from "../../store/statistics.store";
import { TestButton, MonthCalendar } from "@sn/ui";
import UserRadioButtonList from "@/components/UserRadioButtonList";

// 1. 定义选项数据，方便后续维护
const DUTY_OPTIONS = [
    { label: "不填=不上班/轮休", value: "", value_text: "不上班/轮休" },
    { label: "0=行政班/调度席且无夜班", value: "0", value_text: "行政班/调度席且无夜班" },
    { label: "1=1段夜班", value: "1", value_text: "1段夜班" },
    { label: "2=2段夜班", value: "2", value_text: "2段夜班" },
    { label: "3=3段夜班", value: "3", value_text: "3段夜班" },
    { label: "C=出差", value: "C", value_text: "出差" },
    { label: "S=事假", value: "S", value_text: "事假" },
    { label: "B=病假", value: "B", value_text: "病假" },
    { label: "●=产假", value: "●", value_text: "产假" },
    { label: "N=年休假", value: "N", value_text: "年休假" },
    { label: "■=其他", value: "■", value_text: "其他" },
];
function Page() {
    // const { year, month, addOneMonth, subOneMonth } = useCalendar();

    // useEffect(() => {
    // const _data = getDuty(new URLSearchParams({ year: year, month: month }));
    // }, [year, month]);

    const { selectedYear, selectedMonth } = useAppStore();
    const { selectedUser } = useUserStore();
    const { selectedUserHrDutySummary, isSelectedUserHrDutySummaryLoading } = useDutyStore();
    const { getHrDutySummary, saveHrDutySummary } = useDutyStore();
    const { nightCount, fetchNightCount } = useStatisticsStore();

    // 2. 记录当前点击的日期
    const [selectedDate, setSelectedDate] = useState(null);
    const dialogRef = useRef(null);

    // 3. 监听 selectedDate 的变化，控制原生 dialog 的打开与关闭
    useEffect(() => {
        if (selectedDate) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [selectedDate]);

    useEffect(() => {
        if (selectedYear && selectedMonth !== null && selectedUser) {
            getHrDutySummary();
            fetchNightCount();
        }
    }, [selectedYear, selectedMonth, selectedUser]);

    const displayDutyMap = React.useMemo(() => {
        const map = {};
        const userId = selectedUser?.id;
        if (!userId) return map;
        // 1. 获取当前选中用户的排班数据 (如果存在)
        // selectedUserHrDutySummary 现在是 { "1": {...}, "12": {...} }
        const userDutyData = selectedUserHrDutySummary[userId] || {};

        // 2. 获取当前选中用户的夜班统计数据
        const userNightStats = nightCount[userId] || {};

        // 3. 合并逻辑

        // 先填充统计数据的默认值 (未确认)
        Object.entries(userNightStats).forEach(([date, stats]) => {
            const segments = stats["夜班段数"];
            if (segments > 0) {
                map[date] = {
                    value: segments.toString(),
                    value_text: `${segments}段夜班`,
                    confirmed: false,
                };
            }
        });

        // 再用 HR 排班数据覆盖 (已确认)
        // userDutyData 是 { "2026-07-19": { value: "1", ... } }
        Object.entries(userDutyData).forEach(([date, dutyInfo]) => {
            map[date] = {
                value: dutyInfo.value,
                value_text: dutyInfo.value_text,
                confirmed: true,
                id: dutyInfo.id,
            };
        });

        return map;
    }, [nightCount, selectedUserHrDutySummary, selectedUser]);

    // 4. 处理选择事件
    const handleSelect = async (opt) => {
        console.log(`日期 ${selectedDate} 选择了: ${opt.value_text}`);
        console.log(opt);
        // 利用 displayDutyMap 判断，如果存在且 value 不为空，说明是已有数据
        const isExisting = displayDutyMap[selectedDate]?.id !== undefined;

        console.log(isExisting ? "触发 PUT 更新逻辑" : "触发 POST 新增逻辑");
        console.log(displayDutyMap[selectedDate]);
        const payload = {
            userId: selectedUser.id,
            username: selectedUser.username,
            duty_date: selectedDate,
            value: opt.value,
            value_text: opt.value_text,
        };
        if (isExisting) {
            // 已有数据，使用 PUT 方法更新
            // 假设你的 store 里有 updateHrDutySummary 方法，或者 saveHrDutySummary 内部处理了
            console.log("触发 PUT 更新逻辑");
            payload.id = displayDutyMap[selectedDate].id;
            await saveHrDutySummary(payload, "PUT"); // 示例：传入方法标识
        } else {
            // 无数据，使用 POST 方法新增
            console.log("触发 POST 新增逻辑");
            await saveHrDutySummary(payload, "POST"); // 示例：传入方法标识
        }

        setSelectedDate(null);
    };

    return (
        <div className="flex flex-col  flex-1 items-stretch w-full  h-full">
            <YearMonthTab />

            <div className="flex-1 p-2 items-stretch justify-stretch flex flex-row">
                <div className="flex flex-col flex-1">
                    <h3 className="text-center text-wrap text-[clamp(0.875rem,2vw,1.5rem)] font-bold text-blue-600">
                        不填=不上班\轮休, 0=行政班\调度席且无夜班 1-5=当日实际夜班时段数 C=出差 S=事假 B=病假 ●=产假
                        N=年休假 ■=其他
                    </h3>
                    <MonthCalendar
                        year={selectedYear}
                        month={selectedMonth}
                        cellRender={(date) => {
                            const duty = displayDutyMap[date];

                            return (
                                <div
                                    className={`w-full h-full cursor-pointer p-1 text-2xl flex items-center justify-center text-center text-gray-600 hover:bg-blue-100  ${
                                        duty?.confirmed ? "text-gray-800" : "text-red-500"
                                    }`}
                                    onClick={() => {
                                        if (!selectedYear || selectedMonth === null || !selectedUser) {
                                            return;
                                        }

                                        setSelectedDate(date);
                                    }}
                                >
                                    {duty?.value_text ?? ""}
                                </div>
                            );
                        }}
                    />
                    {/* 6. 原生 Dialog 选择面板 */}
                    <dialog
                        ref={dialogRef}
                        onClose={() => setSelectedDate(null)}
                        className="rounded-lg p-0 shadow-xl border-none m-auto backdrop:bg-black/50 text-2xl"
                    >
                        <div className="p-4  flex flex-row gap-2">
                            <div className="flex flex-col justify-between items-center mb-3">
                                <h4 className="font-bold text-gray-700 text-center">{selectedDate} 排班设置</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {DUTY_OPTIONS.map((opt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSelect(opt)}
                                            className="px-3 py-2 text-xl text-left rounded-md border hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedDate(null)}
                                className="text-red-400 hover:text-red-600   font-bold  self-start"
                            >
                                ✕
                            </button>
                        </div>
                    </dialog>
                </div>
                <div>
                    <UserRadioButtonList />
                </div>
            </div>
        </div>
    );
}

export default Page;
