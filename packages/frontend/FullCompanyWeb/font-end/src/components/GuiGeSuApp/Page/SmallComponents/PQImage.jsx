import React,{useEffect} from "react";
import * as echarts from "echarts";
import styles from "../Page.module.css";


export default function PQImage() {
    useEffect(() => {
        const myChart=echarts.init(document.getElementById('FanPQ'),null, {renderer: 'svg'});
        var option = {
            title: {
                text: 'P/Q TEST'
            },
            tooltip: {},
            legend: {
                data: ['销量']
            },
            dataset: {
                id: "",
                source: [
                    [0, 0, 9.58, 10.3, 24.83, 0.1, 2.43, 0, 8284],
                    [1.19, 1.19, 8.44, 9.07, 24.83, 0.1, 2.38, 1.95, 8665],
                    [2.24, 2.24, 7.11, 7.64, 24.83, 0.1, 2.36, 3.12, 8997],
                    [3.58, 3.58, 5.22, 5.61, 24.83, 0.09, 2.28, 3.78, 9531],
                    [4.7, 4.7, 2.7, 2.9, 24.83, 0.09, 2.19, 2.69, 10077],
                    [6.13, 6.13, 2.45, 2.63, 24.83, 0.09, 2.26, 3.08, 9584],
                    [7.41, 7.41, 2.2, 2.36, 24.83, 0.09, 2.33, 3.23, 9132],
                    [8.62, 8.62, 1.35, 1.45, 24.83, 0.1, 2.36, 2.28, 8974],
                    [9.86, 9.86, 0.01, 0.01, 24.83, 0.09, 2.33, 0.02, 9120]
                ],
                dimensions: ['Q', 'Qstp', 'P', 'Pstp', 'Voltage', 'Current', 'Power', 'Efficiency', 'Rotary S.'],
            }
            ,
            xAxis: {
                name: "采样次数",
                nameLocation: "middle",
                nameTextStyle: {
                    color: 'red',
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                    align: 'center',
                    verticalAlign: 'top',
                    lineHeight: 46,
                    borderColor: 'green',
                    borderWidth: 1,
                    padding: [1, 4, 6, 8]
                },
                nameRotate: 45,
                data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,],
                offset: 0,
                axisTick: {
                    alignWithLabel: true
                },
                splitLine: {
                    show: true,//是否展示 
                    lineStyle: {
                        color: "",//线条颜色
                        type: "solid"//线条样式，默认是实现，dashed是虚线
                    }
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'P\nS\nT\nP\n',
                    nameLocation: 'middle',
                    nameGap: 35,
                    nameRotate: 360,
                    id: 0,
                    splitNumber: 5,
                    minInterval: 2,
                    max: 12
                },
                {
                    type: 'value',
                    name: 'RPM ',
                    // nameLocation: 'middle',
                    nameTextStyle: {
                        color: 'black', padding: [0, 0, 0, 35]
                    },
                    id: 1,
                    position: 'right',
                    splitLine: {
                        show: false,//是否展示 
                        lineStyle: {
                            color: "red",//线条颜色
                            type: "solid"//线条样式，默认是实现，dashed是虚线
                        }
                    },
                    axisLine:{
                        show:true,
                    },
                    axisTick:{
                        show:true,
                        inside:true,
                    },
                },
                {
                    type: 'value',
                    name: 'efficiency ',
                    nameTextStyle: {
                        color: 'black', padding: [0, 0, 0, 35]
                    },
                    // nameLocation: 'middle',
                    id: 2,
                    position: 'right',
                    splitLine: {
                        show: false,//是否展示 
                        lineStyle: {
                            color: "green",//线条颜色
                            type: "solid"//线条样式，默认是实现，dashed是虚线
                        },

                    },
                    axisLine:{
                        show:true,
                    },
                    axisTick:{
                        show:true,
                        inside:true,
                    },
                    axisLabel: {

                        margin: 0, //刻度标签与轴线之间的距离。
                        left: 0, //整个echart位置
                        textStyle: {
                            align: "left"
                        }
                    },
                    offset: 50,
                    max: 100,
                    interval: 10
                }
            ],
            series: [
                {
                    name: 'Pstp',
                    type: 'line',
                    smooth: true,
                    yAxisIndex: 0,
                    encode: {
                        y: [3]
                    }
                },
                {
                    name: "RPM",
                    type: "line",
                    smooth: true,
                    yAxisIndex: 1,
                    symbol: 'triangle',
                    symbolSize: 8,
                    encode: {
                        y: [8]
                    }
                },
                {
                    name: 'Efficiency',
                    type: 'line',
                    smooth: true,
                    yAxisIndex: 2,
                    encode: {
                        y: [7]
                    }
                }
            ],
            grid: {
                right: '4%',
                containLabel: true
            }


        };

        myChart.setOption(option);


    }, [])

    return (
        <div  style={{display:"flex",flexDirection:'column',flexGrow:0, justifyContent:'center',alignItems:'center',}}>
            <img alt="风扇风压图" ></img>
            <div id="FanPQ" style={{display:"flex", alignItems:'center', width: "600px", height: "400px" }} />
        </div>
    );
}
