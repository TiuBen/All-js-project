import { useState, useRef, useEffect, useCallback } from "react";
import { Container } from "react-bootstrap";
import AddSupplierDiv from "./AddSupplierDiv";
import TestReactTable from "./TestReactTable";
import { useGetSupplier, COMPANY, ITEM, useGetFromServer } from "../../services/index.js";
import { testSupplier } from "assert/testSupplierObject";
import Item from "antd/es/list/Item";

function ErpSupplierPage({ companyName }) {
    const [isNewSupplierSubmitted, setIsNewSupplierSubmitted] = useState(false);

    const [showCreateComponent, setShowCreateComponent] = useState(false);
    const dialog = useRef(null);

    // 从服务器获取整个XX公司的供应商
    const { data, isError, isLoading } = useGetSupplier("dd");
    // const { data, isError, isLoading } = useGetSupplier(COMPANY.dd,ITEM.supplier);

    const onClick = useCallback(
        ({ target }) => {
            const { current: el } = dialog;
            if (target === el) {
                setShowCreateComponent(!showCreateComponent);
            }
        },
        [showCreateComponent]
    );

    useEffect(() => {
        if (dialog.current) {
            if (showCreateComponent) {
                // without this test, hot reload will error out when the modal is still visible
                if (!dialog.current.open) {
                    dialog.current.showModal();
                }
            } else {
                dialog.current.close();
            }
        }
    }, [showCreateComponent]);

    useEffect(() => {}, [isNewSupplierSubmitted]);

    return (
        <Container className="d-flex flex-column m-3">
            <button
                className="btn  btn-secondary"
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fetch("http://localhost:3100/api/v2/erp/dd/supplier", {
                        method: "POST", // *GET, POST, PUT, DELETE, etc.
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(testSupplier), // body data type must match "Content-Type" header
                    });
                }}
            >
                测试提交数据
            </button>
            <h3>{companyName}的供应商</h3>
            <div className="d-flex flex-row">
                <input className="flex-grow-1" placeholder="关键字:" />
                <button className="btn  btn-outline-secondary" type="button" id="button-addon2">
                    搜索
                </button>
            </div>

            <button
                className="d-flex btn  btn-primary align-self-center"
                aria-controls="example-collapse-text"
                onClick={(e) => {
                    setShowCreateComponent(!showCreateComponent);
                }}
            >
                新建供应商
            </button>

            <dialog ref={dialog} role="none" onClick={onClick}>
                <AddSupplierDiv />
            </dialog>

            {data ? <TestReactTable tableData={data} /> : <h1>Loading</h1>}
        </Container>
    );
}

export default ErpSupplierPage;
