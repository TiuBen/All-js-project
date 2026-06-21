import React from "react";
import { useDutyStore } from "@/store/duty.store";
import UserRadioButtonList from "@/components/UserRadioButtonList";
import YearMonthTab from "@/components/YearMonthTab";
import LikeExcel from "./LikeExcel/LikeExcel";
import DutyRecordDialog from "./Dialog/DutyRecordDialog";
import { useUserStore } from "@/store/user.store";

function Page() {
    const { query, setQuery, dutyRecords } = useDutyStore();
    const { selectedDutyRecord, setSelectedDutyRecord } = useDutyStore();
    const { selectedUser, setSelectedUser } = useUserStore();

    return (
        <div>
            <div className="flex flex-row">
                <YearMonthTab
                    year={query.year}
                    onYearChange={(year) => setQuery({ year })}
                    month={query.month}
                    onMonthChange={(month) => setQuery({ month })}
                />
            </div>
            <div className="flex flex-row flex-nowrap m-2">
                <LikeExcel selectedUserDutyRows={dutyRecords} />
                <UserRadioButtonList />
            </div>
            <DutyRecordDialog />
        </div>
    );
}

export default Page;
