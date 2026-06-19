import { useState, useEffect } from "react";
import useSWRMutation from "swr/mutation";
import { ErpBaseURL } from "utils/URLS";
import { initSupplierObject } from "assert/initSupplierObject";

async function sendRequest(url, { arg }) {
    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
    }).then((res) => res.json());
}

function AddSupplierDiv() {
    const [supplier, setSupplier] = useState(initSupplierObject);

    const [canSubmit, setCanSubmit] = useState(false);

    const { trigger, isMutating } = useSWRMutation(ErpBaseURL + "/dd/supplier", sendRequest);

    useEffect(() => {
        if (
            typeof supplier.name === "string" &&
            supplier.name.trim() !== "" &&
            supplier.detail.trim() !== "" &&
            supplier.staff[0].contact[0].content.trim() !== ""
        ) {
            setCanSubmit(true);
        }
    }, [supplier]);

    return (
        <div className="d-flex flex-column w-100">
            <div className="d-flex flex-row  justify-content-between m-1">
                <button
                    type="button"
                    className="btn btn-primary d-flex flex-grow-0 align-self-center"
                    disabled={!canSubmit}
                    onClick={async (e) => {
                        e.preventDefault();

                        try {
                            const result = await trigger(supplier);
                            setSupplier({
                                name: "",
                                address: "",
                                category: "",
                                detail: "",
                                staff: [
                                    {
                                        name: "",
                                        contact: [{ type: "电话", content: "" }],
                                    },
                                ],
                            }); //保存好以后重置 Supplier
                            console.log(result);
                        } catch (e) {
                            console.error(e);
                        }
                    }}
                >
                    保存
                </button>
                <button
                    type="button"
                    className="btn btn-primary d-flex flex-grow-0 align-self-center"
                    onClick={async (e) => {
                        e.preventDefault();
                        setSupplier({
                            name: "",
                            address: "",
                            category: "",
                            detail: "",
                            staff: [
                                {
                                    name: "",
                                    contact: [{ type: "电话", content: "" }],
                                },
                            ],
                        }); //保存好以后重置 Supplier
                    }}
                >
                    放弃
                </button>
            </div>
            <div className="d-flex flex-column  border p-1 m-1  ">
                <label className="font-italic text-danger text-center bg-light">
                    至少需要填写 “供应商名称” “主要产品” 和 一个“电话”
                </label>
                <div className="d-inline-flex flex-row p-1 m-1 ">
                    <label htmlFor="supplier-name">供应商名称: </label>
                    <input
                        id="supplier-name"
                        name="name"
                        className="d-flex flex-grow-1 m-1"
                        onChange={(e) => {
                            const _s = { ...supplier };
                            _s.name = e.target.value;
                            setSupplier(_s);
                        }}
                        value={supplier.name}
                    />
                </div>
                <div className="d-inline-flex flex-row p-1 m-1 ">
                    <div htmlFor="supplier-address">供应商地址: </div>
                    <input
                        id="supplier-address"
                        name="address"
                        className="d-flex flex-grow-1 m-1"
                        onChange={(e) => {
                            const _s = { ...supplier };
                            _s.address = e.target.value;
                            setSupplier(_s);
                        }}
                        value={supplier.address}
                    />
                </div>
                <div className="d-flex flex-row border align-items-start  p-1 m-1 ">
                    <label className="m-1" htmlFor="supplier-category">
                        产品类别:
                    </label>
                    <div className="d-flex flex-column">
                        <input
                            id="supplier-category"
                            className="m-1"
                            name="category"
                            onChange={(e) => {
                                const _s = { ...supplier };
                                _s.category = e.target.value;
                                setSupplier(_s);
                            }}
                            value={supplier.category}
                        />
                        <label className="font-italic text-danger text-center bg-light">用 ; 分隔开</label>
                    </div>
                    <label className="m-1" htmlFor="supplier-category-detail">
                        主要产品
                    </label>
                    <textarea
                        id="supplier-category-detail"
                        name="detail"
                        className="m-1 d-flex flex-grow-1"
                        onChange={(e) => {
                            const _s = { ...supplier };
                            _s.detail = e.target.value;
                            setSupplier(_s);
                        }}
                        value={supplier.detail}
                    />
                </div>

                {supplier.staff.map((s, index) => {
                    return (
                        <div key={index} className="d-flex border p-1 m-1 align-items-start ">
                            <button
                                className=" btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                    const _s = { ...supplier };
                                    _s.staff.splice(index, 1);
                                    // 至少要有一个联系人
                                    if (_s.staff.length === 0) {
                                        _s.staff.push({
                                            name: "",
                                            contact: [{ type: "电话", content: "" }],
                                        });
                                    }

                                    setSupplier(_s);
                                }}
                            >
                                删除
                            </button>
                            <div className="d-inline-flex  flex-row p-1 m-1">
                                <label htmlFor="contact-person-name">联系人：</label>
                                <input
                                    id="contact-person-name"
                                    name=""
                                    className="d-inline-flex flex-grow-1"
                                    onChange={(e) => {
                                        console.log("修改联系人姓名");
                                        const _s = { ...supplier };
                                        _s.staff[index].name = e.target.value;
                                        setSupplier(_s);
                                    }}
                                    value={s.name}
                                />
                            </div>
                            <div className="flex-column p-1 m-1 flex-grow-1">
                                {s.contact.map((c, innerIndex) => {
                                    return (
                                        <div key={innerIndex} className="flex-row ">
                                            <select
                                                name="contact-information-category"
                                                // defaultValue={"电话"}
                                                value={c.type || "电话"}
                                                onChange={(e) => {
                                                    console.log("修改联系方式");
                                                    const _s = { ...supplier };
                                                    _s.staff[index].contact[innerIndex].type = e.target.value;
                                                    setSupplier(_s);
                                                }}
                                            >
                                                <option value={"电话"}>电话</option>
                                                <option value={"邮箱"}>邮箱</option>
                                                <option value={"QQ"}>QQ</option>
                                                <option value={"传真"}>传真</option>
                                                <option value={"其他"}>其他</option>
                                            </select>
                                            <input
                                                name="contact-information"
                                                className="d-flex flex-grow-1"
                                                onChange={(e) => {
                                                    console.log("修改联系方式");
                                                    const _s = { ...supplier };
                                                    _s.staff[index].contact[innerIndex].content = e.target.value;
                                                    setSupplier(_s);
                                                }}
                                                value={c.content}
                                            />
                                            <div className=" btn-outline-danger">
                                                <i
                                                    class="bi bi-x-circle"
                                                    onClick={(e) => {
                                                        const _s = { ...supplier };
                                                        _s.staff[index].contact.splice(innerIndex, 1);
                                                        if (_s.staff[0].contact.length === 0) {
                                                            _s.staff[0].contact.push({ type: "电话", content: "" });
                                                        }
                                                        setSupplier(_s);
                                                    }}
                                                ></i>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                class="d-flex btn btn-outline-primary  btn-sm p-1 m-1"
                                onClick={(e) => {
                                    console.log("添加联系方式");
                                    const _s = { ...supplier };
                                    _s.staff[index].contact.push({ type: "电话", content: "" });

                                    setSupplier(_s);
                                }}
                            >
                                添加联系方式
                            </button>
                        </div>
                    );
                })}
                <button
                    type="button"
                    class="btn btn-outline-primary btn-sm d-flex align-self-center"
                    onClick={(e) => {
                        console.log("添加 联系人");
                        const _s = { ...supplier };
                        _s.staff.push({
                            name: "",
                            contact: [{ type: "", content: "" }],
                        });

                        setSupplier(_s);
                    }}
                >
                    添加 联系人
                </button>
                <div className="d-flex flex-column border  p-1 m-1 ">
                    <div className="text-white text-center bg-danger">上传名片功能暂时不可用</div>

                    <label htmlFor="">名片 </label>
                    <input type="file" />
                    <img
                        height={150}
                        width={250}
                        alt="171x180"
                        src="https://pic3.zhimg.com/v2-498c735f1073afd9460c27aa6bf095ba_b.jpg"
                    />
                </div>
            </div>
        </div>
    );
}

export default AddSupplierDiv;
