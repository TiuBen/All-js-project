import { Button } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { useAppStore } from "../../../store/app.store";
import { Edit2 } from "lucide-react";

function StatisticSetting() {
    const { positions, fetchPositions } = useAppStore();

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

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

    return (
        <div className="flex flex-col gap-2 relative border border-red-500">
            StatisticSetting
            <div>
                <Button className="flex-0 flex-grow-0 max-w-fit self-end m-auto">增加一项</Button>
            </div>
            <fieldset className="border rounded-md p-2">
                <legend className="text-lg font-bold flex flex-row items-center gap-2 hover:cursor-text hover:text-blue-600">
                    岗位权限 <Edit2 size={16} />
                </legend>
                <label>计算公式:</label>
                <div>{JSON.stringify(calConfig)}</div>
            </fieldset>
            <div className="flex flex-row gap-2 flex-wrap">
                {positions?.map((item, index) => {
                    const p = item.position;
                    return (
                        <div
                            key={index}
                            className="flex flex-col gap-1 justify-start border border-gray-200 bg-gray-100 px-[0.5rem] py-1 rounded"
                        >
                            <label className="inline-flex gap-1 items-center">
                                <input value={p} type="checkbox" onChange={() => {}} />
                                {p}
                            </label>
                            {item.dutyType !== null && (
                                <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                                    {["主班", "副班"].map((x, i) => (
                                        <label key={i} className="inline-flex gap-1">
                                            <input type="checkbox" value={x} name={`${index}isMainOrCo`} />
                                            {x}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {item.canTeach !== 0 && (
                                <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                                    {["教员", "见习"].map((y, i) => (
                                        <label key={i} className="inline-flex gap-1">
                                            <input type="radio" value={y} name={`${index}isTeacherOrStudent`} />
                                            {y}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default StatisticSetting;
