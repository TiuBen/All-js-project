import React, { useRef, useState } from "react";
import { formatToInputElement } from "./getAvailableControlElement";

const TestInputTypes = ["text",'text'];

function TestFormValue() {
    const [value, setValue] = useState({});
    return (
        <div>
            testFormValue
            <form>
                {TestInputTypes.map((ty, index) => {
                    
                    // const ref=useRef();
                    return React.createElement("input", {
                        type: ty,
                        key: index,
                        name:`name${index}`,
                        className: "border-2 rounded border-blue-400",
                        // value: value[`name${index}`],
                        onChange: (e) => {
                            e.preventDefault();
                            console.log(e.target.name);
                            value[e.target.name]=e.target.value;
                            // setValue({e.target.name:});
                            // console.log(value);
                        },
                    });
                })}
                <button
                    type="submit"
                    onClick={(e) => {
                        e.preventDefault();
                        console.log(value);
                    }}
                >
                    提交
                </button>
            </form>
        </div>
    );
}

export default TestFormValue;
