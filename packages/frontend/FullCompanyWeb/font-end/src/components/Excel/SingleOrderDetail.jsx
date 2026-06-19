import { icons } from "antd/es/image/PreviewGroup";
import dayjs from "dayjs";
import React from "react";
import ReactDOMServer from 'react-dom/server';
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import NoteIcon from "@mui/icons-material/Note";
import FunctionsIcon from "@mui/icons-material/Functions";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { Card, Col, Row } from "antd";
const columns = [
    "序号",
    "下单人(必填)",
    "下单时间(必填)",
    "供应商名称 (必填)",
    "客户名称(必填)",
    "客户订单号 n(必填)",
    "客户是否已确认下单(必填)",
    "物料名称(必填)",
    "物料规格(必填)",
    "采购订单数量(采购必填)",
    "销售订单数量 n(必填)",
    "采购单价n(含税)n(采购必填)",
    "销售单价n(含税）(必填)",
    "采购总金额(采购必填)",
    "销售总金额 n(必填)",
    "商务主管意见 n(必填)",
    "财务审核n(必填)",
    "吴总意见  n(必填)",
    "备注",
    "利润",
    "备注",
    "出货时间",
    "已出数量n第1批",
    "已出数量n第2批",
    "已出数量n第3批",
    "已出数量n共计",
    "待出数量",
];
const Demo_Single_Order = {
    序号: "3",
    "下单人  （必填）": "王娟娟",
    "下单时间  （必填）": "2021/10/12",
    "供应商名称 (必填）": "深圳市瀚瑞微科技有限公司",
    "客户名称  （必填）": "航嘉",
    "客户订单号 \r\n （必填）": "系统需求:",
    "客户是否已确认下单  （必填）": "是",
    "物料名称  （必填）": "IC",
    "物料规格  （必填）": "114-63232001R1",
    "采购订单数量  （采购必填）": "10000",
    "销售订单数量  \r\n（必填）": "10000",
    "采购单价\r\n（含税）\r\n (采购必填）": "4.08",
    "销售单价\r\n（含税）  （必填）": "¥4.2840",
    "采购总金额  （采购必填）": "¥40,800.00",
    "销售总金额 \r\n （必填）": "¥42,840.00",
    "商务主管意见 \r\n （必填）": "王娟娟\r\n21-10-12",
    "财务审核\r\n （必填）": "销售订单数量（10000）与采购订单数量（10000）一致",
    "吴总意见  \r\n（必填）": "吴莉  21-10-12",
    备注: "",
    利润: "¥2,040.0000",
    备注2: "",
    出货时间: "",
    "已出数量\r\n第1批": "",
    "已出数量\r\n第2批": "",
    "已出数量\r\n第3批": "",
    "已出数量\r\n共计": "0",
    待出数量: "10000",
};

