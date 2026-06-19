import { useEffect, useState } from "react";

function RightOrWrongQuestion(props) {
    const { num, qId, rawNum, qContent, A = "", B = "", C = "", D = "", rightAns = "" } = props;
    const ABCD = [A, B];

    const [selectedItem, setSelectedItem] = useState(null);

    const [rightIndex, setRightIndex] = useState(null);
    useEffect(() => {
        if (rightAns.includes("T")) {
            setRightIndex(0);
        }
        if (rightAns.includes("F")) {
            setRightIndex(1);
        }
       
    }, [rightAns]);

    return (
        <fieldset
            id={qId || ""}
            className={`border-[2px] rounded-lg shadow-lg px-2 py-2 flex-1 flex flex-col justify-between ${
                qId === qId ? "border-blue-500" : "border-blue-00 "
            }`}
            onClick={() => {}}
        >
            <legend className="font-medium">{txt}</legend>
            <>
                {ABCD.map((item, index) => {
                    return (
                        <div key={index} className="flex flex-row flex-1  hover:font-bold items-center gap-1">
                            <input
                                type="radio"
                                id={qId + "_" + index}
                                name={qId}
                                value={index}
                                checked={selectedItem === index}
                                onChange={(e) => {
                                    console.log("dddd");
                                    setSelectedItem(index);
                                }}
                            />
                            <label
                                htmlFor={qId + "_" + index}
                                className={`${
                                    selectedItem === index
                                        ? index === rightIndex
                                            ? "text-green-500"
                                            : "text-red-500 "
                                        : "text-black"
                                }`}
                            >
                                {item}
                            </label>
                        </div>
                    );
                })}
            </>
        </fieldset>
    );
}

export default RightOrWrongQuestion;
