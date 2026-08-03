import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useUserStore } from "../../store/user.store";
import { http } from "../../service/http";
import { useAppStore } from "@/store/app.store";

function UserDutyDurationRow({ userId, username, startDate, endDate, year, month }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await http.get(`/statistics/duty-duration`, {
                    params: {
                        // startDate,
                        // startTime: "00:00:00",
                        // endDate,
                        // endTime: "00:00:01",
                        userId,
                        year,
                        month,
                    },
                });
                console.log(data);
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
                <td className="border border-black w-[5rem] bg-blue-50 px-4">{username}</td>
                <td className="border border-black px-4">加载中...</td>
                <td className="border border-black px-4">加载中...</td>
                <td className="border border-black px-4">加载中...</td>
                <td className="border border-black px-4">加载中...</td>
                <td className="border border-black px-4">加载中...</td>
            </tr>
        );

    return (
        <tr className="hover:bg-slate-400">
            <td className="border border-black w-[5rem] bg-blue-50  px-4">{username}</td>
            <td className="border border-black text-center  px-4">
                {stats?.totalCommanderTime?.dayShift !== 0 ? stats.totalCommanderTime?.dayShift?.toFixed(2) : ""}
            </td>
            <td className="border border-black text-center  px-4">
                {stats?.positionTime?.dayShift !== 0 ? stats.positionTime?.dayShift?.toFixed(2) : ""}
            </td>
            <td className="border border-black text-center  px-4">
                {stats?.teacherTime?.dayShift !== 0 ? stats.teacherTime?.dayShift?.toFixed(2) : ""}
            </td>
            <td className="border border-black text-center  px-4">
                {stats?.totalCommanderTime?.nightShift !== 0 ? stats.totalCommanderTime?.nightShift?.toFixed(2) : ""}
            </td>
            <td className="border border-black text-center  px-4">
                {stats?.positionTime?.nightShift !== 0 ? stats.positionTime?.nightShift?.toFixed(2) : ""}
            </td>
            <td className="border border-black text-center  px-4">
                {stats?.teacherTime?.nightShift !== 0 ? stats.teacherTime?.nightShift?.toFixed(2) : ""}
            </td>
            <td className="border border-black text-center  px-4">
                {stats?.totalPositionTime?.time !== 0 ? stats.totalPositionTime?.time?.toFixed(2) : ""}
            </td>
            <td className="border border-black text-center  px-4">
                {stats?.totalDDTime?.time !== 0 ? stats.totalDDTime?.time?.toFixed(2) : ""}
            </td>
        </tr>
    );
}

export default function PersonDuration() {
    const { selectedYear, selectedMonth } = useAppStore();
    const { allDetailUsers, fetchAllDetailUsers } = useUserStore();

    useEffect(() => {
        fetchAllDetailUsers();
    }, [fetchAllDetailUsers]);

    const startDate = dayjs().year(selectedYear).month(selectedMonth).date(1).format("YYYY-MM-DD");
    const endDate = dayjs()
        .year(selectedYear)
        .month(selectedMonth + 1)
        .date(1)
        .format("YYYY-MM-DD");

    return (
        <div className="flex flex-row justify-start items-start text-center text-sm overflow-x-auto">
            <table className="w-auto border-collapse text-nowrap">
                <thead>
                    <tr>
                        <th className="border border-black px-4"></th>
                        <th className="border border-black px-4 " colSpan={3}>
                            白班
                        </th>
                        <th className="border border-black px-4" colSpan={3}>
                            夜班
                        </th>
                        <th className="border border-black px-4" rowSpan={2}>
                            管制总小时数
                        </th>
                        <th className="border border-black px-4" rowSpan={2}>
                            调度席
                        </th>
                    </tr>
                    <tr>
                        <th className="border border-black px-4">姓名</th>
                        <th className="border border-black px-4">带班</th>
                        <th className="border border-black px-4">席位</th>
                        <th className="border border-black px-4">教员</th>
                        <th className="border border-black px-4">带班</th>
                        <th className="border border-black px-4">席位</th>
                        <th className="border border-black px-4">教员</th>
                    </tr>
                </thead>
                <tbody>
                    {allDetailUsers.map((user, index) => (
                        <UserDutyDurationRow
                            key={index}
                            userId={user.id}
                            username={user.username}
                            year={selectedYear}
                            month={selectedMonth}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
