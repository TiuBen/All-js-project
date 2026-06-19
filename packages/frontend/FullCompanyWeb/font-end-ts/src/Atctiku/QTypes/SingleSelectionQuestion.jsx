import { useEffect, useState } from "react";
import { useLocalStorage, useContextMenu } from "../../utils";
import { ContextMenu } from "components/index";
import { Link } from "react-router-dom";

function SingleSelectionQuestion(props) {
    const { num, qId, rawNum, txt, A = "", B = "", C = "", D = "", rightAns = "" } = props;
    const ABCD = [A, B, C, D];

    const [selectedItem, setSelectedItem] = useState(null);

    const [rightIndex, setRightIndex] = useState(null);

    const [sub] = useLocalStorage("sub");

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

    const { clicked, setClicked, points, setPoints } = useContextMenu();

    return (
        <fieldset
            id={qId || ""}
            className={`border-[2px] rounded-lg shadow-lg px-2 py-0 flex-1 flex flex-col justify-between ${
                qId === qId ? "border-blue-500" : "border-blue-00 "
            }`}
            onClick={() => {}}
            onContextMenu={(e) => {
                e.preventDefault();
                setClicked(true);
                setPoints({ x: e.pageX, y: e.pageY });
            }}
        >
            {clicked && (
                <ContextMenu top={points.y} left={points.x} className="w-auto border rounded-lg p-2">
                    <ul className="flex flex-col gap-1">
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
                                        body: JSON.stringify({ qId: qId, sub: sub, action: "AddToWrong" }),
                                    })
                                        .then((data) => console.log(data))
                                        .catch((e) => console.log(e));
                                }}
                            >
                                错题保存
                            </button>
                        </li>
                        <li>
                            <button
                                className="bg-red-500  text-white px-2 "
                                onClick={() => {
                                    console.log(qId);
                                    fetch("http://localhost:3103/mod", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ qId: qId, sub: sub, action: "RemoveFromWrong" }),
                                    })
                                        .then((data) => console.log(data))
                                        .catch((e) => console.log(e));
                                }}
                            >
                                移除错题
                            </button>
                        </li>
                    </ul>
                </ContextMenu>
            )}
            <legend className="font-medium">{txt}</legend>
            <>
                {ABCD.map((item, index) => {
                    return (
                        <div
                            key={index}
                            className={`flex flex-row flex-1  hover:font-bold_ items-center gap-1`}
                            onChange={(e) => {
                                console.log("dddd");
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
                                className={`${
                                    selectedItem === index
                                        ? index === rightIndex
                                            ? "text-green-500 font-bold"
                                            : "text-red-500 font-bold"
                                        : "text-black"
                                }  ${
                                    index === rightIndex ? "text-green-500 font-extrabold" : "text-black "
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

export default SingleSelectionQuestion;
