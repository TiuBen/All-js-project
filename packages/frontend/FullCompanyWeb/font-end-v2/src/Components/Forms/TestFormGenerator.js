import React, { useState, useEffect, createElement, useMemo, useCallback } from "react";
import { useRef } from "react";
import { Request } from "../../utils";
// import {axios} from '../../utils/index';
const Types = {
    button: "button",
    checkbox: "checkbox",
    color: "color",
    date: "date",
    datetimeLocal: "datetime-local",
    email: "email",
    file: "file",
    hidden: "hidden",
    image: "image",
    month: "month",
    number: "number",
    password: "password",
    radio: "radio",
    range: "range",
    reset: "reset",
    search: "search",
    submit: "submit",
    tel: "tel",
    text: "text",
    time: "time",
    url: "url",
    week: "week",
    select: "select", // option 是在 select 元素里的,配合<optgroup>
    option: "option", //option 是在 select 元素里的,配合<optgroup>
};

const FormConfig = {
    initFunction: () => {},
    submintFuntion: () => {},
    formItems: [
        {
            label: "序号", //标题的内容
            innerElement: {
                type: Types.text, // 对应的input的ID
                valueKey: "name",
            },
        },
        {
            label: "性别", //标题的内容
            innerElement: [
                {
                    label: "男",
                    innerElement: {
                        type: Types.radio,
                        valueKey: "sex",
                        value: "男",
                    },
                },
                {
                    label: "女", //标题的内容
                    innerElement: {
                        type: Types.radio,
                        valueKey: "sex",
                        value: "女",
                    },
                },
            ],
        },
    ],
};

var _elements = [];
function genItems(config, props) {
    let outerElement;
    if (Array.isArray(config)) {
        for (let index = 0; index < config.length; index++) {
            const item = config[index];
            if (Array.isArray(item.innerElement)) {
                console.log("Array");
                let outerElement = <label className="form-label">{item.label}</label>;
                genItems(item.innerElement);
            } else {
                console.log("Obj");
                console.log(item);
                let element = (
                    <label className="form-label">
                        {item.label}
                        <input
                            className="form-input"
                            type={item.innerElement.type || "text"}
                            value={item.innerElement.valueKey}
                            onChange={(e) => console.log(e)}
                        />
                    </label>
                );

                _elements.push(element);
            }
        }
        _elements.push();
    } else {
    }

    // return _elements;
}

//#MARK  label keyName 是必须的
//  <label for="fname">First name:</label><br>
//  <input type="text" id="fname" name="fname"><br></br>
// 用label的 for 属性来 确认 input ;input 的 id 和 label关联; input的name 属性 用来 获取 e.target.value;

// 常见的input 的type

const initFunction = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ id: "1", title: "titile", price: 3 });
        }, 1000);
    });
};
var V2 = { AA1: "111", BBradio: "单选1 ", CCcheckbox: [] };
const simple = [
    { label: "序号1", keyName: "AA1" },
    { label: "序号2", keyName: "AA2", type: Types.date },
    { label: "测试file", keyName: "singleFile", type: Types.file },
    { label: "测试files", keyName: "multiFiles", type: Types.file },
    { label: "测试单张图片", keyName: "singleImage", type: Types.image },
    { label: "单选", keyName: "BBradio", type: "radio", options: ["单选1", "单选2"] },
    {
        label: "多选",
        keyName: "CCcheckbox",
        type: "checkbox",
        options: ["选项多选1", { value: "选项2的值", label: "显示的选项2" }],
    },
    {
        label: "select元素",
        keyName: "DDcheckbox",
        type:Types.select,
        options: ["选项多选1", { value: "选项2的值", label: "显示的选项2" }],
    },
];

