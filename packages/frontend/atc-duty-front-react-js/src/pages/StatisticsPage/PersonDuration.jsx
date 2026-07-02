import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useUserStore } from "../../store/user.store";
import { http } from "../../service/http";
import { useOutletContext } from "react-router-dom";
import { formatDecimal } from "../../util/formatDecimal";

function UserDutyDurationRow({ userId, username, startDate, endDate }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await http.get(`/users/${userId}/dutyStatistics`, {
                    params: {
                        startDate,
                        startTime: "00:00:00",
                        endDate,
                        endTime: "00:00:01",
                    },
                });
                setStats(data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userId, startDate, endDate]);

    if (loading)
        return (
            <tr>
                <td className="border border-black w-[5rem] bg-blue-50">{username}</td>
                <td className="border border-black">加载中...</td>
                <td className="border border-black">加载中...</td>
                <td className="border border-black">加载中...</td>
                <td className="border border-black">加载中...</td>
            </tr>
        );

    return (
        <tr className="hover:bg-slate-400">
            <td className="border border-black w-[5rem] bg-blue-50">{username}</td>
            <td className="border border-black text-center">
                {stats?.totalTime?.time !== 0 ? stats.totalTime.time.toFixed(2) : ""}
            </td>
            <td className="border border-black text-center">
                {stats?.totalTime?.dayShift !== 0 ? stats.totalTime.dayShift.toFixed(2) : ""}
            </td>
            <td className="border border-black text-center">
                {stats?.totalTime?.nightShift !== 0 ? stats.totalTime.nightShift.toFixed(2) : ""}
            </td>

            <td className="border border-black text-center"></td>
        </tr>
    );
}

export default function PersonDuration() {
    const { year, month } = useOutletContext();
    const { allDetailUsers, fetchAllDetailUsers } = useUserStore();

    useEffect(() => {
        fetchAllDetailUsers();
    }, [fetchAllDetailUsers]);

    const startDate = dayjs().year(year).month(month).date(1).format("YYYY-MM-DD");
    const endDate = dayjs()
        .year(year)
        .month(month + 1)
        .date(1)
        .format("YYYY-MM-DD");

    return (
        <div className="flex flex-row justify-start items-start text-center text-sm overflow-x-auto">
            <table className="w-full border-collapse text-nowrap">
                <thead>
                    <tr>
                        <th className="border border-black">姓名</th>
                        <th className="border border-black">总小时</th>
                        <th className="border border-black">白班小时</th>
                        <th className="border border-black">夜班小时 (0000-0800)</th>
                        <th className="border border-black">备注</th>
                    </tr>
                </thead>
                <tbody>
                    {allDetailUsers.map((user, index) => (
                        <UserDutyDurationRow
                            key={index}
                            userId={user.id}
                            username={user.username}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
