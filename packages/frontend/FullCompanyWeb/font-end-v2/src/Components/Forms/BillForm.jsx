import React from "react";
import {tableHeader,billObject,TestFormGenerator} from "./TestFormGenerator";


function EditRow({ edit }) {
    if (edit) {
        return (
            <tr>
                <td className="text-gray-500">
                    <div className=" flex flex-row justify-center items-center">
                        <span class="material-icons-outlined">arrow_circle_up</span>
                        <span class="material-icons-outlined">arrow_circle_down</span>
                        <span class="material-icons-outlined">add_circle_outline</span>
                        <span class="material-icons-outlined">remove_circle_outline</span>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td>1</td>
            <td>Design UX and UI</td> <td>20</td> <td>300</td> <td>6000</td>
        </tr>
    );
}

function BillForm({ edit = false }) {
    



    return (
        <div className="w-full h-full flex flex-col justify-center align-middle">
            <div className="w-4/5 h-4/5 flex flex-col  self-center border border-red-400 bg-zinc-50 overflow-x-auto p-12">
                {/* 第一部分
                标题 */}

                <section className="grid grid-flow-col justify-stretch text-2xl font-bold  ">
                    <div className="text-2xl font-bold">
                        <div className="">个人报销</div>
                        <div>编号:000001</div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div>公司的名字</div>
                        <div className=" text-xl font-sans font-medium">沈宁</div>
                        <div className=" text-xl font-sans font-medium">2023-04-26</div>
                    </div>
                </section>
                {/* 第二部分
                描述 */}
                <div className=" ">
                    <h1 className="text-xl font-bold">详细:</h1>

                    {/* <div className="flex flex-row">
                        <span class="material-icons-outlined inline-block">edit</span>
                        <p>这个发票是因为什么事情产生的,需要报销</p>
                    </div> */}

                    <div className="flex flex-row items-center">
                        <span className="material-icons-outlined inline-block">edit</span>
                        <input
                            className="w-full inset-2 p-2"
                            placeholder="这个发票是因为什么事情产生的,需要报销"
                        ></input>
                    </div>
                </div>

                <form className="flex-1">
                    <table className="w-full border border-gray-200 p-4 rounded-lg space-y-4">
                        <thead className="border-b border-gray-400">
                            <tr>
                                <td className="text-center ">操作</td>
                                <td>序号</td>
                                <td>项目</td>
                                <td>单价</td>
                                <td>数量</td>
                                <td>合计</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="leading-9 border-b border-gray-200">
                                <td className="text-gray-500">
                                    <div className=" flex flex-row justify-center items-center">
                                        <span className="material-icons-outlined">arrow_circle_up</span>
                                        <span className="material-icons-outlined">arrow_circle_down</span>
                                        <span className="material-icons-outlined">add_circle_outline</span>
                                        <span className="material-icons-outlined">remove_circle_outline</span>
                                    </div>
                                </td>
                                <td>1</td>
                                <td>Design UX and UI</td> 
                                <td>20</td> 
                                <td>300</td> 
                                <td>6000</td>
                            </tr>
                            <tr className="leading-9">
                                <td className="text-gray-500">
                                    <div className=" flex flex-row justify-center items-center">
                                        <span className="material-icons-outlined">arrow_circle_up</span>
                                        <span className="material-icons-outlined">arrow_circle_down</span>
                                        <span className="material-icons-outlined">add_circle_outline</span>
                                        <span className="material-icons-outlined">remove_circle_outline</span>
                                    </div>
                                </td>
                                <td>1</td>
                                <td>Design UX and UI</td> <td>20</td> <td>300</td> <td>6000</td>
                            </tr>
                        </tbody>
                    </table>
                </form>
                <div className=" text-right  mb-10">
                    <div>
                        <div>总计</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { BillForm };
