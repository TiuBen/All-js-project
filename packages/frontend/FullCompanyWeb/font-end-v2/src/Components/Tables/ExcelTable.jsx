import { ErrorElement } from "../index.js";
import { useLocation } from "react-router-dom";
import useSWR, { useSWRConfig } from "swr";
import { useState, useEffect } from "react";
import { FanSupplierTableHeaderData } from "./FanSupplierTableHeader.js";

const _testHeader = [
    { title: "序号", keyName: "id", width: 2 },
    { title: "物料名称", keyName: "itemCell1", width: 2 },
    { title: "物料名称", keyName: "itemCell2", width: 2 },
];

const _testData = [
    {
        id: "1",
        itemCell1: "test cell 1",
        itemCell2: "test cell 2",
    },
    {
        id: "2",
        itemCell1: "test cell 1",
        itemCell2: "test cell 2",
    },
];

function TableDom({ tableId = "", header, data }) {
    // console.log(data);
    return (
        <div style={{overflow:"auto"}}>
            ddd
        
            <table
                id={tableId}
                className="m-5 table-fixed self-start border text-center text-sm font-light dark:border-neutral-500"
                style={{ borderCollapse: "collapse" }}
            >
                <thead className="border-b bg-neutral-800 font-medium text-white dark:border-neutral-500 dark:bg-neutral-900">
                    <tr>
                        {header.map((headerCell, index) => {
                            return (
                                // <th key={index} style={{ width: `${headerCell.width}rem` }}>
                                <th key={index} >
                                    {headerCell.title}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody  className="text-left dark:border-neutral-500">
                    { data.map((row, outerIndex) => {
                        return (
                            <tr key={outerIndex}>
                                {header.map((x, innerIndex) => {
                                    return (
                                        <td
                                            key={`${outerIndex}+${innerIndex}`}
                                            style={{ border: " 1px solid #999999" }}
                                        >
                                            {JSON.stringify(row[x.keyName])}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function ExcelTable() {
    // const _url = `http://localhost:3100/api/v2/erp/dd/quotation`;
    const [data, setData] = useState([]);
    let location = useLocation();
    console.log(location);

    useEffect(() => {
        if (location.pathname === "/dd/tools/quotation") {
            fetch(`http://192.168.0.68:3100/api/v2/erp/dd/quotation`)
                .then((res) => res.json())
                .then((data) => setData(data));
        }
    }, [location, setData]);

 

    return <TableDom tableId="test" header={FanSupplierTableHeaderData} data={data} />;
}

export { ExcelTable };