export default function SingleOrderDetail(props) {
    // const { Demo_Single_Order = {} } = props;

    const _test=ReactDOMServer.renderToStaticMarkup( <div style={{ display: "flex", flexDirection: "column", backgroundColor: "#ececec", padding: "1.5rem" ,width:''}}>
    {/* <!-- 第一部分 --> */}
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap-reverse" }}>
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                flex: 1,
                flexWrap: "wrap-reverse",
                
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                <div className="left-botton-border top-border text-center">序号</div>
                <div
                    className="left-botton-border textFont"
                    style={{ display: "flex", flex: 1, alignItems: "center" }}
                >
                    {Demo_Single_Order["序号"] || "Y22M01DD00001"}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                <div className="left-botton-border top-border">下单人(必填)</div>
                <div
                    className="left-botton-border textFont"
                    style={{ display: "flex", flex: 1, alignItems: "center" }}
                >
                    {Demo_Single_Order["下单人  （必填）"] || "韩晶威员工"}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: " max-content" }}>
                <div className="left-botton-border top-border">下单时间(必填)</div>
                <div
                    className="left-botton-border textFont"
                    style={{ display: "flex", flex: 1, alignItems: "center" }}
                >
                    {dayjs().format("YYYY-MM-DD")}
                </div>
            </div>
        </div>
        <div
            className="left-botton-border top-border right-border"
            style={{ display: "flex", flexDirection: "row", flex: 1 }}
        >
            <div style={{ color: "red", border: "0.5px solid red", margin: "0.25rem" }}>
                红色表示客户未下订单
            </div>
            <div style={{ color: "purple", border: "0.5px solid purple", margin: "0.25rem" }}>
                紫色表示未出货
            </div>
            <div style={{ color: "Fuchsia", border: "0.5px solid Fuchsia", margin: "0.25rem" }}>
                黄色未完全出货
            </div>
            <div style={{ color: "green", border: "0.5px solid green", margin: "0.25rem" }}>
                绿色表示利润未超过1000元
            </div>
        </div>
    </div>
    {/* <!-- 第二部分 --> */}
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap-reverse", alignContent: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
            <div className="left-botton-border">供应商名称</div>
            <div
                className="left-botton-border valueTextFont"
                style={{
                    display: "flex",
                    flex: 1,
                    minHeight: "1rem",
                    position: "relative",
                }}
            >
                <div style={{ position: "absolute", right: "5px", top: "0px" }}>
                    <div style={{ alignItems: "center" }} className="tooltip" href="ssss">
                        <a>
                            <RecentActorsIcon fontSize="small" />
                        </a>
                        <span className="tooltiptext">信息</span>
                    </div>
                </div>
                <a>{Demo_Single_Order["供应商名称 (必填）"] || "供应商公司名称"}</a>
                <div style={{ position: "absolute", left: "5px", top: "0px" }}>
                    <div style={{ alignItems: "center" }} className="tooltip" href="ssss">
                        <a>
                            <AttachMoneyIcon fontSize="small" />
                        </a>
                        <span className="tooltiptext">资金汇总</span>
                    </div>
                </div>
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                <div className="left-botton-border text-center">客户名称</div>
                <div className="left-botton-border valueTextFont">
                    <a>{Demo_Single_Order["客户名称  （必填）"] || "供应商公司名称"}</a>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                <div className="left-botton-border text-center">客户订单号</div>
                <div
                    className="left-botton-border"
                    style={{
                        fontStyle: "italic",
                        fontWeight: "bold",
                        textAlign: "left",
                    }}
                >
                    {Demo_Single_Order["客户订单号 \r\n （必填）"] || "DD1234567"}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                <div className="left-botton-border text-center">客户是否已确定下单</div>
                <div
                    className="left-botton-border strongText "
                    style={{
                        fontStyle: "italic",
                    }}
                >
                    {Demo_Single_Order["客户是否已确认下单  （必填）"] || "否"}
                </div>
            </div>
        </div>
        <div
            className="right-border"
            style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}
        >
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                <div className="left-botton-border text-center">物料名称</div>
                <div
                    className="left-botton-border"
                    style={{ display: "flex", flex: 1, minHeight: "1rem", padding: "5px" }}
                >
                    {Demo_Single_Order["物料名称  （必填）"] || "卖的东西的名称"}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                <div className="left-botton-border text-center">物料规格</div>
                <div
                    className="left-botton-border"
                    style={{ display: "flex", flex: 1, minHeight: "1rem", padding: "5px" }}
                >
                    {Demo_Single_Order["物料规格  （必填）"] || "物料规格"}
                </div>
            </div>
        </div>
    </div>

    {/* <!-- 第三部分 --> */}
    <div className="right-border" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap",backgroundColor: "DarkGray", }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
            <div className="left-botton-border text-center">利润</div>
            <div
                className="left-botton-border strongText"
            >
                {Demo_Single_Order["利润"] || "0000"}
                <br />
                {"人民币三千四百元"}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
            <div className="left-botton-border">采购总金额</div>
            <div className="left-botton-border strongText" >
                {Demo_Single_Order["采购总金额  （采购必填）"] || "0"}
            </div>
            <div className="left-botton-border">销售总金额</div>
            <div
                className="left-botton-border strongText"
            >
                {Demo_Single_Order["销售总金额 \r\n （必填）"] || "0"}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
            <div className="left-botton-border">采购单价（含税）</div>
            <div className="left-botton-border strongText" >
                {Demo_Single_Order["采购单价\r\n（含税）\r\n (采购必填）"] || "0"}
            </div>
            <div className="left-botton-border">销售单价（含税）</div>
            <div className="left-botton-border strongText" >
                {Demo_Single_Order["销售单价\r\n（含税）  （必填）"] || "0"}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
            <div className="left-botton-border">采购订单数量</div>
            <div className="left-botton-border strongText" >
                {Demo_Single_Order["采购订单数量  （采购必填）"] || "0"}
            </div>
            <div className="left-botton-border">销售订单数量</div>
            <div className="left-botton-border strongText" >
                {Demo_Single_Order["销售订单数量  \r\n（必填）"] || "0"}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", flex: 1, minWidth: "max-content" }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                <div className="left-botton-border">出货时间1</div>
                <div className="left-botton-border " style={{ display: "flex", flex: 1, minHeight: "1rem" ,backgroundColor:'#ececec'}}>
                    {Demo_Single_Order["出货时间"] || "旧数据没有出货时间"}
                </div>
                <div className="left-botton-border">出货数量1</div>
                <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem",backgroundColor:'#ececec' }}>
                    {Demo_Single_Order["已出数量\r\n第1批"] || "旧数据没有出货数量"}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                <div className="left-botton-border">出货时间2</div>
                <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem" ,backgroundColor:'#ececec'}}>
                    {Demo_Single_Order["出货时间"] || "旧数据没有出货时间"}
                </div>
                <div className="left-botton-border">出货数量2</div>
                <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem",backgroundColor:'#ececec' }}>
                    {Demo_Single_Order["已出数量\r\n第1批"] || "旧数据没有出货数量"}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                <div className="left-botton-border">出货时间3</div>
                <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem",backgroundColor:'#ececec' }}>
                    {Demo_Single_Order["已出数量\r\n第1批"] || "旧数据没有出货数量"}
                </div>
                <div className="left-botton-border">出货数量3</div>
                <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem",backgroundColor:'#ececec' }}>
                    {Demo_Single_Order["出货时间"] || "旧数据没有出货时间"}
                </div>
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
            <div className="left-botton-border  ">
                待出数量
            </div>
            <div className="left-botton-border strongText" >
                {Demo_Single_Order["待出数量"] || "0"}
            </div>
        </div>
    </div>
    {/* <!-- 第四部分 --> */}
    <div className="right-border" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
            <div className="left-botton-border">商务主管意见</div>
            <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem" }}>
                {Demo_Single_Order["商务主管意见 \r\n （必填）"] || "0"}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
            <div className="left-botton-border">财务审核</div>
            <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem" }}>
                {Demo_Single_Order["财务审核\r\n （必填）"] || "0"}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
            <div className="left-botton-border">吴总意见</div>
            <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem" }}>
                {Demo_Single_Order["吴总意见  \r\n（必填）"] || "0"}
            </div>
        </div>
    </div>
    {/* <!-- 第五部分 --> */}
    <div
        className="right-border"
        style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}
    >
        <div
            className="left-botton-border"
            style={{ display: "flex", flexDirection: "row", flex: 1, minWidth: "max-content" }}
        >
            <label for="">备注1:</label>
            <div style={{ display: "flex", flex: 1, minHeight: "1rem" }}>
                {Demo_Single_Order["备注"] || "写些什么"}
            </div>
        </div>
        <div
            className="left-botton-border"
            style={{ display: "flex", flexDirection: "row", flex: 1, minWidth: "max-content" }}
        >
            <label for="">备注2:</label>
            <div style={{ display: "flex", flex: 1, minHeight: "1rem" }}>
                {Demo_Single_Order["备注"] || "写些什么"}
            </div>
        </div>
    </div>