function TestFormGenerator(fromConfig, value, setValue) {
    let formItems = [];

    fromConfig.forEach((item, index) => {
        if (Object.keys(value).includes(item.keyName)) {
        } else {
            let _newValue = { ...value };
            _newValue[item.keyName] = undefined;
            setValue(_newValue);
        }
        if ((item?.type === "radio" || item?.type === "checkbox") && Array.isArray(item?.options)) {
            let element = (
                <label key={index}>
                    {item.label}:
                    {item.options.map((op, i) => {
                        let x = op?.value || op;
                        return (
                            <div key={i}>
                                <input
                                    type={item.type}
                                    id={item.type + x + i}
                                    value={x}
                                    name={item.keyName}
                                    checked={
                                        item.type === Types.radio
                                            ? value[item.keyName] === x
                                            : value[item.keyName].includes(x)
                                    }
                                    onChange={(e) => {
                                        let _newValue = { ...value };
                                        if (item.type === Types.radio) {
                                            console.log("单选");
                                            _newValue[e.target.name] = e.target.value;
                                        } else if (item.type === Types.checkbox) {
                                            console.log("多选");

                                            if (_newValue[e.target.name].includes(e.target.value)) {
                                                let newOp = _newValue[e.target.name].filter(
                                                    (x) => x !== e.target.value
                                                );
                                                _newValue[e.target.name] = newOp;
                                            } else {
                                                _newValue[e.target.name].push(e.target.value);
                                            }
                                        }
                                        console.log(_newValue[e.target.name]);

                                        setValue(_newValue);
                                    }}
                                />
                                <label key={i} htmlFor={item.type + x + i}>
                                    {op?.label || op}
                                </label>
                            </div>
                        );
                    })}
                </label>
            );
            formItems.push(element);
        } else if (item?.type === Types.select || item?.type === Types.option) {
            let element = (
                <label key={index}>
                    {item.label}:
                    <select
                        name={item.keyName}
                        onChange={(e) => {
                            e.preventDefault();
                            let _newValue = { ...value };
                            _newValue[e.target.name] = e.target.value;
                            setValue(_newValue);
                        }}
                    >
                        {item.options.map((op, i) => {
                            let x = op?.value || op;
                            return (
                                <option key={i} id={item.type + x + i} value={x} name={item.keyName}>
                                    {op?.label || op}
                                </option>
                            );
                        })}
                    </select>
                </label>
            );
            formItems.push(element);
        } else if (item?.type === Types.image) {
            //#MARK 图片 不能有 value
            let element = (
                <label key={index}>
                    {item.label}:
                    <input
                        type={item.type}
                        name={item.keyName}
                        // value={value[item.keyName]}
                        alt="fffffff"
                        onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // let _newValue = { ...value };
                            // _newValue[e.target.name] = e.target.value;
                            // setValue(_newValue);
                        }}
                    />
                </label>
            );
            formItems.push(element);
        } else {
            // 普通 文本输入 之类的
            let element = (
                <label key={index}>
                    {item.label}:
                    <input
                        type={item?.type || "text"}
                        name={item.keyName}
                        value={value[item.keyName]}
                        onChange={(e) => {
                            e.preventDefault();
                            let _newValue = { ...value };
                            _newValue[e.target.name] = e.target.value;
                            setValue(_newValue);
                        }}
                    />
                </label>
            );
            formItems.push(element);
        }
    });

    return (
        <>
            {formItems.map((x) => {
                return x;
            })}
        </>
    );
}

function XXXXX() {
    const [value, setValue] = useState(V2);

    return (
        <form
            className="flex flex-col"
            onSubmit={(e) => {
                e.preventDefault();
            }}
        >
            {TestFormGenerator(simple, value, setValue)}
            <input
                className="border  text-lg border-black w-fit flex-shrink-0"
                type="submit"
                value="发送到服务器"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    var _formData = new FormData();
                    Object.entries(value).forEach(([key, value]) => {
                        console.log(key + "" + value);
                        _formData.append(key, value);
                    });

                    Request.post("/formdata", _formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    });
                }}
            />
            <select
                name="select"
                onChange={(e) => {
                    e.preventDefault();
                    console.log(e.target.name + "::" + e.target.value);
                }}
            >
                test select
                <optgroup label="Group 1">
                    <option value="Option 1.1">Option 1.1</option>
                </optgroup>
                <optgroup label="Group 2">
                    <option value="Option 2.1">Option 2.1</option>
                    <option value="Option 2.1">Option 2.2</option>
                </optgroup>
                <optgroup label="Group 3" disabled>
                    <option>Option 3.1</option>
                    <option>Option 3.2</option>
                    <option>Option 3.3</option>
                </optgroup>
            </select>
        </form>
    );
}

const test = [
    { label: "1", content: { type: "text", keyName: "a" } },
    {
        name: "有",
        content: [
            { type: "radio", keyName: "2" },
            { name: "3", content: "c" },
        ],
    },
    // {
    //     name: "DDD",
    //     content: [
    //         { name: "AA", content: "AA" },
    //         {
    //             name: "BB",
    //             content: [
    //                 { name: "2", content: "b" },
    //                 { name: "3", content: "c" },
    //             ],
    //         },
    //     ],
    // },
];

var eles = [];
var V = { 1: "1111", 有: "", 2: "2222", 3: "3333" };
function testF(x, V, onChange) {
    let i = (
        <label key={eles.length} className="form-label" htmlFor={x.name}>
            {x.name}
        </label>
    );

    if (Array.isArray(x.content)) {
        eles.push(i);

        for (let index = 0; index < x.content.length; index++) {
            let y = x.content[index];
            testF(y, V, onChange);
        }
    } else {
        eles.push(i);
        let j = (
            <input
                key={eles.length}
                className="form-input"
                type="text"
                id={x.name}
                name={x.name}
                value={V[x.name] || x.content}
                onChange={(e) => {
                    // console.log(e.target.name + ":" + e.target.value);
                    const _new = { ...V };
                    _new[e.target.name] = e.target.value;
                    onChange(_new);
                }}
            />
        );
        eles.push(j);
    }
}

function All() {
    const [ss, setSS] = useState(V);
    eles = [];
    test.forEach((value) => {
        testF(value, ss, setSS);
    });

    return (
        <div className="flex flex-col">
            {eles.map((e, index) => {
                return e;
            })}
        </div>
    );
}

// all();

export { XXXXX, TestFormGenerator, simple, All };
