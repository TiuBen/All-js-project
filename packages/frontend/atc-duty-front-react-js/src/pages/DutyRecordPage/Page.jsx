import React from "react";
import { useDutyStore } from "@/store/duty.store";
import UserRadioButtonList from "@/components/UserRadioButtonList";
import YearMonthTab from "@/components/YearMonthTab";
import LikeExcel from "./LikeExcel/LikeExcel";
function Page() {
    const { query, setQuery, dutyRecords } = useDutyStore();

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
            <div className="flex flex-row  flex-nowrap m-2">
                <LikeExcel selectedUserDutyRows={dutyRecords} />
                <UserRadioButtonList selectedUser={query.userId} onChange={(userId) => setQuery({ userId })} />
            </div>
        </div>
    );
}

export default Page;
