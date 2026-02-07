import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import styled from "styled-components";
import { API_URL, FETCHER } from "../../../utils/const/Const";
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

function UserNightCountBySelectedMonthDateRow({
    userId,
    username,
    startDate,
    startTime,
    endDate,
    endTime,
    selectedMonthDateArray,
}) {
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
        dedupingInterval: 60000 * 60, // 1分钟内相同key只请求一次
    });

    if (isLoading) return <div>加载中...</div>;
    if (error) return <div>加载失败</div>;

    return (
        <tr className="hover:bg-slate-400">
            <td>{username}</td>
            {selectedMonthDateArray.map((date, index) => {
                const dateAsKey = date.format("YYYY-MM-DD");
                return (
                    <td key={index} className="m-0 px-0 w-[2rem] text-xs">
                        {(userNightCount?.[username]?.[dateAsKey]?.["夜班段数"] || "") &&
                            `${userNightCount[username][dateAsKey]["夜班段数"]}段`}
                    </td>
                );
            })}

            <td className="m-0 px-0">
                {userNightCount?.[username]?.[YYYYMM]?.["夜班段数"]
                    ? parseInt(userNightCount?.[username]?.[YYYYMM]?.["夜班段数"] || 0) + "段/"
                    : ""}
                {userNightCount?.[username]?.[YYYYMM]?.["夜班段数"]
                    ? parseInt(userNightCount?.[username]?.[YYYYMM]?.["夜班段数"] || 0) * 10+"元"
                    : ""}
            </td>
        </tr>
    );
}

function NightCountByMonth() {
    const { users } = useStore();
    const [selectedYYYYMMDD, setSelectedYYYYMMDD] = useState(dayjs().set("date", 1));
    const [daysArray, setDaysArray] = useState([]);

    // 监听月份变化，更新天数数组
    useEffect(() => {
        let daysInMonth = selectedYYYYMMDD.daysInMonth();
        const newDaysArray = Array.from({ length: daysInMonth }, (_, index) => {
            return selectedYYYYMMDD.startOf("month").add(index, "day");
        });
        setDaysArray(newDaysArray);
    }, [selectedYYYYMMDD]);

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
                                {daysArray.map((date, index) => (
                                    <th key={index}>{date.format("D")}</th>
                                ))}
                                <th>总次数/补贴</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((x, index) => {
                                return (
                                    <UserNightCountBySelectedMonthDateRow
                                        key={index}
                                        userId={x.id}
                                        username={x.username}
                                        startDate={dayjs(selectedYYYYMMDD).set("date", 1).format("YYYY-MM-DD")}
                                        startTime={"00:00:00"}
                                        endDate={dayjs(selectedYYYYMMDD).add(1, "month").format("YYYY-MM-DD")}
                                        endTime={"00:00:01"}
                                        selectedMonthDateArray={daysArray}
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

export default NightCountByMonth;
// {daysArray.map((y, i) => {
//     const date = dayjs()
//         .set("month", selectedMonth)
//         .set("date", i + 1)
//         .format("YYYY-MM-DD");
//     // console.log(date);
//     console.log(x.username);

//     console.log(nightShiftData[x.username]);

//     return (
//         <td key={i} className="m-0 px-0">
//             {/* {nightShiftData[x.username]?.[y]?.["夜班次数"] &&
//                 nightShiftData[x.username]?.[y]?.["夜班次数"]} */}

//             {nightShiftData[x.username]?.[y]?.["夜班次数"] === 0
//                 ? ""
//                 : nightShiftData[x.username]?.[y]?.["夜班段数"]}

//             {nightShiftData[x.username]?.[y]?.["夜班次数"] !== undefined &&
//             nightShiftData[x.username]?.[y]?.["夜班次数"] !== 0
//                 ? "段"
//                 : ""}
//             {/* {JSON.stringify(
//                     nightShiftData[x.username]?.[date]?.["夜班次数"]
//                 )} */}
//         </td>
//     );
// })}
// <td className="m-0 px-0">
//     {nightShiftData[x.username] &&
//         (() => {
//             const t = { totalShifts: 0, totalAmount: 0 };

//             for (const [key, value] of Object.entries(
//                 nightShiftData[x.username]
//             )) {
//                 if (
//                     dayjs(key, "YYYYY-MM-DD").format("YYYY-MM") ===
//                     selectedMonth
//                 ) {
//                     console.log(key);
//                     console.log(value);

//                     if (value["夜班次数"] >= 0.01) {
//                         t.totalShifts += value["夜班次数"];
//                     }
//                     if (value["夜班段数"] >= 0.01) {
//                         t.totalAmount += value["夜班段数"];
//                     }
//                 }
//             }

//             return `${t.totalShifts}晚/${t.totalAmount}段`;
//         })()}
// </td>

// let date = 0;
// return (
//     <tr key={index}>
//         <td>{x.username}</td>
//         {Array(dayjs().daysInMonth())
//             .fill(
//                 dayjs()
//                     .set("month", selectedMonth)
//                     .set("date", index + 1)
//                     .format("YYYY-MM-DD")
//             )
//             .map((x, index) => {
//                 return <td key={index}>{x}</td>;
//             })}
//     </tr>
// );
