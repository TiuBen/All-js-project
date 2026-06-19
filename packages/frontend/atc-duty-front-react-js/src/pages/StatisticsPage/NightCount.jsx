import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useUserStore } from "../../store/user.store";
import { http } from "../../service/http";
import { useOutletContext } from "react-router-dom";

function UserNightCountRow({ userId, username, startDate, startTime, endDate, endTime, selectedMonthDateArray }) {
    const YYYYMM = startDate.slice(0, 7);
    const [nightCount, setNightCount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchNightCount = async () => {
            try {
                const data = await http.get(`/users/${userId}/nightCount`, {
                    params: { startDate, startTime, endDate, endTime },
                });
                setNightCount(data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNightCount();
    }, [userId, startDate, startTime, endDate, endTime]);

    if (loading)
        return (
            <tr>
                <td>{username}</td>
                <td colSpan={selectedMonthDateArray.length + 1}>加载中...</td>
            </tr>
        );

    return (
        <tr className="hover:bg-slate-400">
            <td className="border border-black w-[5rem]  bg-blue-50">{username}</td>
            {selectedMonthDateArray.map((date, index) => {
                const dateAsKey = date.format("YYYY-MM-DD");
                return (
                    <td key={index} className="m-0 px-0 w-[2rem] text-xs border border-black">
                        {(nightCount?.[username]?.[dateAsKey]?.["夜班段数"] || "") &&
                            `${nightCount[username][dateAsKey]["夜班段数"]}段`}
                    </td>
                );
            })}

            <td className="m-0 px-0 border border-black">
                {nightCount?.[username]?.[YYYYMM]?.["夜班段数"]
                    ? parseInt(nightCount?.[username]?.[YYYYMM]?.["夜班段数"] || 0) + "段/"
                    : ""}
                {nightCount?.[username]?.[YYYYMM]?.["夜班段数"]
                    ? parseInt(nightCount?.[username]?.[YYYYMM]?.["夜班段数"] || 0) * 10 + "元"
                    : ""}
            </td>
        </tr>
    );
}

export default function NightCount() {
    const { year, month } = useOutletContext();
    const { allDetailUsers, fetchAllDetailUsers } = useUserStore();
    const [daysArray, setDaysArray] = useState([]);

    useEffect(() => {
        fetchAllDetailUsers();
    }, [fetchAllDetailUsers]);

    useEffect(() => {
        const selectedYYYYMMDD = dayjs().year(year).month(month).date(1);
        const daysInMonth = selectedYYYYMMDD.daysInMonth();
        const newDaysArray = Array.from({ length: daysInMonth }, (_, index) => {
            return selectedYYYYMMDD.startOf("month").add(index, "day");
        });
        setDaysArray(newDaysArray);
    }, [year, month]);

    const selectedYYYYMMDD = dayjs().year(year).month(month).date(1);

    return (
        <div className="flex flex-row justify-start items-start text-center text-sm overflow-x-auto">
            <table className="w-full border-collapse text-nowrap">
                <thead>
                    <tr>
                        <th className="border border-black">姓名</th>
                        {daysArray.map((date, index) => (
                            <th
                                key={index}
                                className={`border border-black ${index % 7 === 0 ? "bg-gray-200 text-blue-600" : ""}`}
                            >
                                {date.format("D")}
                            </th>
                        ))}
                        <th className="border border-black">总次数/补贴</th>
                    </tr>
                </thead>
                <tbody>
                    {allDetailUsers.map((user, index) => {
                        return (
                            <UserNightCountRow
                                key={index}
                                userId={user.id}
                                username={user.username}
                                startDate={selectedYYYYMMDD.format("YYYY-MM-DD")}
                                startTime={"00:00:00"}
                                endDate={selectedYYYYMMDD.add(1, "month").format("YYYY-MM-DD")}
                                endTime={"00:00:01"}
                                selectedMonthDateArray={daysArray}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
