import React, { useEffect, useState } from "react";
import { SERVER_URL, FETCHER } from "@utils";
import dayjs from "dayjs";
import styled from "styled-components";
import useSWR, { mutate } from "swr";
import { API_URL } from "../../utils/const/Const";
import useStore from "../../utils/store/userStore";
import { formatDecimal } from "../../utils/tools/formatDecimal";

const StyledLikeExcel = styled.table`
    width: 100%;
    height: 100%;
    background-color: white;
    border-collapse: collapse;
    text-wrap: nowrap;
    font-size: 0.75rem !important;
    line-height: 1rem;
    border: 1px solid black;
    td,
    th {
        border: 1px solid black;
        padding-left: 0.2rem;
        padding-right: 0.2rem;
    }
    tr {
        border: 1px solid black;
    }
`;

// tbody > tr {
//     &:hover {
//         background-color: #e0e0e0;
//     }
// }

function UserRow({ year, month, username, userId }) {
    const [dutyStatics, setDutyStatics] = useState({});
    const [nightsCount, setNightsCount] = useState({});
    const monthly = dayjs().set("year", year).set("month", month).set("date", 1).format("YYYY-MM");

    useEffect(() => {
        // append 可以添加多个相同名称的参数

        let q = new URLSearchParams();
        q.append("username", username);
        // Append startDate and startTime
        q.append("startDate", dayjs().set("year", year).set("month", month).set("date", 1).format("YYYY-MM-DD"));
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
        q.append("calculate", true);

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


        fetch(`${API_URL.users}/${userId}/nightCount?${q}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setNightsCount(data);
            });
    }, [year, month, username]);

    return (
        <>
            <tr
                onClick={() => {
                    useStore.setState({
                        selectedUser: {
                            username: username,
                            userId: userId,
                        },
                        selectedUserNightCount: { ...nightsCount },
                    });
                }}
                className={`${
                    useStore.getState().selectedUser?.username === username
                        ? "bg-blue-600 text-white  hover:bg-blue-600 hover:text-white "
                        : "hover:bg-blue-200"
                }`}
            >
                {/* //! 姓名 */}
                <td>{username}</td>
                {/* 白天 */}
                <td>{formatDecimal(dutyStatics?.totalCommanderTime?.dayShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalPositionTime?.dayShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalTeacherTime?.dayShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalStudentTime?.dayShift)}</td>
                {/* 夜晚 */}
                <td>{formatDecimal(dutyStatics?.totalCommanderTime?.nightShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalPositionTime?.nightShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalTeacherTime?.nightShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalStudentTime?.nightShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalAOCTime?.nightShift + dutyStatics?.totalAOCTime?.dayShift)}</td>

                <td className="bg-blue-400 text-white">{formatDecimal(dutyStatics?.totalTime?.time)}</td>
                <td>
                    {(nightsCount?.[username]?.[monthly]?.["夜班段数"] || 0) > 0
                        ? `${nightsCount?.[username]?.[monthly]?.["夜班段数"]}段`
                        : ""}
                </td>
            </tr>
        </>
    );
}

function MonthStatistics({ year, month }) {
    const { users } = useStore();
    return (
        <div className="w-[470px] overflow-y-auto">
            <StyledLikeExcel>
                <thead className="text-center">
                    <tr className="text-center">
                        <th className="bg-blue-400 text-white">{month + 1}月</th>
                        <th colSpan={4}>白班</th>
                        <th colSpan={4}>夜班</th>
                        <th rowSpan={2}>
                            现场
                            <br />
                            调度
                        </th>
                        <th rowSpan={2}>
                            总小
                            <br />
                            时数
                        </th>
                        <th rowSpan={2}>
                            夜班
                            <br />
                            段数
                        </th>
                    </tr>
                    <tr>
                        <th>姓名</th>
                        <th>带班</th>
                        <th>席位</th>
                        <th>教员</th>
                        <th>学员</th>
                        <th>带班</th>
                        <th>席位</th>
                        <th>教员</th>
                        <th>学员</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((item, index) => {
                        return (
                            <UserRow key={index} year={year} month={month} username={item.username} userId={item.id} />
                        );
                    })}
                </tbody>
            </StyledLikeExcel>
        </div>
    );
}

export default MonthStatistics;
