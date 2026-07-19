import React, { useEffect, useState, useRef } from "react";
// import { MonthCalender } from "@sn/MonthCalender";
// import { useCalendar } from "@sn/useCalender";
// import { Button } from "@radix-ui/themes";
// import dayjs from "dayjs";
// import { ArrowLeft, ArrowRight } from "lucide-react";
// import { API_URL } from "../../../utils/const/Const";
// import RightBarSelectDayDetail from "./RightBarSelectDayDetail";
import YearMonthTab from "../../components/YearMonthTab";

import { useAppStore } from "../../store/app.store";
import { useDutyStore } from "../../store/duty.store";
import { TestButton, MonthCalendar } from "@sn/ui";
import UserRadioButtonList from "@/components/UserRadioButtonList";

// 1. 定义选项数据，方便后续维护
const DUTY_OPTIONS = [
    { label: "不填=不上班/轮休", value: "" },
    { label: "0=行政班/调度席且无夜班", value: "0" },
    { label: "1=1段夜班", value: "1" }, // 实际业务中可能需要拆分为 1,2,3,4,5
    { label: "2=2段夜班", value: "2" }, // 实际业务中可能需要拆分为 1,2,3,4,5
    { label: "3=3段夜班", value: "3" }, // 实际业务中可能需要拆分为 1,2,3,4,5
    { label: "C=出差", value: "C" },
    { label: "S=事假", value: "S" },
    { label: "B=病假", value: "B" },
    { label: "●=产假", value: "●" },
    { label: "N=年休假", value: "N" },
    { label: "■=其他", value: "■" },
];

function Page() {
    // const { year, month, addOneMonth, subOneMonth } = useCalendar();

    // useEffect(() => {
    // const _data = getDuty(new URLSearchParams({ year: year, month: month }));
    // }, [year, month]);

    const { selectedYear, selectedMonth } = useAppStore();

    const { selectedUserHrDutySummary, isSelectedUserHrDutySummaryLoading } = useDutyStore();
    const { getHrDutySummary, createHrDutySummary } = useDutyStore();

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

    // 4. 处理选择事件
    const handleSelect = (value) => {
        console.log(`日期 ${selectedDate} 选择了: ${value}`);
        // TODO: 在这里调用 API 或更新 Store 保存排班数据
        setSelectedDate(null); // 选择后关闭面板
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
                        cellRender={(date) => (
                            <div
                                className="w-full h-full cursor-pointer p-1 text-xs text-gray-600 hover:bg-blue-100"
                                onClick={() => setSelectedDate(date)}
                            >
                                {""}
                            </div>
                        )}
                    />
                    {/* 6. 原生 Dialog 选择面板 */}
                    <dialog
                        ref={dialogRef}
                        onClose={() => setSelectedDate(null)}
                        className="rounded-lg p-0 shadow-xl border-none m-auto backdrop:bg-black/50"
                    >
                        <div className="p-4 w-80 flex flex-row gap-2">
                            <div className="flex flex-col justify-between items-center mb-3">
                                <h4 className="font-bold text-gray-700 text-center">{selectedDate} 排班设置</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {DUTY_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSelect(opt.value)}
                                            className="px-3 py-2 text-sm text-left rounded-md border hover:bg-blue-50 hover:border-blue-300 transition-colors"
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