</div>)

console.log(_test);
    return (
        <div style={{ display: "flex", flexDirection: "column", backgroundColor: "#ececec", padding: "1.5rem" ,width:''}}>
            {/* <!-- 第一部分 --> */}
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap-reverse" }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        flex: 1,
                        flexWrap: "wrap-reverse",
                        
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                        <div className="left-botton-border top-border text-center">序号</div>
                        <div
                            className="left-botton-border textFont"
                            style={{ display: "flex", flex: 1, alignItems: "center" }}
                        >
                            {Demo_Single_Order["序号"] || "Y22M01DD00001"}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                        <div className="left-botton-border top-border">下单人(必填)</div>
                        <div
                            className="left-botton-border textFont"
                            style={{ display: "flex", flex: 1, alignItems: "center" }}
                        >
                            {Demo_Single_Order["下单人  （必填）"] || "韩晶威员工"}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: " max-content" }}>
                        <div className="left-botton-border top-border">下单时间(必填)</div>
                        <div
                            className="left-botton-border textFont"
                            style={{ display: "flex", flex: 1, alignItems: "center" }}
                        >
                            {dayjs().format("YYYY-MM-DD")}
                        </div>
                    </div>
                </div>
                <div
                    className="left-botton-border top-border right-border"
                    style={{ display: "flex", flexDirection: "row", flex: 1 }}
                >
                    <div style={{ color: "red", border: "0.5px solid red", margin: "0.25rem" }}>
                        红色表示客户未下订单
                    </div>
                    <div style={{ color: "purple", border: "0.5px solid purple", margin: "0.25rem" }}>
                        紫色表示未出货
                    </div>
                    <div style={{ color: "Fuchsia", border: "0.5px solid Fuchsia", margin: "0.25rem" }}>
                        黄色未完全出货
                    </div>
                    <div style={{ color: "green", border: "0.5px solid green", margin: "0.25rem" }}>
                        绿色表示利润未超过1000元
                    </div>
                </div>
            </div>
            {/* <!-- 第二部分 --> */}
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap-reverse", alignContent: "stretch" }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                    <div className="left-botton-border">供应商名称</div>
                    <div
                        className="left-botton-border valueTextFont"
                        style={{
                            display: "flex",
                            flex: 1,
                            minHeight: "1rem",
                            position: "relative",
                        }}
                    >
                        <div style={{ position: "absolute", right: "5px", top: "0px" }}>
                            <div style={{ alignItems: "center" }} className="tooltip" href="ssss">
                                <a>
                                    <RecentActorsIcon fontSize="small" />
                                </a>
                                <span className="tooltiptext">信息</span>
                            </div>
                        </div>
                        <a>{Demo_Single_Order["供应商名称 (必填）"] || "供应商公司名称"}</a>
                        <div style={{ position: "absolute", left: "5px", top: "0px" }}>
                            <div style={{ alignItems: "center" }} className="tooltip" href="ssss">
                                <a>
                                    <AttachMoneyIcon fontSize="small" />
                                </a>
                                <span className="tooltiptext">资金汇总</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                        <div className="left-botton-border text-center">客户名称</div>
                        <div className="left-botton-border valueTextFont">
                            <a>{Demo_Single_Order["客户名称  （必填）"] || "供应商公司名称"}</a>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                        <div className="left-botton-border text-center">客户订单号</div>
                        <div
                            className="left-botton-border"
                            style={{
                                fontStyle: "italic",
                                fontWeight: "bold",
                                textAlign: "left",
                            }}
                        >
                            {Demo_Single_Order["客户订单号 \r\n （必填）"] || "DD1234567"}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                        <div className="left-botton-border text-center">客户是否已确定下单</div>
                        <div
                            className="left-botton-border strongText "
                            style={{
                                fontStyle: "italic",
                            }}
                        >
                            {Demo_Single_Order["客户是否已确认下单  （必填）"] || "否"}
                        </div>
                    </div>
                </div>
                <div
                    className="right-border"
                    style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}
                >
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                        <div className="left-botton-border text-center">物料名称</div>
                        <div
                            className="left-botton-border"
                            style={{ display: "flex", flex: 1, minHeight: "1rem", padding: "5px" }}
                        >
                            {Demo_Single_Order["物料名称  （必填）"] || "卖的东西的名称"}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                        <div className="left-botton-border text-center">物料规格</div>
                        <div
                            className="left-botton-border"
                            style={{ display: "flex", flex: 1, minHeight: "1rem", padding: "5px" }}
                        >
                            {Demo_Single_Order["物料规格  （必填）"] || "物料规格"}
                        </div>
                    </div>
                </div>
            </div>

            {/* <!-- 第三部分 --> */}
            <div className="right-border" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap",backgroundColor: "DarkGray", }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                    <div className="left-botton-border text-center">利润</div>
                    <div
                        className="left-botton-border strongText"
                    >
                        {Demo_Single_Order["利润"] || "0000"}
                        <br />
                        {"人民币三千四百元"}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                    <div className="left-botton-border">采购总金额</div>
                    <div className="left-botton-border strongText" >
                        {Demo_Single_Order["采购总金额  （采购必填）"] || "0"}
                    </div>
                    <div className="left-botton-border">销售总金额</div>
                    <div
                        className="left-botton-border strongText"
                    >
                        {Demo_Single_Order["销售总金额 \r\n （必填）"] || "0"}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                    <div className="left-botton-border">采购单价（含税）</div>
                    <div className="left-botton-border strongText" >
                        {Demo_Single_Order["采购单价\r\n（含税）\r\n (采购必填）"] || "0"}
                    </div>
                    <div className="left-botton-border">销售单价（含税）</div>
                    <div className="left-botton-border strongText" >
                        {Demo_Single_Order["销售单价\r\n（含税）  （必填）"] || "0"}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                    <div className="left-botton-border">采购订单数量</div>
                    <div className="left-botton-border strongText" >
                        {Demo_Single_Order["采购订单数量  （采购必填）"] || "0"}
                    </div>
                    <div className="left-botton-border">销售订单数量</div>
                    <div className="left-botton-border strongText" >
                        {Demo_Single_Order["销售订单数量  \r\n（必填）"] || "0"}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "row", flex: 1, minWidth: "max-content" }}>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                        <div className="left-botton-border">出货时间1</div>
                        <div className="left-botton-border " style={{ display: "flex", flex: 1, minHeight: "1rem" ,backgroundColor:'#ececec'}}>
                            {Demo_Single_Order["出货时间"] || "旧数据没有出货时间"}
                        </div>
                        <div className="left-botton-border">出货数量1</div>
                        <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem",backgroundColor:'#ececec' }}>
                            {Demo_Single_Order["已出数量\r\n第1批"] || "旧数据没有出货数量"}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                        <div className="left-botton-border">出货时间2</div>
                        <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem" ,backgroundColor:'#ececec'}}>
                            {Demo_Single_Order["出货时间"] || "旧数据没有出货时间"}
                        </div>
                        <div className="left-botton-border">出货数量2</div>
                        <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem",backgroundColor:'#ececec' }}>
                            {Demo_Single_Order["已出数量\r\n第1批"] || "旧数据没有出货数量"}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                        <div className="left-botton-border">出货时间3</div>
                        <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem",backgroundColor:'#ececec' }}>
                            {Demo_Single_Order["已出数量\r\n第1批"] || "旧数据没有出货数量"}
                        </div>
                        <div className="left-botton-border">出货数量3</div>
                        <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem",backgroundColor:'#ececec' }}>
                            {Demo_Single_Order["出货时间"] || "旧数据没有出货时间"}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                    <div className="left-botton-border  ">
                        待出数量
                    </div>
                    <div className="left-botton-border strongText" >
                        {Demo_Single_Order["待出数量"] || "0"}
                    </div>
                </div>
            </div>
            {/* <!-- 第四部分 --> */}
            <div className="right-border" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                    <div className="left-botton-border">商务主管意见</div>
                    <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem" }}>
                        {Demo_Single_Order["商务主管意见 \r\n （必填）"] || "0"}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                    <div className="left-botton-border">财务审核</div>
                    <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem" }}>
                        {Demo_Single_Order["财务审核\r\n （必填）"] || "0"}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}>
                    <div className="left-botton-border">吴总意见</div>
                    <div className="left-botton-border" style={{ display: "flex", flex: 1, minHeight: "1rem" }}>
                        {Demo_Single_Order["吴总意见  \r\n（必填）"] || "0"}
                    </div>
                </div>
            </div>
            {/* <!-- 第五部分 --> */}
            <div
                className="right-border"
                style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "max-content" }}
            >
                <div
                    className="left-botton-border"
                    style={{ display: "flex", flexDirection: "row", flex: 1, minWidth: "max-content" }}
                >
                    <label for="">备注1:</label>
                    <div style={{ display: "flex", flex: 1, minHeight: "1rem" }}>
                        {Demo_Single_Order["备注"] || "写些什么"}
                    </div>
                </div>
                <div
                    className="left-botton-border"
                    style={{ display: "flex", flexDirection: "row", flex: 1, minWidth: "max-content" }}
                >
                    <label for="">备注2:</label>
                    <div style={{ display: "flex", flex: 1, minHeight: "1rem" }}>
                        {Demo_Single_Order["备注"] || "写些什么"}
                    </div>
                </div>
            </div>
        </div>
    );
}

