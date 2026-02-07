"use client";

import React, { useEffect, useState } from "react";
import { server, serverActions, FakeOnDuty } from "@/lib/CONST";
import { Avatar, Box, Card, Flex, Text } from "@radix-ui/themes";
import { Avatar as MyAvatar } from "@/components/Avatar";
import { useLocalStorageState } from "ahooks";

function OnDutyPerson(props) {
    const { username, status = "正在执勤" } = props;

    // 正在执勤
    // 正在接班
    // 正在交班
    // 见习

    return (
        <div className="flex flex-row flex-shrink-0 gap-2 justify-start border rounded-lg p-1">
            <MyAvatar />
            <div className="flex flex-col min-w-[5rem]">
                <label className="font-extrabold ">{username || ""}</label>
                <label className=" text-xs text-gray-400">{status}</label>
            </div>
        </div>
    );
}

function OnDutyPosition(props) {
    const { position, needTwoPeople, onSelect } = props;
    const [positionData, setPositionData] = useState([
        {
            username: "张三",
            position: "西塔台",
            dutyType: "主班",
            status: "值班",
            time: "2023-03-01 12:00:00",
        },
        {
            username: "李四",
            position: "西塔台",
            dutyType: "主班",
            status: "值班",
            time: "2023-03-01 12:10:00",
        },
        {
            username: "王五",
            position: "西塔台",
            dutyType: "主班",
            status: "值班",
            time: "2023-03-01 12:10:00",
        },
    ]);

    const [positionData2, setPositionData2] = useState([
        {
            username: "张三",
            position: "西塔台",
            dutyType: "副班",
            status: "值班",
            time: "2023-03-01 12:00:00",
        },
        {
            username: "李四",
            position: "西塔台",
            dutyType: "副班",
            status: "值班",
            time: "2023-03-01 12:10:00",
        },
        {
            username: "王五",
            position: "西塔台",
            dutyType: "副班",
            status: "值班",
            time: "2023-03-01 12:10:00",
        },
    ]);



    const [selectedPosition] = useLocalStorageState("position", { defaultValue: "", listenStorageChange: true });

    return (
        <div className=" flex flex-col items-center border rounded-lg m-1">
            <div className="flex flex-row">
                <label className="text-center font-black text-lg ">
                    {position || "本席位名称"}
                    <input
                        type="radio"
                        name="position"
                        value={position}
                        checked={selectedPosition === position}
                        onClick={() => {
                            onSelect();
                        }}
                    />
                </label>
            </div>
            <div className="flex flex-row">
                <div className="flex flex-col items-center">
                    <div className="flex flex-row gap-2 p-2 border rounded-lg  m-1">
                        {needTwoPeople && <h3 className=" font-black text-lg">主班</h3>}
                        <div className="flex flex-col flex-wrap gap-2">
                            {positionData.map((data, index) => {
                                return <OnDutyPerson key={index} username={data.username} status={data.status} />;
                            })}
                        </div>
                    </div>
                </div>
                {needTwoPeople && (
                    <div className="flex flex-row gap-2 p-2 border rounded-lg m-1">
                        <h3 className=" font-black text-lg">副班</h3>
                        <div className="flex flex-col flex-wrap gap-2">
                            {positionData2.map((data, index) => {
                                return <OnDutyPerson key={index} username={data.username} status={data.status} />;
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

module.exports = { OnDutyPosition };
