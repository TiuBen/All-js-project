import React, { useEffect, useState } from "react";
import { useDutyStore } from "@/store/duty.store";
import UserRadioButtonList from "@/components/UserRadioButtonList";
import YearMonthTab from "@/components/YearMonthTab";
import LikeExcel from "./LikeExcel/LikeExcel";
import DutyRecordDialog from "./Dialog/DutyRecordDialog";
import { useUserStore } from "@/store/user.store";
import dayjs from "dayjs";

function Page() {
    const { loading, query, setQuery } = useDutyStore();
    const { selectedUser } = useUserStore();

    useEffect(() => {
        setQuery({ ...query, selectedUser: selectedUser });
    }, [selectedUser]);
    return (
        <div>
            <div className="flex flex-row">
                <YearMonthTab
                    year={query.year}
                    onYearChange={(year) => setQuery({ ...query, year })}
                    month={query.month}
                    onMonthChange={(month) => setQuery({ ...query, month })}
                />
            </div>
            <div className="flex flex-row flex-nowrap m-2">
                {selectedUser === null ? (
                    <div className="flex-1">请选择用户</div>
                ) : loading ? (
                    <div className="flex-1">加载中...</div>
                ) : (
                    <LikeExcel selectedMonth={query.month} />
                )}
                {/* <UserRadioButtonList changeSelectedUser={(x) => setQuery({ ...query, selectedUser: x })} /> */}
                <UserRadioButtonList />
            </div>
            <DutyRecordDialog />
        </div>
    );
}

export default Page;
