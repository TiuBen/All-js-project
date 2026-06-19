import { useContext, useRef, useEffect } from "react";
import { Input } from "../../../../Components";
import { BillContext } from "../../Context/BillContext";

function EditBill() {
    const { BillHeader, SetBillHeader, BillBody, SetBillBody, SelectedIndex, SetSelectedIndex } =
        useContext(BillContext);



    //
    return (
        <div className="overflow-x-auto px-2 flex-1  flex flex-col bg-white m-1 border border-dark-subtle rounded shadow-xl">
            <label className="col-span-4 text-center font-bold text-xl">新建个人报销单</label>
            <div className="flex flex-row justify-evenly">
                <div className="">
                    <label className="block mb-2 font-semibold text-gray-900">报销人:</label>
                    <label className="block mb-2 font-semibold text-gray-900">沈宁</label>
                </div>
                <div className="">
                    <label className="block mb-2 font-semibold text-gray-900">报销事由:</label>
                    <Input
                        value={BillHeader.title}
                        onChange={(e) => {
                            SetBillHeader({ ...BillHeader, title: e.target.value });
                        }}
                    />
                </div>
                <div>
                    <label className="block mb-2 font-semibold text-gray-900">公司</label>
                    <select
                        className="border flex"
                        id="bill-company"
                        value={BillHeader.companyName}
                        // defaultValue="鼎道"
                        onChange={(e) => {
                            SetBillHeader({ ...BillHeader, companyName: e.target.value });
                        }}
                    >
                        <option value="鼎道" >
                            鼎道
                        </option>
                        <option value="韩晶威">韩晶威</option>
                        <option value="安文">安文</option>
                        <option value="海迪龙">海迪龙</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-2 font-semibold text-gray-900">时间</label>
                    <Input
                        type={"date"}
                        value={BillHeader.applyTime}
                        onChange={(e) => {
                            console.log(e.target.value);
                            SetBillHeader({ ...BillHeader, applyTime: e.target.value });
                        }}
                    />
                </div>
            </div>

            <label className="block mb-2 font-semibold text-gray-900">排序/添加/删减项目</label>

            <div className=" flex flex-row justify-start items-center">
                <button
                    className="flex items-center disabled:text-slate-400  disabled:cursor-not-allowed"
                    onClick={() => {
                        var newArray = [...BillBody];
                        newArray.splice(SelectedIndex - 1, 0, newArray.splice(SelectedIndex, 1)[0]);
                        SetBillBody(newArray);
                        SetSelectedIndex(SelectedIndex - 1);
                    }}
                    disabled={SelectedIndex === 0 || BillBody.length <= 1}
                >
                    <span className="material-icons-outlined">arrow_circle_up</span>
                </button>
                <button
                    className="flex items-center disabled:text-slate-400  disabled:cursor-not-allowed"
                    onClick={() => {
                        var newArray = [...BillBody];
                        newArray.splice(SelectedIndex + 1, 0, newArray.splice(SelectedIndex, 1)[0]);
                        SetBillBody(newArray);
                        SetSelectedIndex(SelectedIndex + 1);
                    }}
                    disabled={SelectedIndex === BillBody.length - 1 || BillBody.length <= 1}
                >
                    <span className="material-icons-outlined">arrow_circle_down</span>
                </button>
                <button
                    className="flex items-center disabled:text-slate-400  disabled:cursor-not-allowed"
                    onClick={() => {
                        var newArray = [...BillBody];
                        newArray.splice(SelectedIndex + 1, 0, { title: "新建内容", price: 0.0, count: 0 });
                        SetBillBody(newArray);
                        SetSelectedIndex(BillBody.length === 0 ? 0 : SelectedIndex + 1);
                    }}
                >
                    <span className="material-icons-outlined">add_circle_outline</span>
                </button>
                <button
                    className="flex items-center disabled:text-slate-400  disabled:cursor-not-allowed"
                    onClick={() => {
                        var newArray = [...BillBody];
                        newArray.splice(SelectedIndex, 1);
                        SetBillBody(newArray);
                        SetSelectedIndex(SelectedIndex - 1 === -1 ? 0 : SelectedIndex - 1);
                    }}
                    disabled={BillBody.length === 0}
                >
                    <span className="material-icons-outlined">remove_circle_outline</span>
                </button>
            </div>

            <table className="border-collapse border border-slate-400">
                <thead>
                    <tr>
                        <th className="border border-slate-300">操作</th>
                        <th className="border border-slate-300">序号</th>
                        <th className="border border-slate-300">项目</th>
                        <th className="border border-slate-300">单价</th>
                        <th className="border border-slate-300">数量</th>
                        <th className="border border-slate-300">合计</th>
                        <th className="border border-slate-300">附件</th>
                    </tr>
                </thead>
                <tbody>
                    {BillBody.map((billItem, index) => {
                        return (
                            <tr key={index}>
                                <td className="border border-slate-300 text-center">
                                    <label>选中</label>
                                    <input
                                        type="radio"
                                        name="bill"
                                        checked={index === SelectedIndex}
                                        onChange={(e) => {
                                            SetSelectedIndex(index);
                                        }}
                                    />
                                </td>
                                <td className="border border-slate-300 text-center">{index + 1}</td>
                                <td className="border border-slate-300">
                                    <Input
                                        value={billItem?.title}
                                        onChange={(e) => {
                                            var newArray = [...BillBody];
                                            newArray[index].title = e.target.value;
                                            SetBillBody(newArray);
                                        }}
                                    />
                                </td>
                                <td className="border border-slate-300">
                                    <div className="flex flex-row">
                                        <Input
                                            type="number"
                                            step="0.001"
                                            value={billItem?.price}
                                            onChange={(e) => {
                                                var newArray = [...BillBody];
                                                newArray[index].price = e.target.value;
                                                SetBillBody(newArray);
                                            }}
                                        />
                                        <label htmlFor="" style={{ whiteSpace: "nowrap" }}>
                                            人民币
                                        </label>
                                    </div>
                                </td>
                                <td className="border border-slate-300">
                                    <div className="flex flex-row">
                                        <Input
                                            type="number"
                                            step="1"
                                            value={billItem?.count}
                                            onChange={(e) => {
                                                var newArray = [...BillBody];
                                                newArray[index].count = e.target.value;
                                                SetBillBody(newArray);
                                            }}
                                        />
                                        <label htmlFor="" style={{ whiteSpace: "nowrap" }}>
                                            个
                                        </label>
                                    </div>
                                </td>
                                <td className="border border-slate-300">
                                    {parseFloat(billItem?.price) * parseFloat(billItem?.count)}
                                </td>
                                <td className="border border-slate-300 text-right">
                                    <input type="file" id={`fileInput${index}`} multiple accept="image/*,.pdf "
                                        
                                        onChange={(e)=>{
                                            console.log(e.target.id);
                                            console.log(e.target.files);
                                            if (e.target.files) {
                                                var newArray = [...BillBody];
                                                newArray[index].attachment = e.target.files;
                                                SetBillBody(newArray);
                                            }
                                            
                                       

                                        }}
                                    />
                                    <div>图片,PDF</div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export { EditBill };
