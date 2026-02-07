import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { SERVER_URL, FETCHER } from "@utils";
import dayjs from "dayjs";
import { API_URL } from "../../../utils/const/Const";
import useStore from "../../../utils/store/userStore";

function UserRow({ month, username,userId }) {
    const [dutyStatics, setDutyStatics] = useState([]);

    useEffect(() => {
        // append 可以添加多个相同名称的参数

        let q = new URLSearchParams();
        q.append("userId", userId);
        q.append("username", username);
        // Append startDate and startTime
        q.append("startDate", dayjs().month(month).date(1).format("YYYY-MM-DD"));
        q.append("startTime", "00:00:00");

        // Append endDate and endTime
        q.append(
            "endDate",
            dayjs()
                .month(month + 1)
                .date(1)
                .format("YYYY-MM-DD")
        );
        q.append("endTime", "00:00:01");
        q.append("year", dayjs().get("year"));
        q.append("month", dayjs().get("month"));

        // ! 这部分想展示 一年的工作时间
        fetch(`${API_URL.users}/${userId}/dutyStatistics?${q}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setDutyStatics(data);
            });
    }, [month, username,userId]);

    return (
        <>
            <div className="flex flex-row justify-between gap-1">
                <div className="font-bold after:content-[':']">{username}</div>
                <div>
                    {String(
                        Math.floor(
                            ((dutyStatics?.totalCommanderTime?.dayShift || 0) +
                                (dutyStatics?.totalPositionTime?.dayShift || 0) +
                                (dutyStatics?.totalTeacherTime?.dayShift || 0) +
                                (dutyStatics?.totalStudentTime?.dayShift || 0) +
                                (dutyStatics?.totalCommanderTime?.nightShift || 0) +
                                (dutyStatics?.totalPositionTime?.nightShift || 0) +
                                (dutyStatics?.totalTeacherTime?.nightShift || 0) +
                                (dutyStatics?.totalStudentTime?.nightShift || 0)) *
                                100
                        ) / 100
                    )}
                </div>
            </div>
        </>
    );
}

function RightBarSelectDayDetail() {
    const {users,isLoading,error}=useStore();

    return (
        <div className="overflow-y-auto w-56 bg-gray-400 border-l border-gray-200 px-2 py-2">
            {error ? (
                <div>error</div>
            ) : isLoading ? (
                <div>loading....</div>
            ) : (
                <div className="flex flex-col flex-1  flex-nowrap text-sm  ">
                    {users?.map((item, index) => {
                        return <UserRow key={index} userId={item.id} month={dayjs().get("month")} username={item.username} />;
                    })}
                </div>
            )}
        </div>
    );
}

export default RightBarSelectDayDetail;
