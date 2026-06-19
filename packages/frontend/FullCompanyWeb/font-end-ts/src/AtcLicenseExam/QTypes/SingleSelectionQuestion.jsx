import { useEffect, useState } from "react";
import { ContextMenu } from "@radix-ui/themes";
import { Link } from "react-router-dom";
const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;

const server = REACT_APP_SERVER_URL;

function SingleSelectionQuestion(props) {
    const { section,num, qId, rawNum, qContent, A = "", B = "", C = "", D = "", rightAns = "" } = props;
    const ABCD = [A, B, C, D];

    const [selectedItem, setSelectedItem] = useState(null);

    const [rightIndex, setRightIndex] = useState(null);

    useEffect(() => {
        if (rightAns.includes("A")) {
            setRightIndex(0);
        }
        if (rightAns.includes("B")) {
            setRightIndex(1);
        }
        if (rightAns.includes("C")) {
            setRightIndex(2);
        }
        if (rightAns.includes("D")) {
            setRightIndex(3);
        }
        if (rightAns.includes("T")) {
            setRightIndex(0);
        }
        if (rightAns.includes("F")) {
            setRightIndex(1);
        }
    }, [rightAns]);

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger>
                <fieldset
                    id={qId || ""}
                    className={`border-[2px] rounded-lg shadow-lg px-4 pt-0 pb-2 w-full flex-1 flex flex-col justify-between ${
                        qId === qId ? "border-blue-500" : "border-blue-00 "
                    }`}
                    onClick={() => {}}
                >
                    <legend className="font-medium px-2">第{qId}题</legend>
                    <h3 className=" font-medium">{qContent}</h3>
                    <div className="flex flex-col  justify-start gap-1">
                        {ABCD.map((item, index) => {
                            return (
                                <div
                                    key={index}
                                    className={`flex flex-row flex-1  hover:font-bold items-baseline gap-1`}
                                    onClick={(e) => {
                                        setSelectedItem(index);
                                    }}
                                >
                                    <input
                                        type="radio"
                                        id={qId + "_" + index}
                                        name={qId}
                                        value={index}
                                        checked={selectedItem === index}
                                    />
                                    <label
                                        htmlFor={qId + "_" + index}
                                        className={`${selectedItem === index ? `font-bold ${selectedItem === rightIndex ? "text-green-500" : "text-red-500"}` : ""}`}
                                    >
                                        {item}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
                <ContextMenu.Item > <a  target='_blank' href={`/editor?section=${section}&qId=${qId}`}>编辑</a></ContextMenu.Item>
                <ContextMenu.Separator />
                <ContextMenu.Item>标记为错题</ContextMenu.Item>
                <ContextMenu.Item>添加注释</ContextMenu.Item>
            </ContextMenu.Content>
        </ContextMenu.Root>
    );
}

export default SingleSelectionQuestion;
