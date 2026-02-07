import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import styled from "styled-components";
import { API_URL,FETCHER } from "../../../utils/const/Const";
import useStore from "../../../utils/store/userStore";
import useSWR from "swr";

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

function UserNightCountByHourSlotRow({ userId, username, startDate, startTime, endDate, endTime }) {
    const YYYYMM = startDate.slice(0, 7);

    const q = new URLSearchParams({
        startDate,
        startTime,
        endDate,
        endTime,
    });

    const {
        data: userNightCount,
        error,
        isLoading,
    } = useSWR(userId ? `${API_URL.users}/${userId}/nightCount?${q}` : null, FETCHER, {
        revalidateOnFocus: false, // 切回页面时不强制刷新
        dedupingInterval: 60000*60, // 1分钟内相同key只请求一次
    });

    if (isLoading) return <div>加载中...</div>;
    if (error) return <div>加载失败</div>;

    return (
        <tr className="hover:bg-slate-400">
            <td>{username}</td>
            <td className="m-0 px-0">{userNightCount?.[username]?.[YYYYMM]?.["1800-2100次数"] || ""}</td>
            <td className="m-0 px-0">{userNightCount?.[username]?.[YYYYMM]?.["2100-2400次数"] || ""}</td>
            <td className="m-0 px-0">{userNightCount?.[username]?.[YYYYMM]?.["+1天0000-0830次数"] || ""}</td>

            <td className="m-0 px-0">{`${
                (userNightCount?.[username]?.[YYYYMM]?.["夜班次数"] || "") &&
                `${userNightCount[username][YYYYMM]["夜班次数"]}晚/`
            }          ${
                (userNightCount?.[username]?.[YYYYMM]?.["夜班段数"] || "") &&
                `${userNightCount[username][YYYYMM]["夜班段数"]}次`
            }`}</td>
            <td className="m-0 px-0">
                {userNightCount?.[username]?.[YYYYMM]?.["夜班段数"]
                    ? parseInt(userNightCount?.[username]?.[YYYYMM]?.["夜班段数"] || 0) * 10
                    : ""}
            </td>
        </tr>
    );
}

function NightCountByHourSlot() {
    const { users } = useStore();
    const [selectedYYYYMMDD, setSelectedYYYYMMDD] = useState(dayjs().set("date", 1));

    return (
        <div className=" flex-1 flex flex-col  overflow-auto relative items-stretch px-4">
            <div className="relative  flex flex-col gap-1 text-wrap   ">
                <div className="w-full flex  ">
                    {["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"].map(
                        (x, index) => {
                            return (
                                <div
                                    key={index}
                                    className={`flex-1 border border-black text-center rounded-t-lg hover:font-bold hover:cursor-pointer ${
                                        index === dayjs(selectedYYYYMMDD).get("month")
                                            ? " bg-inherit font-extrabold text-blue-600 "
                                            : " bg-slate-200"
                                    }`}
                                    onClick={() => {
                                        setSelectedYYYYMMDD(dayjs().month(index).date(1));
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
                                <th>
                                    总段数 <br></br>(18:00-次日08:30)
                                </th>
                                <th>补贴元</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((x, index) => {
                                return (
                                    <UserNightCountByHourSlotRow
                                        key={index}
                                        userId={x.id}
                                        username={x.username}
                                        startDate={dayjs(selectedYYYYMMDD).set("date", 1).format("YYYY-MM-DD")}
                                        startTime={"00:00:00"}
                                        endDate={dayjs(selectedYYYYMMDD).add(1, "month").format("YYYY-MM-DD")}
                                        endTime={"00:00:01"}
                                    />
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

// const currentMonthIndex = dayjs(selectedMonth).month();
// useEffect(() => {
//     const q = new URLSearchParams();
//     q.append("startDate", dayjs(selectedMonth).format("YYYY-MM-DD"));
//     q.append("startTime", "00:00");
//     q.append("endDate", dayjs(selectedMonth).add(1, "M").format("YYYY-MM-DD"));
//     q.append("endTime", "00:01");
//     q.append("type","byHourSlot");

//     fetch(`${API_URL.users}/nightCount?${q}`)
//         .then((res) => res.json())
//         .then((data) => {
//             console.log(data?.nightShiftData);
//             const bySlot = formate(selectedMonth, data?.nightShiftData);
//             setNightShiftData(bySlot);

//             // console.log(formate(selectedMonth, data?.nightShiftData));
//         });
// }, [selectedMonth]);
// 监听月份变化，更新天数数组
//   useEffect(() => {
//     // console.log(selectedMonth);
//     let daysInMonth = dayjs(selectedMonth).daysInMonth();
//     // console.log(daysInMonth);

//     const newDaysArray = Array.from({ length: daysInMonth }, (_, index) => {
//         return dayjs(selectedMonth).startOf("month").add(index, "day").format("YYYY-MM-DD");
//     });
//     setDaysArray(newDaysArray);
// }, [selectedMonth]);
// const [userNightCount, setUserNightCount] = useState({});
// const [YYYYMM, setYYYYMM] = useState(startDate.slice(0, 7));

// useEffect(() => {
//     const q = new URLSearchParams();
//     q.append("startDate", startDate);
//     q.append("startTime", startTime);
//     q.append("endDate", endDate);
//     q.append("endTime", endTime);

//     fetch(`${API_URL.users}/${userId}/nightCount?${q}`)
//         .then((res) => res.json())
//         .then((data) => {
//             console.log(data);
//             setUserNightCount(data);
//         });

//     setYYYYMM(startDate.slice(0, 7));
// }, [userId, startDate, startTime, endDate, endTime]);
