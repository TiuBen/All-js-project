// ! 这里是目前所有可用的控件
import React from "react";

//@STEP 这些是直接可以用的 react 元素
const itemElements = [
    {
        controlName: "短文本",
        element: <input type="text" />,
        option: undefined,
    },
    {
        controlName: "长文字",
        element: <textarea className="border-2 rounded border-blue-400" />,
        option: undefined,
    },
    {
        controlName: "时间",
        element: <input type="time" />,
        option: [],
    },
    {
        controlName: "年月日",
        element: <input type="date" />,
        option: [],
    },
    {
        controlName: "详细时间",
        element: <input type="datetime-local" />,
        option: [],
    },
    {
        controlName: "单选项",
        element: <input type="radio" />,
        option: [],
    },
    {
        controlName: "多选项",
        element: <input type="checkbox" />,
        option: [],
    },
    {
        controlName: "滑动",
        element: <input type="range" />,
        option: [],
    },
    {
        controlName: "数字输入",
        element: <input type="number" />,
        option: [],
    },
    {
        controlName: "文件上传",
        element: <input type="file" />,
        option: [],
    },
    {
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

//@STEP 这里是方便的写法, ItemTypes.XXX 自动就可以出现
const ItemTypes = {
    短文本: <input type="text" />,
    长文本: <textarea className="border-2 rounded border-blue-400" />,
    "时间(小时分)": <input type="time" />,
    "时间(年月日)": <input type="date" />,
    "时间(详细时间)": <input type="datetime-local" />,
    单选: <input type="radio" />,
    多选: <input type="checkbox" />,
    滑块范围输入: <input type="range" />,
    数字输入: <input type="number" />,
    文件上传: <input type="file" />,
    图片上传: "",
    "图片上传(带有预览)": (
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
    下拉选择: "",
};

function name(params) {
    return React.cloneElement(ItemTypes.数字输入, { key: "test", value: "????", name: "22" });
}


// 从后端获取的 https:XXXX.com/form?type="报销"
// 生成 表单
// 为了方便 肯定不能再每个写 onChange方法
// 获取的 value 可以直接 post 到后端 存储为 JSON格式的数据
function  GenerateForm(){

}



export { name };

// 这个组件最后想要的效果
// get form
// https:XXXX.com/form?type="报销"
// post 直接提交
// 从后端获取这个

// 后端保存的表单 要有一定的可读性
// 比如
// const form1 = {
//     id: 1,
//     formName: "报销申请表",
//     formItems: [
//         { label: "申请人", type: "input", keyName: "who" },
//         { label: "申请时间", type: "date", keyName: "time" },
//         { label: "缘由", type: "option", keyName: "reason",props:{options:["选项一","选项二"]} },
//         ....
//     ],
// };

// 后端保存的 数据
// 比如
//  const value={
//     id:1,
//     who:"沈宁",
//     time:"2023-07-23",
//     reason:['选项1']

//  }