{
    /* <Timeline>
    <Timeline.Item>
        6号练车
        <h5>突然拉肚子</h5>
    </Timeline.Item>
    <Timeline.Item>
        7号早上练车
        <h4>下午一直在睡觉</h4>
    </Timeline.Item>
    <Timeline.Item>
        8号考科目三
        <h5>上午考试</h5>
        <h5>下午一直在睡觉</h5>
    </Timeline.Item>
    <Timeline.Item>
        9号考科目三
        <h5>上午考试</h5>
        <h5>下午一直在睡觉</h5>
    </Timeline.Item>
    <Timeline.Item>
        10号在家
        <h5>上午去发了物流，卖了500元废品</h5>
        <h5>感觉不舒服，在睡觉，找小区里的人买到了抗原棒，检测是隐性</h5>
    </Timeline.Item>
    <Timeline.Item>
        11号下午高铁深圳
        <h5>去电信营业厅停了宽带</h5>
        <h5>当天晚上觉得很冷</h5>
    </Timeline.Item>
    <Timeline.Item>
        12号
        <h5>白天喉咙痛,靠喝水缓解，可以正常说话，嗓音轻微变化</h5>
        <h5>晚上下班在冷风里等出租车，突然感觉咽口水喉咙“小刀拉嗓子”，去买了一瓶雪碧，喝了立刻好了😂</h5>
    </Timeline.Item>
    <Timeline.Item>
        13号
        <h5>13号当晚羽绒内套个短袖晚上11点下楼吹冷风30分钟找人，感觉受凉</h5>
    </Timeline.Item>
    <Timeline.Item>
        14号
    </Timeline.Item>
    <Timeline.Item>
        15号
    </Timeline.Item>
    <Timeline.Item>
        16号
    </Timeline.Item>
    <Timeline.Item>
        17号
    </Timeline.Item>
    <Timeline.Item>8号考科目三</Timeline.Item>
    <Timeline.Item>9号考科目三</Timeline.Item>
    <Timeline.Item>9号考科目三</Timeline.Item>
    <Timeline.Item>9号考科目三</Timeline.Item>
</Timeline>; */
}
