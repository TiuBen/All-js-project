import { Container } from "react-bootstrap";
import styles from "./TableStyle.module.scss";

// ,供应商名称(*),供应商地址,联系人,电话,[短信]移动电话,传真,邮箱,名片,主要产品,类别,日期
// 表格的 效果
//  选中 修改 删除 增加  供应商名称 供应商地址 【联系人】【备注内容】【财务】



const TableHeader = ["序号", "操作", "供应商名称", "供应商地址", "产品类别", "产品详细", "联系方式"];

function TestReactTable({ tableData }) {

    return (
        <Container>
            <table className={styles["react-table"]}>
                <thead>
                    <tr>
                        {TableHeader.map((thData, index) => {
                            return <td key={index}>{thData} </td>;
                        })}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((tableRowData, index) => {
                        return (
                            <tr key={index}>
                                <td>{tableRowData.id}</td>
                                <td>
                                    <div style={{ display: "inline-flex", flexDirection: 'row' }}>
                                        <input type="radio" id={`radio-${index}`} name="action" />
                                        <label htmlFor={`radio-${index}`}>选中</label>
                                    </div>
                                </td>

                                <td>{tableRowData.rawData.name}</td>
                                <td>{tableRowData.rawData.address}</td>
                                <td>{tableRowData.rawData.category}</td>
                                <td>{tableRowData.rawData.detail}</td>
                                <td className="contact-detail-cell">
                                    {tableRowData.rawData.staff.map((s, index2) => {
                                        return (
                                            <div key={index2}>
                                                <div
                                                    className="border"
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <div>{s.name} </div>
                                                    <ul>
                                                        {s.contact.map((c, index3) => {
                                                            return <li key={index3}>{`${c.type}:${c.content}`}</li>;
                                                        })}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Container >
    );
}

export default TestReactTable;




// const TableHeader = [
//     { heder: "序号", accessor: "" },
//     { heder: "操作", accessor: "" },
//     { heder: "供应商名称", accessor: "name" },
//     { heder: "供应商地址", accessor: "address" },
//     { heder: "产品类别", accessor: "category" },
//     { heder: "产品详细", accessor: "detail" },
//     { heder: "联系方式", accessor: "staff" },
// ];