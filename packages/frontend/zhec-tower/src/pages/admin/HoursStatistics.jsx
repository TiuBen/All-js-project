import React, { useState, useEffect } from "react";
import { Button } from "@radix-ui/themes";
import { usernames, server } from "../../lib/CONST";
import dayjs from "dayjs";

function HoursStatistics() {
    const [userData, setUserData] = useState({});

    const [startDate, setStartDate] = useState(dayjs().startOf("M").format("YYYY-MM-DD"));
    const [startTime, setStartTime] = useState("00:00");
    const [endDate, setEndDate] = useState(dayjs().endOf("M").format("YYYY-MM-DD"));
    const [endTime, setEndTime] = useState("23:59");
    const [isQueryButtonDisabled, setIsQueryButtonDisabled] = useState(false);
    const [dateArray, setDateArray] = useState([]);

    useEffect(() => {
        fetch(
            server +
                "/statistics?" +
                new URLSearchParams({
                    startDate: startDate,
                    startTime: startTime,
                    endDate: endDate,
                    endTime: endTime,
                })
        )
            .then((res) => res.json())
            .then((data) => {
                // console.log(data);
                setUserData(data);
                // const dutyTime="dutyTime";
                // const _data=;
                // const _t=data[0];
                // console.log(data[0]["巴富毅"]["dutyTime"]["2024-08-27"]["totalTime"]);
            })
            .catch((err) => console.log(err));

        return () => {
            setUserData({});
        };
    }, []);

    //
    useEffect(() => {
        console.log(dayjs(startDate).isBefore(dayjs(endDate)));
        // console.log(dayjs(startTime,"HH:mm"));
        // console.log(dayjs(endTime,"HH:mm"));
        console.log(dayjs(startTime, "HH:mm").isBefore(dayjs(endTime, "HH:mm")));
        if (dayjs(startDate).isBefore(dayjs(endDate)) && dayjs(endTime, "HH:mm").isAfter(dayjs(startTime, "HH:mm"))) {
            setIsQueryButtonDisabled(false);
        } else {
            setIsQueryButtonDisabled(true);
        }
        //
        const _dateArray = [];
        const _startDate = dayjs(startDate, "YYYY-MM-DD");
        const daysCount = dayjs(endDate, "YYYY-MM-DD").diff(_startDate, "day");
        console.log(daysCount);
        for (let index = 0; index < daysCount + 1; index++) {
            const _d = _startDate.add(index, "d").format("YYYY-MM-DD");
            _dateArray.push(_d);
        }
        setDateArray(_dateArray);
        console.log(_dateArray);
    }, [startDate, startTime, endDate, endTime]);

    return (
        <div className="relative m-[1rem] bg-white ">
            <div className="flex flex-row gap-2 items-center py-1  bg-white z-[800]">
                <label htmlFor="start-time-input">开始日期</label>
                <input
                    id="start-time-input"
                    type="date"
                    className="border border-black  rounded-md"
                    defaultValue={startDate}
                    onChange={(e) => {
                        setStartDate(e.target.value);
                        console.log(e.target.value);
                    }}
                />
                <input
                    id="start-time-input"
                    type="time"
                    className="border border-black  rounded-md"
                    defaultValue={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
                <label htmlFor="end-time-input">结束时间</label>
                <input
                    id="end-time-input"
                    type="date"
                    className="border border-black  rounded-md"
                    defaultValue={endDate}
                    onChange={(e) => {
                        setEndDate(e.target.value);
                    }}
                />
                <input
                    id="start-time-input"
                    type="time"
                    className="border border-black  rounded-md"
                    defaultValue={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
                <Button
                    disabled={isQueryButtonDisabled}
                    onClick={() => {
                        fetch(
                            server +
                                "/statistics?" +
                                new URLSearchParams({
                                    startDate: startDate,
                                    startTime: startTime,
                                    endDate: endDate,
                                    endTime: endTime,
                                })
                        )
                            .then((res) => res.json())
                            .then((data) => {
                                console.log(data);
                                setUserData(data);
                            })
                            .catch((err) => console.log(err));
                    }}
                >
                    查询
                </Button>
            </div>
            {/* <table id="hours-statistics-table" className="border-collapse border  w-[2000px] min-w-[900px] max-h-[400px] overflow-x-auto"> */}
            <table id="hours-statistics-table" className="border-collapse border  w-[2300px] ">
                <tbody className="z-20 text-center">
                    <tr className=" bg-white sticky top-0 z-[700]">
                        <td className="min-w-[4rem] p-1 text-center"></td>
                        {dateArray.map((x, index) => {
                            return (
                                <td key={index} className="text-center text-nowrap min-w-max px-1">
                                    {dayjs(x, "YYYY-MM-DD").format("D日")}
                                </td>
                            );
                        })}
                        <td>总/h</td>
                        <td className=" min-w-max px-1">
                            夜班h/ <span className="text-green-700 font-bold">次</span>
                        </td>
                    </tr>
                    {usernames.map((username, index) => (
                        <tr key={index} className="hover:bg-gray-100">
                            <td className=" px-1 text-center sticky left-0 z-[500] bg-white">{username}</td>
                            {dateArray.map((x, innerIndex) => {
                                if (userData[username]?.dutyTime?.[x]) {
                                    const { totalTime, nightTime, roleTime } = userData[username]?.dutyTime?.[x];

                                    return (
                                        <td className="text-left min-w-max px-2 text-nowrap" key={innerIndex}>
                                            <div>
                                                总{Math.round(totalTime.toFixed(2) * 10) / 10}=
                                                <span className="text-green-700 font-bold">
                                                    {(totalTime - nightTime)===0?<></>:`白${Math.round((totalTime - nightTime).toFixed(2) * 10) / 10}`}
                                                </span>
                                                <span className="text-green-700 font-bold">
                                                    {(totalTime - nightTime)!==0 && nightTime!==0?<>+</>:<></>}
                                                </span>
                                                <span className="text-green-700 font-bold">
                                                {nightTime===0?<></>:`夜${Math.round(nightTime.toFixed(2) * 10) / 10}`}
                                                    
                                                </span>
                                            </div>
                                            {roleTime === 0 ? (
                                                <></>
                                            ) : (
                                                <div>
                                                    学员/教员
                                                    <span className="text-green-700 font-bold">
                                                        {Math.round(roleTime.toFixed(2) * 10) / 10}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    );
                                    // }
                                }

                                return <td key={innerIndex}></td>;

                                // return <td key={innerIndex}>{ userData&& JSON.stringify( ["totalTime"] )} </td>;
                                // return <td key={innerIndex}>{x }  </td>;
                            })}
                            <td className="text-left text-nowrap px-2 font-bold">
                                {Math.round(userData[username]?.totalTime.toFixed(2) * 10) / 10}小时
                            </td>
                            <td className="text-left text-nowrap px-2 font-bold">
                                {Math.round(userData[username]?.totalNightTime.toFixed(2) * 10) / 10}小时/
                                <span className="text-green-700 font-bold">{userData[username]?.nightCount}次</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default HoursStatistics;
