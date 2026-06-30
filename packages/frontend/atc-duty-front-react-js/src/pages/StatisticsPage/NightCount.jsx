import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useUserStore } from "../../store/user.store";
import { useStatisticsStore } from "../../store/statistics.store";
import { http } from "../../service/http";
import { useOutletContext } from "react-router-dom";
import { Tooltip } from "@radix-ui/themes";

function UserNightCountRow({ userId, username, selectedMonthDateArray, year, month }) {
    const [nightCount, setNightCount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNightCount = async () => {
            try {
                const data = await http.get(`/night-monthly/${userId}`, {
                    params: { year: year, month: month + 1 },
                });
                setLoading(false);
                // console.log(data);
                setNightCount(data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchNightCount();
    }, [userId, year, month]);

    if (loading)
        return (
            <tr>
                <td>{username}</td>
                <td colSpan={selectedMonthDateArray.length + 1}>加载中...</td>
            </tr>
        );

    return (
        <tr className="hover:bg-slate-400">
            <td className="border border-black w-20  bg-blue-50">{username}</td>
            {selectedMonthDateArray.map((x, index) => {
                return (
                    <td key={index} className="m-0 px-0 w-8 text-xs border border-black">
                        <Tooltip
                            content={nightCount?.[x]?.["具体考勤"]?.map((item, idx) => (
                                <div key={idx}>
                                    {item?.["position"]} {item?.["dutyType"]} {item?.["inTime"]} - {item?.["outTime"]}
                                </div>
                            ))}
                        >
                            <span className="text-center">
                                {(nightCount?.[x]?.["夜班段数"] || "") && `${nightCount?.[x]["夜班段数"]}段`}
                            </span>
                        </Tooltip>
                    </td>
                );
            })}

            <td className="m-0 px-0 border border-black">
                {nightCount?.["summary"]?.["夜班段数"]
                    ? parseInt(nightCount?.["summary"]?.["夜班段数"] || 0) + "段/"
                    : ""}
                {nightCount?.["summary"]?.["夜班段数"]
                    ? parseInt(nightCount?.["summary"]?.["夜班段数"] || 0) * 10 + "元"
                    : ""}
            </td>
        </tr>
    );
}

export default function NightCount() {
    const { year, month } = useOutletContext();
    const { allDetailUsers } = useUserStore();
    const [daysArray, setDaysArray] = useState([]);

    useEffect(() => {
        const daysInMonth = dayjs().year(year).month(month).daysInMonth();
        const newDaysArray = Array.from({ length: daysInMonth }, (_, index) => {
            return dayjs().year(year).month(month).startOf("month").add(index, "day").format("YYYY-MM-DD");
        });
        // console.log(newDaysArray);
        setDaysArray(newDaysArray);
    }, [year, month]);

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
                                {index + 1}
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
                                selectedMonthDateArray={daysArray}
                                year={year}
                                month={month}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
