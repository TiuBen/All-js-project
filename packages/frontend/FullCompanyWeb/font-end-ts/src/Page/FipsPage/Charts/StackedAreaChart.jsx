import Echarts from "components/Echart/Echarts";
import React, { useEffect, useState } from "react";
const PieToolbox = {
    feature: {
        saveAsImage: {
            name: "Chart",
            show: true,
            title: "Save as Image",
            // name: 'Share of Topics', // need to set dynamic
            type: "jpeg",
            backgroundColor: "#FFFFFF",
            pixelRatio: 2,
        },
        dataView: {
            show: true,
            readOnly: true,
            title: "View Data",
            lang: ["View Data", "Close", "Refresh"],
        },
        restore: { show: true, title: "Restore" },
    },
};

const data = [
    { name: "Type 1", value: 20 },
    { name: "Type 2", value: 30 },
];

const Options = {
    tooltip: {
        show: true,
    },
    toolbox: PieToolbox,
    series: {
        type: "pie",
        data: data,
        label: {
            position: "outer",
            alignTo: "none",
            bleedMargin: 5,
        },
        top: "10%",
        bottom: "10%",
    },
    legend: {
        top: "bottom",
        show: true,
    },
};

function StackedAreaChart() {
    const [data, setData] = useState({
        data: Options,
        loading: false,
        error: false,
    });

    useEffect(() => {
        setData({
            data: Options,
            loading: false,
            error: false,
        });
    }, []);

    return (
        <div>
            StackedAreaChart
            <Echarts loading={data.loading} options={data.data} />
        </div>
    );
}

export default StackedAreaChart;
