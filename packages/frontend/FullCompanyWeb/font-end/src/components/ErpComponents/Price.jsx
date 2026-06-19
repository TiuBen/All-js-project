import React, { useState, useEffect } from "react";
import { useGetSupplier, COMPANY, ITEM, useGetFromServer } from "../../services/index.js";
import { PriceHeaderArray } from "data/index.js";

function ExcelLike({ data }) {
    if (data) {
        return (
            <table
                className="excel-like-table"
                style={{
                    border: "1px solid black",
                    borderCollapse: "collapse",
                }}
            >
                <thead>
                    <tr>
                        {PriceHeaderArray.map((title, index) => {
                            return <td key={index}>{title}</td>;
                        })}
                    </tr>
                </thead>
                <tbody>
                    {data.map((quotation, index) => {
                        return (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{quotation.itemName}</td>
                                <td>{quotation.neederName}</td>
                                <td>{quotation.supplierName}</td>
                                <td>{quotation.specification}</td>
                                <td>{quotation.itemDetail}</td>
                                <td>{quotation.getPrice}</td>
                                <td>{quotation.salePrice}</td>
                                <td>{quotation.quotationTime}</td>
                                <td>{quotation.quotationStaff}</td>
                                <td>{quotation.targetProfit}</td>
                                <td>{quotation.reviewOpinion}</td>
                                <td>{quotation.supplement}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    } else {
        return <h2>Error</h2>;
    }
}

function Ele2(props) {
    return (
        <h1>
            2222
            <br />
            {JSON.stringify(props)}
        </h1>
    );
}

function StyleSwitch(type, data) {
    var _element;
    switch (type) {
        case "EXCEL": // 纯EXCEL表格
            _element = <ExcelLike data={data} />;
            break;
        case "SimpleList": // 简单 列表 list
            _element = <Ele2 data={data} />;
            break;
        // case "ColorList":// 纯EXCEL表格

        //     break;
        default:
            break;
    }

    return _element;
}

function PriceItem({ quotation }) {
    const [level, setLevel] = useState(0);

    return (
        <div className="d-flex flex-row border">
            <div className="d-flex flex-column m-1 m-1">
                <label className="text-center fw-medium">供应商</label>
                <input
                    className="w-100 border border "
                    value={quotation.supplierName}
                    placeholder="请填写供应商的的名称"
                    required="required"
                />
                <mark style={{ fontSize: "0.8rem" }}>"该供应商不在供应商名录中,是否创建"</mark>
            </div>
            <div className="d-flex flex-column m-1">
                <label className="text-center">需求方</label>
                <input
                    className="w-100 border"
                    value={quotation.neederName}
                    placeholder="请填需求方的的名称"
                    required="required"
                />
            </div>
            <div className="d-flex flex-column m-1">
                <label className="text-center">规格尺寸</label>
                <input className="w-100 border" value={quotation.specification} placeholder="尽量写详细" />
                <label className="text-center">规格要求</label>
                <input
                    className="w-100 border"
                    value={quotation.itemDetail}
                    placeholder="尽量写详细"
                    required="required"
                />
            </div>
            <div className="d-flex flex-column m-1" style={{ width: "320px" }}>
                <div className="text-center">供应商单价</div>
                <input
                    className="w-100 border"
                    value={quotation.getPrice}
                    placeholder="尽量写详细"
                    required="required"
                />
                <div className="d-flex flex-row flex-grow-1 border">
                    <div className="d-flex flex-column m-1 border  w-75">
                        <di className="d-flex flex-row ">
                            <input type="radio" name="供应商单价" />
                            <label htmlFor="">含税</label>
                        </di>
                        <div className="d-flex flex-row ">
                            <input type="radio" name="供应商单价" />
                            <label htmlFor="">不含税</label>
                        </div>
                    </div>
                    <div className="d-inline border w-100">
                        <label className="d-inline" for="cars">
                            税点
                        </label>
                        <select className="d-inline  w-100" id="cars">
                            <option value="volvo">7</option>
                            <option value="saab">13</option>
                            <option value="opel">其他</option>
                        </select>
                    </div>
                </div>
                <mark>自动生成的中文金额</mark>
            </div>
            <div className="d-flex flex-column m-1" style={{ width: "320px" }}>
                <div className="text-center">客户报价</div>
                <input className="w-100 border" value={quotation.salePrice} placeholder="尽量写详细" />
                <div className="d-flex flex-row flex-grow-1 border">
                    <div className="d-flex flex-column m-1 border  w-75">
                        <di className="d-flex flex-row ">
                            <input type="radio" name="供应商单价" />
                            <label htmlFor="">含税</label>
                        </di>
                        <div className="d-flex flex-row ">
                            <input type="radio" name="供应商单价" />
                            <label htmlFor="">不含税</label>
                        </div>
                    </div>
                    <div className="d-inline border w-100">
                        <label className="d-inline" for="cars">
                            税点
                        </label>
                        <select className="d-inline  w-100" id="cars">
                            <option value="volvo">7</option>
                            <option value="saab">13</option>
                            <option value="opel">其他</option>
                        </select>
                    </div>
                </div>
                <mark>自动生成的中文金额</mark>
            </div>
            <div className="d-flex flex-column m-1">
                <div>利润点 </div>
                <input className="w-100 border" />
                <mark>"系统自动计算"</mark>
            </div>
            <div className="d-flex flex-column m-1">
                <div className="d-flex flex-column m-1">
                    <label for="cars">报价人</label>
                    <select id="cars" value={quotation.SellPrice}>
                        <option value="volvo">AAAA</option>
                        <option value="saab">BBBB </option>
                        <option value="opel">CCCC</option>
                    </select>
                </div>
                <div className="d-flex flex-column m-1">
                    <div>报价时间 </div>
                    <input type="date" className="w-100" />
                </div>
            </div>

            <div className="d-flex flex-column m-1">
                <div>商务主管意见 </div>
                <input className="w-100 border" />
                <div>吴总意见 </div>
                <input className="w-100 border" />
                <div>财务审核 </div>
                <input className="w-100 border" />
            </div>
            <div className="d-flex flex-column m-1">
                <div>备注 </div>
                <input className="w-100 border" />
            </div>
        </div>
    );
}

function PriceItemTableCell(quotation, index) {
    return (
        <tr key={index}>
            <td>{quotation.id}</td>
            <td>{quotation.itemName}</td>
            <td>{quotation.neederName}</td>
            <td>{quotation.supplierName}</td>
            <td>{quotation.specification}</td>
            <td>{quotation.itemDetail}</td>
            <td>{quotation.getPrice}</td>
            <td>{quotation.salePrice}</td>
            <td>{quotation.quotationStaff}</td>
            <td>{quotation.quotationTime}</td>
            <td>{quotation.targetProfit}</td>
            <td>{quotation.reviewOpinion}</td>
            <td>{quotation.supplement}</td>
        </tr>
    );
}

function Price() {
    const [type, setType] = useState("SimpleList");
    const { data, isError, isLoading } = useGetFromServer(COMPANY.dd, ITEM.quotation);

    const E = StyleSwitch("EXCEL", data);
    return (
        <div>
            <button
                onClick={(e) => {
                    setType("EXCEL");
                }}
            >
                EXCEL
            </button>
            <button
                onClick={(e) => {
                    setType("Card");
                }}
            >
                Card
            </button>
            <button
                onClick={(e) => {
                    setType("ROW");
                }}
            >
                ROW
            </button>
            {E}
        </div>
    );

    return (
        <div>
            Price
            {data ? (
                data.map((item, index) => {
                    return (
                        <div>
                            {index}
                            <PriceItem quotation={item} key={index} />
                        </div>
                    );
                })
            ) : (
                <></>
            )}
        </div>
    );
}
export default Price;
