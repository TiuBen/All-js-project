import { useState, useEffect, useRef, forwardRef } from "react";
import SelectElement from "./SelectElement";
import { Link } from "react-router-dom";
import { useLocalStorage, useContextMenu } from "../utils";
import { ContextMenu } from "components/index";

// { content, onClick, selectedQ,qKey,index }
const QElement = function QElement(props) {
    const { contentQ, onClick, doingQ } = props;
    const { num, qId, rawNum, txt, A = "", B = "", C = "", D = "", rightAns = "" } = contentQ;
    const [selectedItem, setSelectedItem] = useState("");
    // console.log(contentQ);

    const [sub] = useLocalStorage("sub");
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (doingQ !== null && doingQ?.qId === contentQ.qId) {
                switch (event.key) {
                    case "a":
                        // Handle key A
                        console.log("Key A pressed");
                        setSelectedItem("A");
                        break;
                    case "s":
                        // Handle key S
                        console.log("Key S pressed");
                        setSelectedItem("B");

                        break;
                    case "d":
                        // Handle key D
                        console.log("Key D pressed");
                        setSelectedItem("C");

                        break;
                    case "f":
                        // Handle key F
                        console.log("Key F pressed");
                        setSelectedItem("D");

                        break;
                    default:
                        // Ignore other keys
                        break;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [doingQ]);

    const { clicked, setClicked, points, setPoints } = useContextMenu();

    return (
        <div
            className="flex flex-row relative"
            onContextMenu={(e) => {
                e.preventDefault();
                setClicked(true);
                setPoints({ x: e.pageX, y: e.pageY });
            }}
        >
            {clicked && (
                <ContextMenu top={points.y} left={points.x} className="w-auto border rounded-lg p-2">
                    <ul>
                        <li>
                            <Link
                                to={`/tiku/editor?section=${sub}&qId=${qId}`}
                                target="_blank"
                                state={{ q: "fdsafasf" }}
                                className="bg-red-500  text-white px-2 "
                            >
                                编辑
                            </Link>
                        </li>
                        <li>
                            <button
                                className="bg-red-500  text-white px-2 "
                                onClick={() => {
                                    console.log(qId);
                                    fetch("http://localhost:3103/mod", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ qId: qId, sub: sub }),
                                    })
                                        .then((data) => console.log(data))
                                        .catch((e) => console.log(e));
                                }}
                            >
                                错题保存
                            </button>
                        </li>
                    </ul>
                </ContextMenu>
            )}
            <fieldset
                id={qId || ""}
                className={`border-[2px] rounded-lg shadow-lg px-2 py-2 flex-1 flex flex-col justify-between ${
                    qId === doingQ?.qId ? "border-blue-500" : "border-blue-00 "
                }`}
                onClick={() => {
                    // console.log("ddddd");
                    // console.log(qKey + ":" + index);
                    onClick(contentQ);
                }}
            >
                <legend className="font-medium">{txt}</legend>
                <SelectElement
                    isABCD={"A"}
                    content={A}
                    selectedItem={selectedItem}
                    rightAns={rightAns}
                    onClick={() => {
                        setSelectedItem("A");
                    }}
                />
                <SelectElement
                    isABCD={"B"}
                    content={B}
                    selectedItem={selectedItem}
                    rightAns={rightAns}
                    onClick={() => {
                        setSelectedItem("B");
                    }}
                />
                <SelectElement
                    isABCD={"C"}
                    content={C}
                    selectedItem={selectedItem}
                    rightAns={rightAns}
                    onClick={() => {
                        setSelectedItem("C");
                    }}
                />
                <SelectElement
                    isABCD={"D"}
                    content={D}
                    selectedItem={selectedItem}
                    rightAns={rightAns}
                    onClick={() => {
                        setSelectedItem("D");
                    }}
                />
            </fieldset>
            {/* <div className="flex flex-col gap-2 p-2">
                {num}-{qId}--
                {rightAns ? (
                    <span className="font-bold text-red-600">正确答案：{rightAns}</span>
                ) : (
                    <span className=" font-bold text-red-600">暂时没有正确答案</span>
                )}
               
                
            </div> */}
        </div>
    );
};

export default QElement;
