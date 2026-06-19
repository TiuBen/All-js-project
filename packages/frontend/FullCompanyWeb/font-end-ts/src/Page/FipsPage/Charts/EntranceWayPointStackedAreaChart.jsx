import Echarts from "components/Echart/Echarts";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
dayjs.extend(dayOfYear);

const series = [
    // {
    //     name: "ENLAB",
    //     type: "bar",
    //     stack: "total",
    //     data: [120, 132, 101, 134, 90, 230, 210, 120, 132, 101, 134, 90, 230, 210],
    // },
    // {
    //     name: "XSH",
    //     type: "bar",
    //     stack: "total",
    //     data: [120, 132, 101, 134, 90, 230, 210, 120, 132, 101, 134, 90, 230, 210],
    // },

    // {
    //     name: "P254",
    //     type: "bar",
    //     stack: "total",
    //     data: [120, 132, 101, 134, 90, 230, 210, 120, 132, 101, 134, 90, 230, 210],
    // },
    // {
    //     name: "WTM",
    //     type: "bar",
    //     stack: "total",
    //     data: [120, 132, 101, 134, 90, 230, 210, 120, 132, 101, 134, 90, 230, 210],
    // },
];

const Options = {
    title: {
        text: "进场走廊口分布统计",
    },
    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "cross",
            label: {
                backgroundColor: "#6a7985",
            },
        },
    },
 
    grid: {},
    xAxis: [
        {
            type: "category",
            boundaryGap: true,
            data: Array(130).fill("0"),
        },
    ],
    yAxis: [
        {
            type: "value",
        },
    ],
    series: [],
};

const Data = {
    options: Options,
    loading: true,
    error: false,
};


function processData(rawData) {
    var data = {};
    if (rawData) {
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
        console.log(Object.keys(data));
    } else {
        console.error("raw Data null");
    }

    //  data formate is like
    // const datalike= {
    //     XSH:{20240101:34,20240102:30},
    //     WTM :{20240101:34,20240102:30},
    // }
    return data;
}
function getDataArrayByEntranceWayPointAndOrderByDate(data, entranceWayPoint) {
    console.info("getDataArrayByEntranceWayPointAndOrderByDate");
    const pointData = data[entranceWayPoint];
    const pointDataArray = new Array(366).fill(0);
    if (pointData !== undefined) {
        const _pointDateObject = Object.entries(pointData);
        for (const [key, value] of Object.entries(pointData)) {
            const index = dayjs(key, "YYYYMMDD").dayOfYear();
            pointDataArray[index] = value;
        }
    } else {
    }
    return pointDataArray;
}

function EntranceWayPointStackedAreaChart({ rawData }) {
    const [data, setData] = useState(Data);
  

    useEffect(() => {
        // **TEST
        const allEntranceWayPointsName = Object.keys(processData(rawData));
        const allEntranceWayPoints = processData(rawData);
        // Options.legend = { data: allEntranceWayPointsName, selectedMode: false };

        // console.log(allEntranceWayPoints);
        allEntranceWayPointsName.forEach((wayPointName, index) => {
            console.log(wayPointName);
            const wayPointData = getDataArrayByEntranceWayPointAndOrderByDate(allEntranceWayPoints, wayPointName);
            const ob = {
                name: wayPointName,
                type: "bar",
                stack: "total",
                data: wayPointData,
            };
            series[index] = ob;
        });

        Options.series = series;
        setData({
            data: Options,
            loading: false,
            error: false,
        });

        // ***TEST
    }, [rawData]);

    return (
        <div>
            
            <Echarts loading={data.loading} options={data.data} style={{ width: "1400px", height: "600px" }} />
        </div>
    );
}

export default EntranceWayPointStackedAreaChart;
