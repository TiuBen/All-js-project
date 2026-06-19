import React, { useState, useEffect } from "react";
// ! 常见的input 的type
const Types = {
    button: "button",
    checkbox: "checkbox",
    color: "color",
    date: "date",
    datetimeLocal: "datetime-local",
    email: "email",
    file: "file",
    hidden: "hidden",
    image: "image", //! 这个要特别注意
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
    textarea: "textarea",
    select: "select", // option 是在 select 元素里的,配合<optgroup>
    option: "option", //option 是在 select 元素里的,配合<optgroup>
};
// !  label keyName 是必须的
//  <label for="fname">First name:</label><br>
//  <input type="text" id="fname" name="fname"><br></br>
// 用label的 for 属性来 确认 input ;input 的 id 和 label关联; input的name 属性 用来 获取 e.target.value;

const TestFormConfig = [
    { label: "序号1", keyName: "AA1" },
    { label: "序号2", keyName: "AA2", type: Types.date },
    { label: "测试file", keyName: "singleFile", type: Types.file },
    { label: "测试files", keyName: "multiFiles", type: Types.file },
    { label: "测试单张图片", keyName: "singleImage", type: Types.image, custom: { width: 120, height: 120 } },
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
        type: Types.select,
        options: ["选项多选1", { value: "选项2的值", label: "显示的选项2" }],
    },
];

