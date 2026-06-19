import React, { useContext ,useState} from "react";
import Controls from "./Controls";
import "./FormFactory.scss";
import { FormFactoryProvider, FormFactoryContext } from "./FormFactoryContext";
import { useFormGenerator } from "../../utils";
import ReactJson from 'react-json-view'

function FormFactory() {
    const { formItems, setFormItems, test } = useContext(FormFactoryContext);

    const previewForm = useFormGenerator(formItems, {});
    
    const [first, setfirst] = useState({});

    return (
        <div className="form-factory">
            <div className="header-container my-container">这里输入表单的标题</div>

            <div className="body-container my-container">
                <div className="step-indicator-container my-container">
                    <input className="form-name" type="tex" placeholder="表单名称" />
                    设计表单-事件流程-财务流程
                </div>
                <div className="form-items-container my-container  divide-y-2 flex flex-col">
                    <div>
                        这里是项目列表
                        <button
                            className=" default-button"
                            onClick={() => {
                                console.log(JSON.stringify(formItems));
                                setfirst(formItems);
                            }}
                        >
                            保存表单结构到服务器
                        </button>
                    </div>
                    <table className="">
                        <thead>
                            <th>序号</th>
                            <th>
                                项目名称<span className="text-sm text-red-400">(不能有空格)</span>
                            </th>
                            <th>
                                数据名<span className="text-sm text-red-400">(只能英文)</span>
                            </th>
                            <th>使用控件</th>
                            <th>可选项</th>
                        </thead>
                        {formItems.map((x, index) => {
                            return (
                                <tr>
                                    <td>
                                        <div className="flex flex-row items-center flex-nowrap">
                                            <label className="index-label">{index + 1}</label>
                                            <button className="round-button">
                                                <span class="material-symbols-outlined">arrow_upward</span>
                                            </button>
                                            <button className="round-button">
                                                <span class="material-symbols-outlined">arrow_downward</span>
                                            </button>
                                            <button className="round-button">
                                                <span class="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="">
                                        <input
                                            type="text"
                                            value={x.label}
                                            onChange={(e) => {
                                                const newItems = [...formItems];
                                                var item = newItems[index];
                                                item.label = e.target.value.trim("");
                                                setFormItems(newItems);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={x.keyName}
                                            onChange={(e) => {
                                                // const newItems = [...formItems];
                                                // var item = newItems[index];
                                                // item.dbKeyName = e.target.value;
                                                // setFormItems(newItems);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <span className="font-body font-semibold text-xl text-blue-700 italic">
                                            {x.controlName}
                                        </span>
                                    </td>
                                    <td>可选项</td>
                                </tr>
                            );
                        })}
                    </table>
                    <div className=" self-end">{JSON.stringify(formItems)}</div>
                </div>
                <div className="my-container flex flex-col items-start">
                    <div>
                        预览
                        <button>
                            可修改<span class="material-symbols-outlined">density_small</span>
                        </button>
                        <button>
                            可修改<span class="material-symbols-outlined">format_align_left</span>
                        </button>
                        <span class="material-symbols-outlined">view_list</span>
                        <span class="material-symbols-outlined">format_align_center</span>
                        <span class="material-symbols-outlined">view_column_2</span>
                    </div>
                    <ReactJson src={first} theme="monokai" collapsed={false} enableClipboard={false}   />

                    {/* {previewForm.items} */}
                </div>
                <div className="controller-container my-container">
                    这里是可以用的控件列表
                    <Controls />
                </div>
            </div>
        </div>
    );
}

function FormFactoryWrap() {
    return (
        <FormFactoryProvider>
            <FormFactory />
        </FormFactoryProvider>
    );
}

export { FormFactory, FormFactoryWrap };
