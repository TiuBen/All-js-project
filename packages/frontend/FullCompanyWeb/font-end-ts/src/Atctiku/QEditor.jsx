import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;

const server = REACT_APP_SERVER_URL;

/**
 * 将中文符号转换成英文符号
 */
function chineseChar2englishChar(chineseChar) {
    // 将单引号‘’都转换成'，将双引号“”都转换成"
    let str = chineseChar.replace(/\’|\‘/g, "'").replace(/\“|\”/g, '"');
    // 将中括号【】转换成[]，将大括号｛｝转换成{}
    str = str.replace(/\【/g, "[").replace(/\】/g, "]").replace(/\｛/g, "{").replace(/\｝/g, "}");
    // 将逗号，转换成,，将：转换成:
    str = str.replace(/，/g, ",").replace(/：/g, ":");
    // 去除空格
    str = str.replace(/\s/g, "");
    str = str.replace("o", "。");
    str = str.replace("（", "(");
    str = str.replace("）", ")");
    
    str = str.replace("()0", "()。");
    
    str = str.replace("()»", "()。");
    
    str = str.replace("〜", "~");
    str = str.replace("0CH", "OCH");
    str = str.replace(",。", "，()");
    str = str.replace("M0C", "MOC");
    str = str.replace("().", "()。");
    str = str.replace("()-", "()。");
    str = str.replace("O。", "()。");
    str = str.replace("OO", "()。");
    str = str.replace("()□", "()。");
    str = str.replace("。。", "()。");
    str = str.replace("()O", "()。");
    str = str.replace("()O", "()。");
    str = str.replace("V0R", "VOR");
    return str;
}

function removeABCD(string) {
    let str = string.trim();
    if (str.startsWith("A")) {
        if (str.startsWith("A.\t")) {
            return str.replace("A", "");
        }
        if (str.startsWith("A/\t")) {
            return str.replace("A", "");
        }
        if (str.startsWith("A.")) {
            return str.replace("A", "");
        }
        if (str.startsWith("A,")) {
            return str.replace("A", "");
        }
    }
    if (str.startsWith("B")) {
        if (str.startsWith("B.\t")) {
            return str.replace("B", "");
        }
        if (str.startsWith("B/\t")) {
            return str.replace("B", "");
        }
        if (str.startsWith("B.")) {
            return str.replace("B", "");
        }
        if (str.startsWith("B,")) {
            return str.replace("B", "");
        }
       
    }
    if (str.startsWith("C")) {
        if (str.startsWith("C.\t")) {
            return str.replace("C", "");
        }
        if (str.startsWith("C/\t")) {
            return str.replace("C", "");
        }
        if (str.startsWith("C.")) {
            return str.replace("C", "");
        }
        if (str.startsWith("C,")) {
            return str.replace("C", "");
        }
    }
    if (str.startsWith("D")) {
        if (str.startsWith("D.\t")) {
            return str.replace("D", "");
        }
        if (str.startsWith("D/\t")) {
            return str.replace("D", "");
        }
        if (str.startsWith("D.")) {
            return str.replace("D", "");
        }
        if (str.startsWith("D,")) {
            return str.replace("D", "");
        }
    }
    if (str.includes("\t")) {
        return str.replace("\t","");
    }
    return str
}

function removeTabCommon(string) {
    let str = string.trim();
    if (str.startsWith("\t")) {
        return str.replace("\t", "");
    }
    if (str.startsWith(".")) {
        return str.replace(".", "");
    }
    if (str.startsWith(",")) {
        return str.replace(",", "");
    }
    if (str.startsWith("。")) {
        return str.replace("。", "");
    }
    if (str.startsWith("、")) {
        return str.replace("、", "");
    }
    if (str.startsWith("，")) {
        return str.replace("，", "");
    }
    return str;
}

const fetcher = (...args) => fetch(...args).then((res) => res.json());
async function updateQElement(url, { arg }) {
    await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(arg),
    }).then((res) => {
        res.json();
    });
}

