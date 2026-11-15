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

function UserRow({ year, month, username, userId, nightsCount }) {
    const [dutyStatics, setDutyStatics] = useState({});

    useEffect(() => {
        // append 可以添加多个相同名称的参数

        let q = new URLSearchParams();
        q.append("userId", userId);
        q.append("year", year);
        q.append("month", month);

        fetch(`${API_URL.Base}/api/statistics/duty-duration?${q}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setDutyStatics(data);
            });
    }, [year, month, userId]);

    return (
        <>
            <tr
                onClick={() => {
                    console.log("click user row");
                    useStore.setState({
                        selectedUser: {
                            username: username,
                            userId: userId,
                        },
                        // selectedUserNightCount: { ...nightsCount },
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
                <td>{dutyStatics?.totalCommanderTime?.dayShift || ""}</td>
                <td>{dutyStatics?.positionTime?.dayShift || ""}</td>
                <td>{dutyStatics?.teacherTime?.dayShift || ""}</td>
                <td>{dutyStatics?.traineeTime?.dayShift || ""}</td>
                {/* 夜晚 */}
                <td>{dutyStatics?.totalCommanderTime?.nightShift || ""}</td>
                <td>{dutyStatics?.positionTime?.nightShift || ""}</td>
                <td>{dutyStatics?.teacherTime?.nightShift || ""}</td>
                <td>{dutyStatics?.traineeTime?.nightShift || ""}</td>
                <td>{dutyStatics?.totalDDTime?.time || ""}</td>

                <td className="bg-blue-400 text-white">{dutyStatics?.totalTime?.time}</td>
                <td>{nightsCount?.["summary"]?.["夜班段数"] || ""}</td>
            </tr>
        </>
    );
}

function MonthStatistics({ year, month }) {
    const { users } = useStore();
    const [nightsCount, setNightsCount] = useState({});
    useEffect(() => {
        // append 可以添加多个相同名称的参数

        let q = new URLSearchParams();
        q.append("year", year);
        q.append("month", month);

        fetch(`${API_URL.Base}/api/statistics/night-count?${q}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setNightsCount(data);
            });
    }, [year, month]);

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
                            <UserRow
                                key={index}
                                year={year}
                                month={month}
                                username={item.username}
                                userId={item.id}
                                nightsCount={nightsCount[item.id]}
                            />
                        );
                    })}
                </tbody>
            </StyledLikeExcel>
        </div>
    );
}

export default MonthStatistics;
