import React, { useState } from "react";
import "./WorkerInformation.scss";
// import WorkerDataService from "../../services/worker.service.js";

const nullWorker = {
    name: "张三",
    sex: "男",
    phone: "1386668823",
    age: 20,
    IDCardNo: "45609090808080980979078",
    SSCardNo: "45609090808080980979078",
    salary: 1233.3,
    entryDate: Date.now(),
    contractID: "0010021",
    emergencyContact: "1354646484648", // email:{}
    // companyPhone:{} // 公司资产部分
};

export default function WorkerInformation() {
    const [worker, setWorker] = useState(nullWorker);

    function handleChange(e) {
        const value = e.target.value;
        e.stopPropagation();
        e.preventDefault();
        setWorker({
            ...worker,
            [e.target.name]: value,
        });
    }
    function submitWorkerData(e) {
        console.log(worker);
        e.stopPropagation();
        e.preventDefault();
        // WorkerDataService.create(worker);
    }

    return (
        <div className="flex-col worker-information-container">
            <div className="flex-row information">
                <label>
                    姓名:
                    <input size="small" name="name" placeholder="请输入姓名" onChange={handleChange} />
                </label>
            </div>
            <div className="flex-row information">
                <label>
                    性别
                    <select name="sex" onChange={handleChange}>
                        <option value="男">男</option>
                        <option value="女">女</option>
                    </select>
                </label>
            </div>
            <div className="flex-row information">
                <label>
                    年龄:
                    <input
                        type="text"
                        name="phone"
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            e.stopPropagation();
                            e.preventDefault();
                            setWorker({
                                ...worker,
                                [e.target.name]: value,
                            });
                        }}
                    />
                </label>
            </div>
            <div className="flex-row information">
                <label>
                    身份证号码:
                    <input type="text" name="IDCardNo" onChange={handleChange} />
                </label>
            </div>
            <div className="flex-row information">
                <label>
                    社保卡号:
                    <input type="text" name="SSCardNo" onChange={handleChange} />
                </label>
            </div>
            <div className="flex-row information">
                <label>
                    薪酬:
                    <input type="text" name="salary" onChange={handleChange} />
                </label>
            </div>
            <div className="flex-row information">
                <label>
                    入职时间:
                    <input
                        type="text"
                        name="entryDate"
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            e.stopPropagation();
                            e.preventDefault();
                            setWorker({
                                ...worker,
                                [e.target.name]: value,
                            });
                        }}
                    />
                </label>
            </div>
            <div className="flex-row information">
                <label>
                    合同编号:
                    <input type="text" name="contractID" onChange={handleChange} />
                </label>
            </div>
            <div className="flex-row information">
                <label>
                    紧急联系人:
                    <input type="text" name="emergencyContact" onChange={handleChange} />
                </label>
            </div>
            <button style={{ alignSelf: "flex-end" }} onClick={submitWorkerData}>
                提交
            </button>
        </div>
    );
}

