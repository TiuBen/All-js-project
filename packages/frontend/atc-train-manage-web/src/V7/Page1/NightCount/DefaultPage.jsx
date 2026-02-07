import React, { useEffect, useState } from "react";
import { SERVER_URL, FETCHER } from "@utils";
import dayjs from "dayjs";
import styled from "styled-components";
import useSWR, { mutate } from "swr";
import { API_URL } from "../../../utils/const/Const";
import useStore from "../../../utils/store/userStore";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ContentSlider from "../../../../snComponents/snCarousel";
import { formatDecimal } from "../../../utils/tools/formatDecimal";
import { StepBack, StepForward } from "lucide-react";

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

function UserRow({ year, month, username, userId }) {
    const [dutyStatics, setDutyStatics] = useState({});
    // const [teachStatistics, setTeachStatistics] = useState({});
    const [nightsCount, setNightsCount] = useState({});
    const monthly = dayjs().set("year", year).set("month", month).set("date", 1).format("YYYY-MM");

    useEffect(() => {
        // append 可以添加多个相同名称的参数

        let q = new URLSearchParams();
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

        // fetch(`${API_URL.users}/${userId}/teachStatistics?${q}`, {
        //     method: "GET",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // })
        //     .then((res) => res.json())
        //     .then((data) => {
        //         setTeachStatistics(data);
        //     });

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
    }, [year, month, userId]);

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

                <td className="bg-blue-400 text-white">
                    {formatDecimal(
                        dutyStatics?.totalCommanderTime?.dayShift +
                            +dutyStatics?.totalPositionTime?.dayShift +
                            dutyStatics?.totalTeacherTime?.dayShift +
                            dutyStatics?.totalStudentTime?.dayShift +
                            dutyStatics?.totalCommanderTime?.nightShift +
                            dutyStatics?.totalPositionTime?.nightShift +
                            dutyStatics?.totalTeacherTime?.nightShift +
                            dutyStatics?.totalStudentTime?.nightShift +
                            dutyStatics?.totalAOCTime?.nightShift +
                            dutyStatics?.totalAOCTime?.dayShift
                    )}
                </td>
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
        <div className=" overflow-y-auto">
            <StyledLikeExcel>
                <thead className="text-center">
                    <tr className="text-center">
                        <th className="font-black text-lg" rowSpan={2}>姓名</th>
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
                        {/* <th>姓名</th> */}
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

function DefaultPage() {
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

                <MonthStatistics year={dayjs().get('year')} month={selectedYYYYMMDD.get("month")} usernames={users} />
            </div>
            {/* <h1 className="text-xl font-bold text-gray-700 text-center">2025年整体时间统计</h1>

            <div className=" flex flex-row  flex-nowrap   flex-1 overflow-auto justify-evenly items-center  gap-2 m-2 ">
                <button
                    className="text-blue-700 self-stretch border border-transparent rounded hover:text-blue-500 hover:border hover:border-blue-400 px-4 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={startIndex === 0}
                    onClick={handlePrev}
                >
                    <StepBack size={32} />
                </button>

                {visibleItems.map((item, index) => (
                    <div key={index}>
                        <MonthStatistics key={index} year={2025} month={item} usernames={users} />
                    </div>
                ))}

                <button
                    className="text-blue-700 self-stretch  border border-transparent rounded hover:text-blue-500 hover:border hover:border-blue-400 px-4 disabled:text-gray-500 disabled:cursor-not-allowed"
                    onClick={handleNext}
                    disabled={startIndex >= items.length - visibleCount}
                >
                    <StepForward size={32} />
                </button>
            </div> */}
        </div>
    );
}

export default DefaultPage;