function useFormGenerator(fromConfig, initValue) {
    console.log(fromConfig);
    console.log("initValue");
    console.log(initValue);
    const [value, setValue] = useState({});
    let formItems = [];
    // @STEP 初始化
    useEffect(() => {

        fromConfig.forEach((item, index) => {
            if (Object.keys(initValue).includes(item.keyName)) {
                value[item.keyName]=initValue[item.keyName];
            } else {
                value[item.keyName] = undefined;
            }
        });
        const _new={...value};
        setValue(_new);
        console.log("value");
        console.log(value);
    }, []);

    // @STEP 返回form的子元素
    fromConfig.forEach((item, index) => {
        // ! 单选 radio
        if (item?.type === "radio" && Array.isArray(item?.options)) {
            let element = (
                <>
                    <label key={index} className="form-label">
                        {item.label}
                    </label>
                    {item?.options.map((op, i) => {
                        return (
                            <div>
                                <input
                                    className="ml-1 "
                                    type={Types.radio}
                                    id={item.type + item.keyName + i}
                                    value={op?.value ?? op}
                                    checked={op?.value ?? op === value[item.keyName]}
                                    name={item.keyName}
                                    onChange={(e) => {
                                        console.log(e.target.value + ":" + e.target.checked);
                                        console.log("单选");
                                        if (e.target.checked) {
                                            value[e.target.name] = e.target.value;
                                        }
                                        const _new = { ...value };
                                        setValue(_new);
                                    }}
                                />
                                <label
                                    key={i}
                                    htmlFor={item.type + item.keyName + i}
                                    className="ml-1 text-lg font-medium"
                                >
                                    {op?.label ?? op}
                                </label>
                            </div>
                        );
                    })}
                </>
            );
            formItems.push(element);
        }
        // ! checkbox 可以多选
        else if (item?.type === Types.checkbox && Array.isArray(item?.options)) {
            let element = (
                <>
                    <label key={index} className="form-label">
                        {item.label}
                    </label>
                    {item?.options.map((op, i) => {
                        return (
                            <div>
                                <input
                                    className="ml-1 "
                                    type={Types.checkbox}
                                    id={item.type + item.keyName + i}
                                    value={op?.value ?? op}
                                    checked={value[item.keyName]?.includes(op?.value ?? op)}
                                    name={item.keyName}
                                    onChange={(e) => {
                                        console.log(e.target.value + ":" + e.target.checked);

                                        console.log("多选");
                                        if (e.target.checked) {
                                            const newCheckbox = [...value[e.target.name]];
                                            newCheckbox.push(e.target.value);
                                            value[e.target.name] = newCheckbox;
                                        } else {
                                            const newCheckbox = [
                                                ...value[e.target.name].filter((v) => v !== e.target.value),
                                            ];

                                            value[e.target.name] = newCheckbox;
                                        }
                                    }}
                                />
                                <label
                                    key={i}
                                    htmlFor={item.type + item.keyName + i}
                                    className="ml-1 text-lg font-medium"
                                >
                                    {op?.label ?? op}
                                </label>
                            </div>
                        );
                    })}
                </>
            );
            formItems.push(element);
        }
        // ! 单选 select
        else if (item?.type === Types.select || item?.type === Types.option) {
            // ! select option
            let element = (
                <label key={index} className="form-label">
                    {item.label}:
                    <select
                        className="ml-1 form-input w-auto"
                        name={item.keyName}
                        value={value[item.keyName]}
                        onChange={(e) => {
                            e.preventDefault();
                            value[e.target.name] = e.target.value;
                            const _new = { ...value };
                            setValue(_new);
                        }}
                    >
                        {item.options.map((op, i) => {
                            return (
                                <option
                                    className="ml-1 text-lg font-medium"
                                    key={i}
                                    id={item.type + item.keyName + i}
                                    value={op?.value ?? op}
                                    name={item.keyName}
                                >
                                    {op?.label ?? op}
                                </option>
                            );
                        })}
                    </select>
                </label>
            );
            formItems.push(element);
        } else if (item?.type === Types.image) {
            //! 图片 不能有 value
            const width = item?.custom?.width ?? 100;
            const height = item?.custom?.height ?? item?.custom?.width ?? 100;
            // const height=item?.custom?.height??100;
            let imgCanvasRef = React.createRef(item.keyName);
            let element = (
                <div>
                    <label key={index}>{item.label}:</label>
                    <div
                        className="border border-black overflow-auto p-1"
                        style={{
                            maxWidth: `${width}px`,
                            minWidth: `${width}px`,
                            maxHeight: `${height}px`,
                            minHeight: `${height}px`,
                        }}
                    >
                        <canvas ref={imgCanvasRef} className="border border-red-400" width={width} height={height} />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        name={item.keyName}
                        alt="图片??/"
                        onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            console.log(imgCanvasRef.current);
                            console.log(e.target.files[0].name);
                            //! 这里还是存文件名称
                            // user[e.target.name] = e.target.files[0].name;

                            // 预览图片的逻辑
                            var context = imgCanvasRef.current.getContext("2d");
                            var reader = new FileReader();

                            reader.onload = () => {
                                var img = new Image();
                                img.onload = () => {
                                    imgCanvasRef.current.width = img.width;
                                    imgCanvasRef.current.height = img.height;
                                    context.drawImage(
                                        img,
                                        0,
                                        0
                                        // img.width,
                                        // img.height,
                                        // 0,
                                        // 0,
                                        // img.width,
                                        // img.height
                                    );
                                };
                                // if (reader.readyState===FileReader.DONE) {
                                //     console.log('======');
                                //     img.src=e.target.files[0];

                                // }
                                img.src = reader.result;
                            };
                            reader.readAsDataURL(e.target.files[0]);
                            value[e.target.name] = e.target.value;
                        }}
                    />
                </div>
            );
            formItems.push(element);
        } else if (item?.type === Types.textarea) {
            // 长文本 输入 之类的
            let element = (
                <label key={index} className="form-label">
                    {item.label}:{JSON.stringify(value)}
                    <textarea
                        className="form-input"
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
        } else {
            // 普通 文本输入 之类的
            let element = (
                <label key={index} className="form-label">
                    {item.label}
                    <input
                        className="form-input"
                        type={item?.type || "text"}
                        name={item.keyName}
                        value={value[item.keyName]}
                        onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            value[e.target.name] = e.target.value;
                            const _new = { ...value };
                            setValue(_new);
                        }}
                    />
                </label>
            );
            formItems.push(element);
        }
    });

    return {
        items: formItems,
        value: value,
    };
}

export { useFormGenerator, Types, TestFormConfig };
