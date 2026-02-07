import React, { useEffect, useState } from "react";
import { SERVER_URL, FETCHER } from "@utils";
import dayjs from "dayjs";
import styled from "styled-components";
import useSWR, { mutate } from "swr";
import { API_URL } from "../../../utils/const/Const";
import useStore from "../../../utils/store/userStore";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const StyledLikeExcel = styled.table`
    width: 100%;
    border-collapse: collapse;
    text-wrap: nowrap;
    font-size: 0.8rem;
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
    tbody > tr {
        &:hover {
            background-color: #e0e0e0;
        }
    }
`;

/**
 * 格式化数值：保留2位小数，若无有效值则返回0
 * @param {number|null|undefined} value - 输入值
 * @returns {number} 格式化后的值（或0）
 */
function formatDecimal(value) {
    // 检查是否为有效数字（非 null/undefined/NaN，且不为 0）
    if (value === null || value === undefined || isNaN(value)) {
        return 0;
    }

    // 四舍五入到2位小数，并避免 -0 的情况
    const rounded = Math.round(value * 100) / 100;
    return rounded === 0 ? "" : rounded; // 明确返回 0（而非 -0）
}

function UserRow({ month, username }) {
    const [dutyStatics, setDutyStatics] = useState([]);

    useEffect(() => {
        // append 可以添加多个相同名称的参数

        let q = new URLSearchParams();
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
        q.append("calculate", true);

        fetch(`${API_URL.duty}?${q}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setDutyStatics(data);
            });
    }, [month, username]);

    return (
        <>
            <tr>
                <td>{username}</td>
                <td>{formatDecimal(dutyStatics?.totalCommanderTime?.dayShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalPositionTime?.dayShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalTeacherTime?.dayShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalStudentTime?.dayShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalCommanderTime?.nightShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalPositionTime?.nightShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalTeacherTime?.nightShift)}</td>
                <td>{formatDecimal(dutyStatics?.totalStudentTime?.nightShift)}</td>
                <td>
                    {formatDecimal(dutyStatics?.totalAOCTime?.nightShift) +
                        formatDecimal(dutyStatics?.totalAOCTime?.dayShift)}
                </td>

                <td>
                    {Math.floor(
                        (dutyStatics?.totalCommanderTime?.dayShift +
                            +dutyStatics?.totalPositionTime?.dayShift +
                            dutyStatics?.totalTeacherTime?.dayShift +
                            dutyStatics?.totalStudentTime?.dayShift +
                            dutyStatics?.totalCommanderTime?.nightShift +
                            dutyStatics?.totalPositionTime?.nightShift +
                            dutyStatics?.totalTeacherTime?.nightShift +
                            dutyStatics?.totalStudentTime?.nightShift +
                            dutyStatics?.totalAOCTime?.nightShift +
                            dutyStatics?.totalAOCTime?.dayShift) *
                            100
                    ) / 100}
                </td>
            </tr>
        </>
    );
}

function MonthStatistics({ month, usernames }) {
    return (
        <div className=" px-2 rounded-lg ">
            <StyledLikeExcel>
                <thead className="text-center">
                    <tr className="text-center">
                        <th className="bg-blue-600 text-white">{month + 1}月</th>
                        <th colSpan={4}>白班</th>
                        <th colSpan={4}>夜班</th>
                        <th colSpan={1}>现场</th>
                        <th colSpan={1}>总小时数</th>
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
                        <th>调度</th>
                    </tr>
                </thead>
                <tbody>
                    {usernames.map((item, index) => {
                        // return <div key={index}>{JSON.stringify(item)}</div>
                        return <UserRow key={index} month={month} username={item.username} />;
                    })}
                </tbody>
            </StyledLikeExcel>
        </div>
    );
}

function DefaultPage() {
    const length = dayjs().month() + 1;
    const { users } = useStore();

    return (
        <div className=" flex-1 flex flex-col  overflow-auto relative items-center  ">
            <h1 className="text-xl font-bold text-blue-700 text-center">2025年整体时间统计</h1>

            <Carousel className="w-[92%]   m-auto">
                <CarouselContent className="ml-1">
                    {Array.from({ length: length }).map((_, index) => (
                        <CarouselItem key={index} className="pl-1 m-auto max-xl:w-full xl:basis-1/3">
                            <div className="p-1">
                                <MonthStatistics key={index} month={index} usernames={users} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    );
}

export default DefaultPage;
