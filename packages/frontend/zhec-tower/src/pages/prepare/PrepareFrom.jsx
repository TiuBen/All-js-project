import React, { useState, useEffect } from "react";
import TestPrepare from "./TestPrepare";
import { useLocalStorageState } from "ahooks";
import { server, serverActions } from "../../lib/CONST";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat)
function PrepareFrom(props) {
    const { username, setResponse, open, setOpen } = props;

    const [isPrepared, setIsPrepared] = useState(false);
    const [bodyCondition, setBodyCondition] = useState(null);
    const [mindCondition, setMindCondition] = useState(null);
    const [alcoholCondition, setAlcoholCondition] = useState(null);
    const [shiftType, setShiftType] = useState(null);
   
    let nowHH = dayjs().format("HH");
    let t1;
    let t2;
    let t3;
    let t4;

    if (nowHH <= 3) {
        t1 = dayjs("23:30","HH:mm").subtract(1, "day");
        t2 = dayjs("03:30","HH:mm");
        t3 = dayjs("08:30","HH:mm");
        t4 = dayjs("23:30","HH:mm");
    } else if (nowHH > 3 && nowHH <= 8) {
        t1 = dayjs("03:30","HH:mm");
        t2 = dayjs("08:30","HH:mm");
        t3 = dayjs("23:30","HH:mm");
        t4 = dayjs("03:30","HH:mm").add(1, "day");
    } else {
        t1 = dayjs("08:30","HH:mm");
        t2 = dayjs("23:30","HH:mm");
        t3 = dayjs("03:30","HH:mm").add(1, "day");
        t4 = dayjs("08:30","HH:mm").add(1, "day");
      
    }

 
   
    useEffect(() => {
        if (bodyCondition === "合适" && mindCondition === "合适" && alcoholCondition === "没有饮酒") {
            setIsPrepared(true);
        } else {
            setIsPrepared(false);
        }
    }, [bodyCondition, mindCondition, alcoholCondition]);


    return (
        <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fetch(server + "/prepare", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: serverActions.PrepareForTheJob,
                        username: username,
                        isPrepared: isPrepared,
                        prepareDetail: {
                            身体状况: bodyCondition,
                            思想状况: mindCondition,
                            是否饮用含酒精饮料: alcoholCondition,
                        },
                        shiftType: shiftType,
                    }),
                })
                    .then((res) => {
                        return res.json();
                    })
                    .then((data) => {
                        console.log(data);
                        setResponse({ ...data });
                    })
                    .catch((err) => console.log(err))
                    .finally(() => {
                        setOpen(true);
                    });
            }}
        >
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">岗前准备</h2>
            <div className="flex flex-col gap-1">
                <div className="flex flex-row gap-2 items-center ">
                    <label className="font-bold text-lg">身体状况</label>
                    <div className="flex flex-row gap-1 hover:text-xl hover:font-extrabold">
                        <input
                            type="radio"
                            id="body-condition-yes"
                            name="body-condition"
                            value="true"
                            required
                            onChange={(e) => {
                                setBodyCondition("合适");
                            }}
                        />
                        <label htmlFor="body-condition-yes">合适</label>
                    </div>
                    <div className="flex flex-row gap-1 hover:text-xl font-extrabold">
                        <input
                            type="radio"
                            id="body-condition-no"
                            name="body-condition"
                            value="false"
                            required
                            onChange={(e) => {
                                setBodyCondition("不合适");
                            }}
                        />
                        <label htmlFor="body-condition-no">不适合</label>
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center ">
                    <label className="font-bold text-lg">思想状况</label>
                    <div className="flex flex-row gap-1 hover:text-xl hover:font-extrabold">
                        <input
                            type="radio"
                            id="mind-condition-yes"
                            name="mind-condition"
                            value="true"
                            required
                            onChange={(e) => {
                                setMindCondition("合适");
                            }}
                        />
                        <label htmlFor="mind-condition-yes">合适</label>
                    </div>
                  
                    <div className="flex flex-row gap-1 text-red-600 hover:text-xl font-extrabold">
                        <input
                            type="radio"
                            id="mind-condition-no"
                            name="mind-condition"
                            value="false"
                            required
                            onChange={(e) => {
                                setMindCondition("不合适");
                            }}
                        />
                        <label htmlFor="mind-condition-no">不适合</label>
                    </div>
                </div>

                <div className="flex gap-2 items-start">
                    <label className="font-bold text-lg">是否饮用含酒精饮料</label>
                    <div className="custom-radio">
                    <div className="flex flex-row gap-1 hover:text-xl hover:font-extrabold">
                            <input
                                type="radio"
                                id="alcohol-condition-no"
                                name="alcohol-condition"
                                value="true"
                                required
                                onChange={(e) => {
                                    setAlcoholCondition("没有饮酒");
                                }}
                            />
                            <label htmlFor="alcohol-condition-no">否</label>
                        </div>
                        <div className="flex flex-row gap-1 text-red-600 hover:text-xl font-extrabold">
                            <input
                                type="radio"
                                id="alcohol-condition-yes"
                                name="alcohol-condition"
                                value="false"
                                required
                                onChange={(e) => {
                                    setAlcoholCondition("酒后");
                                }}
                            />
                            <label htmlFor="alcohol-condition-yes">是</label>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-xl">选择班次</h3>
                    <label htmlFor="shiftType1" className="flex gap-2 items-baseline hover:text-xl font-extrabold">
                    {`${t1.format("M月D日HH:mm")}-${t2.format("M月D日HH:mm")}`}
                        <input
                            type="radio"
                            name="shift"
                            id="shiftType1"
                            value=  {`${t1.format("YYYY年M月D日HH:mm")}-${t2.format("YYYY年M月D日HH:mm")}`}
                            // checked={shiftType === shiftType1}
                            onChange={(e) => {
                                setShiftType(e.target.value);
                            }}
                            required={true}
                        />
                    </label>
                    <label htmlFor="shiftType2" className="flex gap-2 items-baseline  hover:text-xl font-extrabold">
                    {`${t2.format("M月D日HH:mm")}-${t3.format("M月D日HH:mm")}`}
                        <input
                            type="radio"
                            name="shift"
                            id="shiftType2"
                            value={`${t2.format("YYYY年M月D日HH:mm")}-${t3.format("YYYY年M月D日HH:mm")}`}
                            // checked={shiftType === shiftType2}
                            onChange={(e) => {
                                setShiftType(e.target.value);
                            }}
                            required={true}
                        />
                    </label>
                    <label htmlFor="shiftType3" className="flex gap-2 items-baseline hover:text-xl font-extrabold">
                        {`${t3.format("M月D日HH:mm")}-${t4.format("M月D日HH:mm")}`}
                        <input
                            type="radio"
                            name="shift"
                            id="shiftType3"
                            value={`${t3.format("YYYY年M月D日HH:mm")}-${t4.format("YYYY年M月D日HH:mm")}`}
                            // checked={shiftType === shiftType3}
                            onChange={(e) => {
                                setShiftType(e.target.value);
                            }}
                            required={true}
                        />
                    </label>
                </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded-lg  w-fit">
                确定
            </button>
        </form>
    );
}

export default PrepareFrom;