function QEditor(props) {
    let [searchParams] = useSearchParams();
    const sub = searchParams.get("section");
    const _qId = searchParams.get("qId");
    console.log(sub, _qId);
    for (const entry of searchParams.entries()) {
        console.log(entry);
      }
    

    const { data, error, isLoading } = useSWR(`${server}/atcLicense/license/exam?section=${sub}&qId=${_qId}`, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    const [newTxt, setNewTxt] = useState("");
    const [qType, setQType] = useState("单选");
    const [newA, setNewA] = useState("");
    const [newB, setNewB] = useState("");
    const [newC, setNewC] = useState("");
    const [newD, setNewD] = useState("");
    const [newRightAns, setNewRightAns] = useState("");
    // const { trigger } = useSWRMutation("http://localhost:3103/tiku", updateQElement);
    const { trigger } = useSWRMutation(`${server}/atcLicense/license/exam`, updateQElement);
    const { mutate } = useSWRConfig();
    useEffect(() => {
        if (data) {
            let { qContent, A = "", B = "", C = "", D = "", rightAns = "" } = data.rows[0];
            if (A.trim().startsWith("T") === "T" && B.trim().startsWith("F") === "F") {
                setQType("判断");
            }
            setNewTxt(qContent);
            setNewA(A);
            setNewB(B);
            setNewC(C);
            setNewD(D);
            setNewRightAns(rightAns);

            //
        
        }



    }, [data]);


    // useEffect(() => {
    //     setNewTxt(chineseChar2englishChar(newTxt));
    //     setNewA(removeTabCommon(removeABCD(chineseChar2englishChar(newA))));
    //     setNewB(removeTabCommon(removeABCD(chineseChar2englishChar(newB))));
    //     setNewC(removeTabCommon(removeABCD(chineseChar2englishChar(newC))));
    //     setNewD(removeTabCommon(removeABCD(chineseChar2englishChar(newD))));
    // }, [newTxt,newA,newB,newC,newD])
    

    //! get 正在做的题目

    if (error) {
        return <div>failed to load</div>;
    }
    if (isLoading) {
        return <div>loading...</div>;
    }

    console.log(data);

    return (
        <div className="flex flex-col gap-2 mx-4 overflow-y-auto">
            QEditor
            <fieldset className="border flex flex-col gap-5 px-2">
                <fieldset className="border flex flex-row  gap-2">
                    <legend>题型</legend>

                    <div>
                        <input
                            type="radio"
                            id="单选"
                            name="qType"
                            checked={qType === "单选"}
                            onChange={() => {
                                setQType("单选");
                            }}
                        />
                        <label htmlFor="单选">单选</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            id="判断"
                            name="qType"
                            checked={qType === "判断"}
                            onChange={() => {
                                setQType("判断");
                            }}
                        />
                        <label htmlFor="判断">判断</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            id="多选"
                            name="qType"
                            checked={qType === "多选"}
                            onChange={() => {
                                setQType("多选");
                            }}
                        />
                        <label htmlFor="多选">多选</label>
                    </div>
                </fieldset>
                <div>
                    <button
                        className="mx-2 px-2 bg-blue-400"
                        onClick={() => {
                            setNewTxt(chineseChar2englishChar(newTxt));
                            setNewA(removeTabCommon(removeABCD(chineseChar2englishChar(newA))));
                            setNewB(removeTabCommon(removeABCD(chineseChar2englishChar(newB))));
                            setNewC(removeTabCommon(removeABCD(chineseChar2englishChar(newC))));
                            setNewD(removeTabCommon(removeABCD(chineseChar2englishChar(newD))));
                        }}
                    >
                        符号 (). 变成 半角
                    </button>
                    <button
                        className="mx-2 px-2 bg-blue-400 hidden"
                        onClick={() => {
                            setNewA(removeTabCommon(removeABCD(chineseChar2englishChar(newA))));
                            setNewB(removeTabCommon(removeABCD(chineseChar2englishChar(newB))));
                            setNewC(removeTabCommon(removeABCD(chineseChar2englishChar(newC))));
                            setNewD(removeTabCommon(removeABCD(chineseChar2englishChar(newD))));
                        }}
                    >
                        去除ABCD 选项的 ABCD.
                    </button>
                    <button
                        className="border-4 border-red-500 mx-3 px-1 bg-red-100"
                        type="submit"
                        onClick={async (e) => {
                            e.preventDefault();
                            const _newQ = {
                                section: sub,
                                qId: _qId,
                                qContent: newTxt,
                                A: newA,
                                B: newB,
                                C: newC,
                                D: newD,
                                rightAns: newRightAns,
                            };

                            try {
                                const result = await trigger(_newQ);
                                console.log(result);
                                mutate(`${server}/atcLicense/license/exam?section=${sub}&qId=${_qId}`);
                            } catch (e) {
                                // 错误处理
                            }
                        }}
                    >
                        确认修改
                    </button>
                </div>
            </fieldset>
            <div className=" border-2 border-green-700 flex flex-col gap-2  text-xl px-4">
                <div className="grid grid-cols-[1fr,7rem,1fr] gap-2 ">
                    <div className="  text-blue-700 font-bold italic">原始题干内容:</div>
                    <div>===&gt;&gt;&gt;</div>
                    <div className=" block">编辑后题干内容:</div>
                    <div className="border text-blue-700 font-bold ">{data?.rows[0]?.qContent}</div>
                    <div>===&gt;&gt;&gt;</div>
                    <textarea
                        className="border text-red-600 w-full font-medium font  "
                        rows={4}
                        value={newTxt}
                        onChange={(e) => setNewTxt(e.target.value)}
                    />
                    <div className="border text-blue-700 font-bold ">{data?.rows[0]?.A}</div>
                    <div>===&gt;&gt;&gt;</div>
                    <textarea
                        className="border text-red-600 w-full"
                        value={newA}
                        onChange={(e) => {
                            setNewA(e.target.value);
                        }}
                    />
                    <div className="border text-blue-700 font-bold ">{data.rows[0]?.B}</div>
                    <div>===&gt;&gt;&gt;</div>
                    <textarea
                        className="border text-red-600 w-full"
                        value={newB}
                        onChange={(e) => {
                            setNewB(e.target.value);
                        }}
                    />
                    <div className="border text-blue-700 font-bold ">{data?.rows[0]?.C}</div>
                    <div>===&gt;&gt;&gt;</div>
                    <textarea
                        className="border text-red-600 w-full"
                        value={newC}
                        onChange={(e) => {
                            setNewC(e.target.value);
                        }}
                    />
                    <div className="border text-blue-700 font-bold ">{data?.rows[0]?.D}</div>
                    <div>===&gt;&gt;&gt;</div>
                    <textarea
                        className="border text-red-600 w-full"
                        value={newD}
                        onChange={(e) => {
                            setNewD(e.target.value);
                        }}
                    />
                    <div className="border text-blue-700 font-bold ">
                        {data?.rows[0].rightAns ? data?.rows[0].rightAns : "没有正确答案"}
                    </div>
                    <div>===&gt;&gt;&gt;</div>
                    <fieldset className="border flex flex-row justify-end gap-2 px-2">
                        <legend>正确答案:</legend>
                        {["A", "B", "C", "D", "T", "F"].map((x, index) => {
                            return (
                                <div key={index}>
                                    <input
                                        type="radio"
                                        id={`answer${x}`}
                                        name="answer"
                                        checked={newRightAns === x}
                                        onChange={() => {
                                            setNewRightAns(x);
                                        }}
                                    />
                                    <label htmlFor={`answer${x}`}>{`answer ${x}`}</label>
                                </div>
                            );
                        })}
                    </fieldset>
                </div>
            </div>
            <form className="border-2 border-blue-700  font-medium  italic flex flex-col gap-2 p-2">
                <div>预览:</div>
                <div>
                    {/* 题目编号: {rawNum} 正确答案:{newRightAns} */}
                    {data?.rows[0]?.rawNum} 正确答案:{newRightAns}
                </div>
                <div>题目内容:{newTxt}</div>
                {qType === "单选" ? (
                    <>
                        <div className={`${newRightAns === "A" ? "text-red-500 font-bold" : ""}`}>A.{newA}</div>
                        <div className={`${newRightAns === "B" ? "text-red-500 font-bold" : ""}`}>B.{newB}</div>
                        <div className={`${newRightAns === "C" ? "text-red-500 font-bold" : ""}`}>C.{newC}</div>
                        <div className={`${newRightAns === "D" ? "text-red-500 font-bold" : ""}`}>D.{newD}</div>
                    </>
                ) : (
                    ""
                )}
                {qType === "判断" ? (
                    <>
                        <div className={`${newRightAns === "T" ? "text-red-500 font-bold" : ""}`}>T.{newA}</div>
                        <div className={`${newRightAns === "F" ? "text-red-500 font-bold" : ""}`}>F.{newB}</div>
                    </>
                ) : (
                    ""
                )}
                <>
                 
                </>
            </form>
        </div>
    );
}

export default QEditor;
