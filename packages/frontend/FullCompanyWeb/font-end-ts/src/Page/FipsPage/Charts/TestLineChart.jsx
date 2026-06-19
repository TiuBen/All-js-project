import Echarts from "components/Echart/Echarts";
import React, { useEffect, useState } from "react";

const option = {
    xAxis: {
        type: "category",
        data: [],
    },
    yAxis: {
        type: "value",
    },
    series: [
        {
            data: [150, 230, 224, 218, 135, 147, 260],
            type: "line",
        },
    ],
};

function TestLineChart({ rawData }) {
//     option.series[0].data = rawData;

    const [data, setData] = useState({
        option: option,
        loading: true,
        error: false,
    });

    useEffect(() => {
      console.log(rawData);
      option.series[0].data=rawData.slice(0,200);
      
        setData({
            option: option,
            loading: false,
            error: false,
        });
    }, [rawData]);

    return (
        <div>
            StackedAreaChart
            <Echarts loading={data.loading} options={data.option} style={{width:'500px'}}/>
        </div>
    );
}

export default TestLineChart;
