import React, { useContext } from "react";
import "./FormFactory.scss";
import "./FormFactoryContext";
import { FormFactoryContext, FormFactoryProvider } from "./FormFactoryContext";
import { Types } from "../../utils";
import ImageUploader from "../../Components/ImageUploader/ImageUploader";

const availableControls = [
    {
        label: "名称",
        keyName: "keyName",
        type: Types.text,
        controlName: "短文本",
        element: <input type="text" />,
        option: "undefined",
    },
    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.textarea,
        controlName: "长文字",
        element: <textarea  />,
        option: undefined,
    },
    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.time,
        controlName: "时间",
        element: <input type="time"  />,
        option: [],
    },
    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.date,
        controlName: "年月日",
        element: <input type="date" />,
        option: [],
    },
    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.date,
        controlName: "年月日",
        element: <input type="color" />,
        option: [],
    },
    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.datetimeLocal,
        controlName: "详细时间",
        element: <input type="datetime-local" />,
        option: [],
    },
    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.radio,
        controlName: "单选项",
        element: <input type="radio" />,
        option: [],
    },
    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.checkbox,
        controlName: "多选项",
        element: <input type="checkbox" />,
        option: [],
    },
    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.range,
        controlName: "滑动",
        element: <input type="range" />,
        option: [],
    },
    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.number,
        controlName: "数字输入",
        element: <input type="number" />,
        option: [],
    },
    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.file,
        controlName: "文件上传",
        element: <input type="file" />,
        option: [],
    },

    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.file,
        controlName: "文件上传",
        element: <ImageUploader/>,
        option: [],
    },
    {
        label: "输入名称",
        keyName: "keyName",
        type: Types.file,
        controlName: "图片上传",
        element: (
            <div>
                <div
                    className="border border-black overflow-auto p-1"
                    style={{
                        height: "100px",
                    }}
                >
                    <canvas className="border border-red-400" width="80" height="80" />
                </div>
                <input type="file" />
            </div>
        ),
        option: [],
    },
];

function Controls() {
    const { formItems, setFormItems, test } = useContext(FormFactoryContext);
    // console.log(availableControls);
    return (
        <ul className="form-factory control-list divide-y">
            {availableControls.map((x, index) => {
                return (
                    <li key={index} className="flex flex-row items-start py-2">
                        <button
                            className=" rounded mx-2 p-0 hover:bg-slate-300 border border-neutral-400  w-[8rem] "
                            onClick={(e) => {
                                const item = { ...x };
                                const newItems = [...formItems, item];
                                setFormItems(newItems);
                            }}
                        >
                            <span class="material-symbols-outlined">add</span>
                            {x.controlName}
                        </button>
                        <div className="">{x.element}</div>
                    </li>
                );
            })}
        </ul>
    );
}

export default Controls;

{
    /* <li>
<button
    onClick={(e) => {
        const item = {
            label: "项目",
            keyName: "数据库中名称",
            type: "input",
            itemProps: { type: "text" },
            children: [],
        };
        const newItems = [...formItems, item];
        setFormItems(newItems);
    }}
>
    <span class="material-symbols-outlined">add</span>简单文本
</button>
</li>
<li>
<button
    onClick={(e) => {
        const item = {
            key: 1,
            type: "textarea",
            itemProps: {},
            children: [],
        };
        const newItems = [...formItems, item];
        setFormItems(newItems);
    }}
>
    <span class="material-symbols-outlined">add</span>长文本
</button>
</li> */
}
