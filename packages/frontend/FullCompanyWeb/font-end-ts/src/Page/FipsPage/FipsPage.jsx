import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Echarts from "components/Echart/Echarts";
import StackedAreaChart from "./Charts/StackedAreaChart";

// 应用图标库
// 1 全国地图起飞航线
// 2 每日航班架次统计
//       航班架次里面 按照 机型分布统计
//                         走廊口分布统计
// 3 时刻密度

import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import TestLineChart from "./Charts/TestLineChart";
import EntranceWayPointStackedAreaChart from "./Charts/EntranceWayPointStackedAreaChart";
import LeftSideNav from "./Nav/LeftSideNav";
dayjs.extend(dayOfYear);

function processData(rawData) {
    var data = {};

    rawData.forEach((item) => {
        const _entranceWayPoint = item.entranceWayPoint;
        const _date = item["date"];

        if (data[_entranceWayPoint] === undefined) {
            data[_entranceWayPoint] = {};
            data[_entranceWayPoint][_date] = 1;
        } else {
            if (data[_entranceWayPoint][_date] === undefined) {
                data[_entranceWayPoint][_date] = 1;
            } else {
                data[_entranceWayPoint][_date] = data[_entranceWayPoint][_date] + 1;
            }
        }
    });
    return data;
}
function getDataArrayByEntranceWayPointAndOrderByDate(data, entranceWayPoint) {
    console.info("getDataArrayByEntranceWayPointAndOrderByDate");
    const pointData = data[entranceWayPoint];
    const pointDataArray = new Array(366).fill(0);
    if (pointData !== undefined) {
        for (const [key, value] of Object.entries(pointData)) {
            const index = dayjs(key, "YYYYMMDD").dayOfYear();
            pointDataArray[index] = value;
        }
    } else {
    }
    return pointDataArray;
}

function FipsPage() {
    const [lineData, setLineData] = useState([]);
    const [rawData, setRawData] = useState([]);
    useEffect(() => {
        fetch("http://localhost:3104/fips")
            .then((res) => res.json())
            .then((data) => {
                // console.log(data);
                setRawData(data);
                const _data = getDataArrayByEntranceWayPointAndOrderByDate(processData(data), "XSH");
                console.log(_data);
                setLineData(_data);
            });

        return () => {
            // second;
            setLineData(null);
        };
    }, []);

    return (
        <div className="flex flex-row w-full h-full  gap-2 p-2">
            <LeftSideNav />
            <div className="flex flex-col w-full h-full justify-center items-center gap-2 rounded-[0.5rem] border bg-background shadow  overflow-y-auto" >
                <TestLineChart rawData={lineData} />
                fdsafasdfas dfsdfasdf
                <EntranceWayPointStackedAreaChart rawData={rawData} />
                <div className="border">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">简单起飞/落地使用跑道统计</h3>
                </div>
                <div className="border">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">全国地图起飞航线</h3>
                </div>
                <div className="border">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">走廊口分布统计</h3>
                </div>
                <div className="border  w-auto">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">时刻密度</h3>
                    <StackedAreaChart />
                </div>
            </div>
        </div>
    );
}

export default FipsPage;
