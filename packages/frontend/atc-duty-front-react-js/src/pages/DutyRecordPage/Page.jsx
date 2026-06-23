import React, { useEffect, useState } from "react";
import { useDutyStore } from "@/store/duty.store";
import UserRadioButtonList from "@/components/UserRadioButtonList";
import YearMonthTab from "@/components/YearMonthTab";
import LikeExcel from "./LikeExcel/LikeExcel";
import DutyRecordDialog from "./Dialog/DutyRecordDialog";
import { useUserStore } from "@/store/user.store";
import dayjs from "dayjs";

function Page() {
    const { loading, dutyRecords, getDutyRecords } = useDutyStore();
    const { selectedUser } = useUserStore();
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState(dayjs().month());

    useEffect(() => {
        console.log(selectedUser);
        if (!selectedUser) return;

        getDutyRecords({
            startDate: dayjs().year(year).month(month).startOf("month").format("YYYY-MM-DD"),
            startTime: "00:00:00",
            endDate: dayjs()
                .year(year)
                .month(month + 1)
                .startOf("month")
                .format("YYYY-MM-DD"),
            endTime: " 00:00:01",

            username: selectedUser.username,
        });
    }, [selectedUser, year, month]);

    return (
        <div>
            <div className="flex flex-row">
                <YearMonthTab year={year} onYearChange={setYear} month={month} onMonthChange={setMonth} />
            </div>
            <div className="flex flex-row flex-nowrap m-2">
                {selectedUser === null ? (
                    <div className="flex-1">请选择用户</div>
                ) : loading ? (
                    <div className="flex-1">加载中...</div>
                ) : (
                    <LikeExcel selectedMonth={month} />
                )}
                <UserRadioButtonList selectedUser={selectedUser} />
            </div>
            <DutyRecordDialog selectedUser={selectedUser} />
        </div>
    );
}

export default Page;
