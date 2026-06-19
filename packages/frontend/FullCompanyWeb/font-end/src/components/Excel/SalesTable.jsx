import React,{useEffect,useState} from 'react'
import { Table } from 'antd';

const columns = [
    {
        title: "序号",
       dataIndex: "0",
       key: "0"
    },
    {
        title: "下单人(必填)",
       dataIndex: "1",
        width:100,
       key: "1",
    },
    {
        title: "下单时间(必填)",
       dataIndex: "2",
       key: "2",
       width:100,
       ellipsis: true,
    },
    {
        title: "供应商名称 (必填)",
       dataIndex: "3",
       key: "3",
       width:100,
    },
    {
        title: "客户名称(必填)",
       dataIndex: "4",
       key: "4",
       width:100,
    },
    {
        title: "客户订单号 n(必填)",
       dataIndex: "5",
       key: "5"
    },
    {
        title: "客户是否已确认下单(必填)",
       dataIndex: "6",
       key: "6"
    },
    {
        title: "物料名称(必填)",
       dataIndex: "7",
       key: "7"
    },
    {
        title: "物料规格(必填)",
       dataIndex: "8",
       key: "8"
    },
    {
        title: "采购订单数量(采购必填)",
       dataIndex: "9",
       key: "9"
    },
    {
        title: "销售订单数量 n(必填)",
       dataIndex: "10",
       key: "10"
    },
    {
        title: "采购单价n(含税)n(采购必填)",
       dataIndex: "11",
       key: "11"
    },
    {
        title: "销售单价n(含税）(必填)",
       dataIndex: "12",
       key: "13"
    },
    {
        title: "采购总金额(采购必填)",
       dataIndex: "14",
       key: "14"
    },
    {
        title: "销售总金额 n(必填)",
       dataIndex: "15",
       key: "15"
    },
    {
        title: "商务主管意见 n(必填)",
       dataIndex: "16",
       key: "16"
    },
    {
        title: "财务审核n(必填)",
       dataIndex: "17",
       key: "17"
    },
    {
        title: "吴总意见  n(必填)",
       dataIndex: "18",
       key: "18"
    },
    {
        title: "备注",
       dataIndex: "19",
       key: "19"
    },
    {
        title: "利润",
       dataIndex: "20",
       key: "20"
    },
    {
        title: "备注",
       dataIndex: "21",
       key: "21"
    },
    {
        title: "出货时间",
       dataIndex: "22",
       key: "22"
    },
    {
        title: "已出数量n第1批",
       dataIndex: "23",
       key: "23"
    },
    {
        title: "已出数量n第2批",
       dataIndex: "24",
       key: "24"
    },
    {
        title: "已出数量n第3批",
       dataIndex: "25",
       key: "25"
    },
    {
        title: "已出数量n共计",
       dataIndex: "26",
       key: "26"
    },
    {
        title: "待出数量",
       dataIndex: "27",
       key: "27"
    }
];



export default function SalesTable() {


    const [data, setData] = useState([]);
    useEffect(() => {
        console.log("useEffect");

        fetch('http://localhost:3100/csv')
            .then(function(response){
                return response.json();
            })
            .then(function(json){
                setData(json);
                
                console.log("获取的CSV数据");
                console.log(json);
            })


    }, [])




    return (
        <div>
            <h1>test</h1>
        <Table dataSource={data} columns={columns} size="small"/>
            
        </div>
    )
}
