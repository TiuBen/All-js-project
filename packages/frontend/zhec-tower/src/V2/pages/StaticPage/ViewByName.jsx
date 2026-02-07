import React, { useState, useEffect } from "react";
import { useOnDutyUser } from "../../hooks/index";
import DateTimeRangeSelector from "./Component/DateTimeRangeSelector";
import PositionSelector from "./Component/PositionSelector";
import UserNameSelector from "./Component/UserNameSelector";
import { ChevronDown, RefreshCcw } from "lucide-react";
import dayjs, { locale } from "dayjs";
import { Positions } from "../../../lib/CONST";

function ViewByName() {
    const avatarUrl = "https://randomuser.me/api/portraits/men/1.jpg";
    const durations = [
        { label: "席位总时长", value: "2 hours ago" },
        { label: "主班时长", value: "3 weeks ago" },
        { label: "副班时长", value: "1 year, 2 months" },
        { label: "领班时长", value: "5 days ago" },
        { label: "教员/见习时长", value: "12 hours" },
    ];

    const [userDutyData, setUserDutyData] = useState([]);

    const { getDataByUser, singleUserOnDutyData } = useOnDutyUser();

    // useEffect(() => {
    //   // Fetch data from the API
    //   fetch("https://api.example.com/user/" + username)
    //     .then((response) => response.json())
    //     .then((data) => {
    //       // Update the state with the fetched data
    //       setUsername(data.username);
    //       setAvatarUrl(data.avatarUrl);
    //       setDurations(data.durations);
    //     })
    // })

    const [dateRange, setDateRange] = useState({
        startDate: dayjs().startOf("M").format("YYYY-MM-DD"),
        startTime: "00:00",
        endDate: dayjs().add(1, "M").startOf("M").format("YYYY-MM-DD"),
        endTime: "00:00",
    });
    const [positions, setPositions] = useState(Positions);
    const [roleType, setRoleType] = useState(["主班", "副班", "教员", "见习", "领班"]);
    const [username, setUsername] = useState("沈宁");

    const [needRefresh, setNeedRefresh] = useState(false);

    // useEffect that triggers whenever any of the state variables change
    useEffect(() => {
        // This function will run whenever dateRange, positions, roleType, or username changes
        // setNeedRefresh(true);
    }, [dateRange, positions, roleType, username]); // Dependencies array

    useEffect(() => {
        if (singleUserOnDutyData.length > 0) {
            setUserDutyData(singleUserOnDutyData);
        }


    }, [singleUserOnDutyData]);

    return (
        <div className="flex flex-col items-start justify-start gap-2">
            <DateTimeRangeSelector
                startDate={dateRange.startDate}
                startTime={dateRange.startTime}
                endDate={dateRange.endDate}
                endTime={dateRange.endTime}
                setDateRange={setDateRange}
            />
            <PositionSelector
                positions={positions}
                setPositions={setPositions}
                roleType={roleType}
                setRoleType={setRoleType}
            />
            <UserNameSelector username={username} setUsername={setUsername} />
            <div className="max-w-md  px-6 bg-white rounded-lg shadow-lg flex self-start items-start space-x-6 font-semibold text-blue-700">
                {/* Avatar and Username Section */}
                <div className="flex-shrink-0">
                    <img
                        className="w-16 h-16 rounded-full border-2 border-blue-500"
                        src={avatarUrl}
                        alt="User Avatar"
                    />
                </div>
                <div className="flex-1 gap-2">
                    <h2 className="text-xl font-semibold ">{username}</h2>
                    <ul className=" ">
                        {durations.map((duration, index) => (
                            <li key={index} className="flex items-center space-x-2">
                                <span className="text-gray-600">{duration.label}:</span>
                                <span className="">{duration.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <table className="border-collapse border border-gray-300 mx-1 text-nowrap">
                <tbody>
                    <tr className="bg-gray-200 border">
                        <td className="border border-slate-300 px-2">序号</td>
                        <td className="border border-slate-300 px-2">时长</td>
                        <td className="border border-slate-300 px-2">数据ID</td>
                        <td className="border border-slate-300 px-2">姓名</td>
                        <td className="border border-slate-300 px-2">席位</td>
                        <td className="border border-slate-300 px-2">主副班</td>
                        <td className="border border-slate-300 px-2">开始时间</td>
                        <td className="border border-slate-300 px-2">结束时间</td>
                        <td className="border border-slate-300 px-2">教员/学员</td>
                        <td className="border border-slate-300 px-2">相关教员/学员数据ID</td>
                        <td className="border border-slate-300 px-2">教员/学员开始时间</td>
                        <td className="border border-slate-300 px-2">教员/学员结束时间</td>
                        <td className="border border-slate-300 px-2">教员/学员时长</td>
                        <td className="border border-slate-300 px-2">状态</td>
                        <td className="border border-slate-300 px-2">相关岗前准备数据ID</td>
                    </tr>
                    {singleUserOnDutyData.map((item, index) => {
                        return (
                            <tr key={index}>
                                <td className="border border-slate-300 px-2">{index + 1}</td>
                                 <td className="border border-slate-300 px-2  font-semibold text-blue-700 ">
                                    {dayjs(item.outTime).diff(dayjs(item.inTime), "hour", true).toFixed(2)}h
                                </td>
                                <td className="border border-slate-300 px-2">{item.id}</td>
                                <td className="border border-slate-300 px-2">{item.username}</td>
                                <td className="border border-slate-300 px-2">{item.position}</td>
                                <td className="border border-slate-300 px-2">{item.dutyType}</td>
                                <td className="border border-slate-300 px-2">{item.inTime}</td>
                                <td className="border border-slate-300 px-2">{item.outTime}</td>
                                <td className="border border-slate-300 px-2">{item.roleType}</td>
                                <td className="border border-slate-300 px-2">{item.relatedDutyTableRowId}</td>
                                <td className="border border-slate-300 px-2">{item.roleStartTime}</td>
                                <td className="border border-slate-300 px-2">{item.roleEndTime}</td>
                                <td className="border border-slate-300 px-2">{item.roleTimes}</td>
                                <td className="border border-slate-300 px-2">{item.status}</td>
                                <td className="border border-slate-300 px-2">{item.relatedPrepareTableId}</td>
                               
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <RefreshCcw
                color={needRefresh ? "#2563EB" : "red"}
                size={64}
                className="z-50 absolute bottom-4 right-4 cursor-pointer "
                onClick={() => {
                    console.log({ ...dateRange, username: username, position: positions, roleType: roleType });
                    getDataByUser({ ...dateRange, username: username, position: positions, roleType: roleType });
                }}
            />
        </div>
    );
}

export default ViewByName;
