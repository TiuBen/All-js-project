import { Button, Flex, Checkbox, CheckboxGroup, Text, TextField, Radio, RadioGroup } from "@radix-ui/themes";
import React, { useState } from "react";
import { API_URL } from "../../../../utils/const/Const";
import useSWR, { mutate } from "swr";
import { usePage, SERVER_URL, FETCHER } from "@utils";
import { PencilLine, Trash2, SquarePlus, Check, Edit2 } from "lucide-react";
import { use } from "react";

function StatisticSetting() {
    const { data: positions } = useSWR(API_URL.query_positions, FETCHER);

    const [calConfig, setCalConfig] = useState([
        {
            name: "test",
            func: [
                {
                    position: ["带班主任", "领班"],
                    dutyType: [null],
                    roleType: [null],
                    relatedDutyTableRowId: [null, "NOT NULL"],
                },
            ],
        },
    ]);

    const [calRule, setCalRule] = useState({
        name: "test",
        func: [
            {
                position: ["带班主任", "领班"],
                dutyType: [null],
                roleType: [null],
                relatedDutyTableRowId: [null, "NOT NULL"],
            },
        ],
    });

    return (
        <div className="flex flex-col gap-2 relative border border-red-500">
            StatisticSetting
            <div>
                <Button className="flex-0 flex-grow-0 max-w-fit self-end m-auto">增加一项</Button>
            </div>
            <fieldset className="border  rounded-md p-2">
                <legend className="text-lg font-bold flex flex-row items-center gap-2 hover:cursor-text hover:text-blue-600">
                    岗位权限 <Edit2 size={16} />
                </legend>
                <label htmlFor="">计算公式:</label> <div>对对对对{}</div>
            </fieldset>
            <div className="flex flex-row gap-2 flex-wrap float ">
                {positions?.map((item, index) => {
                    const p = item.position;
                    return (
                        //
                        <div
                            key={index}
                            className="flex flex-col gap-1 justify-start  border border-gray-200 bg-gray-100 px-[0.5rem] py-1 rounded"
                        >
                            <label className="inline-flex gap-1 items-center">
                                <input
                                    value={p}
                                    type="checkbox"
                                    //   checked={}
                                    onChange={(e) => {
                                        console.log(e.target.value);
                                    }}
                                />
                                {p}
                            </label>
                            {item.dutyType !== null && (
                                <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                                    {["主班", "副班"].map((x, i) => {
                                        return (
                                            <label key={i} className="inline-flex gap-1">
                                                <input type="checkbox" value={x} name={`${index}isMainOrCo`} />
                                                {x}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                            {item.canTeach !== 0 && (
                                <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                                    {["教员", "见习"].map((y, i) => {
                                        return (
                                            <label key={i} className="inline-flex gap-1">
                                                <input type="radio" value={y} name={`${index}isTeacherOrStudent`} />
                                                {y}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        //
                    );
                })}
            </div>
            {/* {calConfig &&
                calConfig.map((item, index) => {
                    return (
                        <div key={index} className="border rounded ">
                            <div>序号：{index + 1} </div>
                            <div>
                                {" "}
                                名称：
                                <input type="text" value={item?.name} />{" "}
                            </div>
                            <div>
                                {" "}
                                可选数据
                                {item?.func?.map((func, funcIndex) => {})}
                            </div>
                            <div>计算公式描述</div>
                        </div>
                    );
                })}
            <button
                onClick={() => {
                    setCalConfig([...calConfig, {}]);
                }}
            >
                新增
            </button> */}
        </div>
    );
}

export default StatisticSetting;
