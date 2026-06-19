import React from "react";
import { Card,Col, Row  } from "antd";

const currentTempFiles = [
    // {
    //     title:'',
    //     description:'',
    //     creator:""

    // },
    {
        title: "代理协议模版",
        description: "我公司（甲方）代理某某产品，与XXX公司（乙方），需要签订的代理协议的模版",
        creator: "沈宁",
    },
    {
        title: "风扇规格书模版",
        description: "常见型号的风扇",
        creator: "沈宁",
    },
];

export default function TempList() {
    return (
        <divw
            style={{
                padding: 30,
                background: "#ececec",
                display:'flex',
                flexDirection:'row',
                

            }}
        >
            {currentTempFiles.map((temp) => {
                return (
                    <Card title={temp.title} bordered={false} style={{ width: 300 ,margin:30}}>
                        <p>{temp.description}</p>
                        <h4>{temp.creator}</h4>
                    </Card>
                );
            })}
        </divw>
    );
}
