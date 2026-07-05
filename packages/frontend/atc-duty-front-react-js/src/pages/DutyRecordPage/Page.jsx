import React, { useEffect, useState } from "react";
import { useDutyStore } from "@/store/duty.store";
import UserRadioButtonList from "@/components/UserRadioButtonList";
import YearMonthTab from "@/components/YearMonthTab";
import LikeExcel from "./LikeExcel/LikeExcel";
import DutyRecordDialog from "./Dialog/DutyRecordDialog";
import { useUserStore } from "@/store/user.store";

function Page() {
    const { selectedUser } = useUserStore();
    const { isDutyRecordsLoading, getDutyRecords } = useDutyStore();

    useEffect(() => {
        if (selectedUser) {
            getDutyRecords();
        }
    }, [selectedUser]);

    return (
        <div>
            <div className="flex flex-row">
                <YearMonthTab />
            </div>
            <div className="flex flex-row flex-nowrap m-2">
                {selectedUser === null ? (
                    <div className="flex-1">请选择用户</div>
                ) : isDutyRecordsLoading ? (
                    <div className="flex-1">加载中...</div>
                ) : (
                    <LikeExcel />
                )}
                {/* <UserRadioButtonList changeSelectedUser={(x) => setQuery({ ...query, selectedUser: x })} /> */}
                <UserRadioButtonList />
            </div>
            <DutyRecordDialog />
        </div>
    );
}

export default Page;
