import React, { useState, useRef, forwardRef, useEffect } from "react";

const Input = forwardRef(({ value, onChange, controlled = true }, ref) => {
    const [canEdit, setCanEdit] = useState(controlled);

    useEffect(() => {}, [value, canEdit]);

    return (
        <div className="flex flex-row items-end w-1/2 m-10">
            <input
                disabled={canEdit}
                className={`mx-[1rem] w-full  ${canEdit ? "" : "border-b"} border-b-slate-500 focus:outline-none`}
                ref={ref}
                value={value}
                onChange={onChange}
            />
            {canEdit ? (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setCanEdit(!canEdit);
                    }}
                >
                    <span className="material-symbols-outlined">edit_off</span>
                </button>
            ) : (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setCanEdit(!canEdit);
                    }}
                >
                    <span className="material-symbols-outlined">border_color</span>
                </button>
            )}
        </div>
    );
});

const formData = [{ name: "sn", type: "text" }, { contact: [1, 2] }, { dateTime: "", type: "datetime-local" }];

function TestInput({ formData }) {
    const refArray = [];
    // const content = ;

    const [content, setContent] = useState(formData);

    const handleSubmit = (event) => {
        event.preventDefault();

        refArray.forEach((r, index) => {
            console.log(r.current.name + ":" + r.current.value);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-[min-content,1fr] gap-2 ">
            {content?.map((x, index) => {
                const [_key, _value] = Object.entries(x)[0];
                const itemType = x?.type ? x.type : "text";
                console.log(`formItem:itemValue = ${_key}:${_value}`);
                if (Array.isArray(_value)) {
                    const items = [];
                    items.push(<label key={_key + "name"}>{_key}</label>);

                    _value.forEach((item, itemIndex) => {
                        const ref = React.createRef("");
                        items.push(
                            <input
                                type={itemType}
                                ref={ref}
                                key={_key + "" + itemIndex}
                                name={_key}
                                className="border border-black"
                                placeholder={_key + ":" + itemIndex + ":" + item}
                            />
                        );
                        refArray.push(ref);
                    });
                    items.push(
                        <button
                            className="border border-blue-600 place-self-start "
                            onClick={(e) => {
                                e.preventDefault();
                                console.log("_value" + _key + ":" + _value);
                                const newValue = [..._value];
                                newValue.push("");
                                const newFormItem = {};
                                newFormItem[_key] = newValue;

                                const _content = [...content];
                                _content[index] = newFormItem;

                                setContent(_content);
                            }}
                        >
                            添加
                        </button>
                    );
                    return (
                        <>
                            {items[0]} <div className="flex flex-col gap-1">{items.splice(1, items.length - 1)}</div>
                        </>
                    );
                } else {
                    const ref = React.createRef("");
                    refArray.push(ref);
                    return (
                        <>
                            <label htmlFor={_key + "_" + index}>{_key}</label>
                            <input
                                id={_key + "_" + index}
                                type={itemType}
                                ref={ref}
                                name={_key}
                                key={index}
                                className="border border-black"
                                placeholder={_key + ":" + _value}
                            />
                        </>
                    );
                }

                // const refItem = React.createRef(null);
                // refArray.push(refItem);
                // return <input className="border border-black" name={index + "name"} key={index} ref={refItem} />;
            })}

            <button type="submit">Submit</button>
        </form>
    );
}

const FormGe = <TestInput formData={formData} />;

export { Input, TestInput, FormGe };
