import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import styled from "styled-components";
import { API_URL } from "../../../utils/const/Const";
import useStore from "../../../utils/store/userStore";

const StyledLikeExcel = styled.table`
    width: 100%;
    border-collapse: collapse;
    text-wrap: nowrap;

    td {
        border: 1px solid black;

        &:hover {
            background-color: #e0e0e0;
        }
    }

    th {
        border: 1px solid black;
    }
`;

function formate() {}

function NightCountByHourSlot() {
    const length = dayjs().month() + 1;
    const { users } = useStore();
    const [nightShiftData, setNightShiftData] = useState({});

    const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
    const [daysArray, setDaysArray] = useState([]);

    const currentMonthIndex = dayjs(selectedMonth).month();
    useEffect(() => {
        const q = new URLSearchParams();
        q.append("startDate", dayjs(selectedMonth).format("YYYY-MM-DD"));
        q.append("startTime", "00:00");
        q.append("endDate", dayjs(selectedMonth).add(1, "M").format("YYYY-MM-DD"));
        q.append("endTime", "00:01");
        // console.log(dayjs(selectedMonth).format("YYYY-MM-DD"));
        // console.log(dayjs(selectedMonth).add(1, "M").format("YYYY-MM-DD"));

        fetch(`${API_URL.users}/nights?${q}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data?.nightShiftData);
                const bySlot = formate(selectedMonth, data?.nightShiftData);
                setNightShiftData(bySlot);

                // console.log(formate(selectedMonth, data?.nightShiftData));
            });
    }, [selectedMonth]);

    // 监听月份变化，更新天数数组
    useEffect(() => {
        // console.log(selectedMonth);
        let daysInMonth = dayjs(selectedMonth).daysInMonth();
        // console.log(daysInMonth);

        const newDaysArray = Array.from({ length: daysInMonth }, (_, index) => {
            return dayjs(selectedMonth).startOf("month").add(index, "day").format("YYYY-MM-DD");
        });
        setDaysArray(newDaysArray);
    }, [selectedMonth]);

    //  XXXX: {
    //     "2025-05-01": {
    //         "1800-2100": 0,
    //         "2100-2400": 0,
    //         "+1天0000-0830": 0,
    //         "夜班次数": 0,
    //         "夜班档位": 0
    //     },
    //     "2025-05-02": {
    //         "1800-2100": 1.0008333333333332,
    //         "2100-2400": 2.158611111111111,
    //         "+1天0000-0830": 0,
    //         "夜班次数": 1,
    //         "夜班档位": 2
    //     }
    // }

    function formate(month, nightShiftData) {
        let bySlot = {};
        for (const [username, values] of Object.entries(nightShiftData)) {
            if (!bySlot[username]) {
                bySlot[username] = {
                    // "2025-01": {
                    //     "1800-2100": 0,
                    //     "2100-2400": 0,
                    //     "+1天0000-0830": 0,
                    // },
                };
                bySlot[username][month] = {
                    "1800-2100": 0,
                    "2100-2400": 0,
                    "+1天0000-0830": 0,
                };
            }

            for (const [key, x] of Object.entries(values)) {
                if (dayjs(key, "YYYYY-MM-DD").format("YYYY-MM") === month) {
                    if (x["1800-2100"] >= 0.01) {
                        bySlot[username][month]["1800-2100"] += 1;
                    }
                    if (x["2100-2400"] >= 0.01) {
                        bySlot[username][month]["2100-2400"] += 1;
                    }
                    if (x["+1天0000-0830"] >= 0.01) {
                        bySlot[username][month]["+1天0000-0830"] += 1;
                    }
                } else {
                    console.log(username);
                    console.log(values);

                    console.log(key);
                    console.log(x);
                }
            }
        }
        return bySlot;
    }

    return (
        <div className=" flex-1 flex flex-col  overflow-auto relative items-stretch ">
            <h1 className="text-xl font-bold text-blue-700 text-center">2025年夜班次数统计</h1>
            <div className="relative  flex flex-col gap-1 text-wrap  m-2  ">
                <div className="w-full flex  ">
                    {["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"].map(
                        (x, index) => {
                            const monthIndex = index; // 0-11
                            return (
                                <div
                                    key={index}
                                    className={`flex-1 border border-black text-center rounded-t-lg hover:font-bold ${
                                        index === currentMonthIndex ? " bg-inherit font-extrabold  " : "bg-slate-200"
                                    }`}
                                    onClick={() => {
                                        const newDate = dayjs(selectedMonth).month(index).format("YYYY-MM");
                                        setSelectedMonth(newDate);
                                    }}
                                >
                                    {x}
                                </div>
                            );
                        }
                    )}
                </div>
                <div className="flex flex-row justify-start items-start text-center text-sm ">
                    <StyledLikeExcel>
                        <thead>
                            <tr>
                                <th>姓名</th>
                                <th> 18:00-21:00</th>
                                <th> 21:00-24:00</th>
                                <th> +1天00:00-08:30</th>
                                <th> 18点-次日次数</th>
                                <th>总次数/补贴</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((x, index) => {
                                return (
                                    <tr key={index} className="hover:bg-slate-400">
                                        <td>{x.username}</td>

                                        <td className="m-0 px-0">
                                            {nightShiftData?.[x.username]?.[selectedMonth]?.["1800-2100"] === 0
                                                ? ""
                                                : nightShiftData?.[x.username]?.[selectedMonth]?.["1800-2100"]}
                                        </td>
                                        <td className="m-0 px-0">
                                            {nightShiftData?.[x.username]?.[selectedMonth]?.["2100-2400"] === 0
                                                ? ""
                                                : nightShiftData?.[x.username]?.[selectedMonth]?.["2100-2400"]}
                                        </td>
                                        <td className="m-0 px-0">
                                            {nightShiftData?.[x.username]?.[selectedMonth]?.["+1天0000-0830"] === 0
                                                ? ""
                                                : nightShiftData?.[x.username]?.[selectedMonth]?.["+1天0000-0830"]}
                                        </td>
                                        <td className="m-0 px-0"></td>
                                        <td className="m-0 px-0">
                                            {nightShiftData?.[x.username]?.[selectedMonth]?.["1800-2100"] +
                                                nightShiftData?.[x.username]?.[selectedMonth]?.["2100-2400"] +
                                                nightShiftData?.[x.username]?.[selectedMonth]?.["+1天0000-0830"] ===
                                            0
                                                ? ""
                                                : nightShiftData?.[x.username]?.[selectedMonth]?.["1800-2100"] +
                                                  nightShiftData?.[x.username]?.[selectedMonth]?.["2100-2400"] +
                                                  nightShiftData?.[x.username]?.[selectedMonth]?.["+1天0000-0830"]}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </StyledLikeExcel>
                </div>
            </div>
        </div>
    );
}

export default NightCountByHourSlot;
