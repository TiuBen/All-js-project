import { Button, Flex, Checkbox, CheckboxGroup, Text, TextField, Radio, RadioGroup } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { usePage, SERVER_URL, FETCHER } from "@utils";
import useSWR from "swr";
import { API_URL } from "../../../../utils/const/Const.js";
import { Theme } from "@radix-ui/themes";
import { Input } from "@/components/ui/input";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

function EditDutyRecord() {
    const { payload, setPayload } = usePage();
    // const { editSheetDisplay } = payload;
    const { data: positions } = useSWR(API_URL.query_positions, FETCHER);

    const { data, error, isLoading,mutate } = useSWR(`${API_URL.duty}/${payload?.editSheetRowId} `, FETCHER);
    // const { data: roles } = useSWR(API_URL.query_roles, FETCHER);

    // const [record, setRecord] = useState(selectedDutyRow[0]);

    const [selectedDutyRow, setSelectedDutyRow] = useState({});


    const [canSave, setCanSave] = useState(false);

    const [errorLog, setErrorLog] = useState(null);

    useEffect(() => {
        setSelectedDutyRow(data);
    }, [data]);

    useEffect(() => {

        if (JSON.stringify(selectedDutyRow) !== JSON.stringify(data)) {
            setCanSave(true);
        } else {
            setCanSave(false);
        }
        if (dayjs(selectedDutyRow?.inTime).isAfter(dayjs(selectedDutyRow?.outTime))) {
            setErrorLog("开始时间不能早于结束时间");
        }else if (dayjs(selectedDutyRow?.outTime).diff(dayjs(selectedDutyRow?.inTime),"hour",true)>8.5 ) {

            setErrorLog("单次打卡时间不能超过8.5小时");
        }else{
            setErrorLog(null);
        }

    }, [selectedDutyRow, data, setCanSave]);
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error fetching data: {error}</div>;
    }



    // useEffect(() => {
    //     fetch(API_URL.query_id + payload?.editSheetRowId)
    //         .then((res) => {
    //             return res.json();
    //         })
    //         .then((data) => {
    //             setSelectedDutyRow(data[0]);
    //             setEditedDutyRecord(data[0]);
    //         })
    //         .catch(() => {
    //             console.log("error");
    //         });
    // }, [payload]);

    return (
        <Theme accentColor="indigo">
            <div>{JSON.stringify(data)}</div>
            <div className="m-auto  text-nowrap flex flex-col gap-2 py-2" onChange={() => {}}>
                <div className="grid gap-2   text-nowrap ">
                    <div className="_grid _grid-cols-8 flex flex-row items-center gap-4">
                        <Text size="3" weight="bold" htmlFor="name" className=" text-justify col-span-1">
                            数据库ID
                        </Text>
                        <TextField.Root
                            placeholder={selectedDutyRow?.id}
                            readOnly={true}
                            className="col-span-1"
                        ></TextField.Root>
                        <Text size="3" weight="bold" htmlFor="name" className="col-span-1 text-justify">
                            姓名
                        </Text>
                        <TextField.Root
                            placeholder={selectedDutyRow?.username}
                            readOnly={true}
                            className="col-span-1"
                        ></TextField.Root>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <Text size="3" weight="bold" htmlFor="name" className=" text-justify self-start">
                            席位
                        </Text>
                        <div className=" flex flex-row flex-wrap gap-2 items-start">
                            {positions?.map((item, index) => {
                                const p = item.position;
                                return (
                                    //
                                    <div
                                        key={index}
                                        className="flex flex-col gap-1 justify-start   border border-gray-200 bg-gray-100 px-[0.5rem] py-1 rounded"
                                    >
                                        <label className="inline-flex gap-1 items-center">
                                            <input
                                                value={p}
                                                type="radio"
                                                name="position-radio"
                                                checked={p === selectedDutyRow?.position}
                                                onChange={(e) => {
                                                    setSelectedDutyRow({
                                                        ...selectedDutyRow,
                                                        position: e.target.value,
                                                    });
                                                }}
                                            />
                                            {p}
                                        </label>
                                        {item.dutyType && (
                                            <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                                                {["主班", "副班"].map((x, i) => {
                                                    return (
                                                        <label key={i} className="inline-flex gap-1">
                                                            <input
                                                                type="radio"
                                                                disabled={p !== selectedDutyRow?.position}
                                                                value={x}
                                                                name={`${index}isMainOrCo-radio`}
                                                                onChange={(e) => {
                                                                    setSelectedDutyRow({
                                                                        ...selectedDutyRow,
                                                                        dutyType: e.target.value,
                                                                    });
                                                                }}
                                                            />
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
                                                            <input
                                                                type="radio"
                                                                value={y}
                                                                disabled={p !== selectedDutyRow?.position}
                                                                name={`${index}isTeacherOrStudent`}
                                                                onChange={(e) => {
                                                                    setSelectedDutyRow({
                                                                        ...selectedDutyRow,
                                                                        roleType: e.target.value,
                                                                    });
                                                                }}
                                                            />
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
                    </div>
                </div>
                <div className="flex flex-row  items-center gap-4 ">
                    <div className="flex flex-row gap-2 ">
                        <label className="text-justify  self-center font-semibold">开始时间</label>
                        <Text
                            as="label"
                            size="2"
                            style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}
                        >
                            日期
                            <input
                                className={`border rounded-sm p-1 text-base bg-gray-100`}
                                type="date"
                                value={dayjs(selectedDutyRow?.inTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD")}
                                onChange={(e) => {
                                    console.log(e.target.value);

                                    setSelectedDutyRow((prev) => {
                                        const inTime_HHmmss = dayjs(prev.inTime, "YYYY-MM-DD HH:mm:ss").format(
                                            "HH:mm:ss"
                                        );
                                        const inTime_YYYYMMDD = dayjs(e.target.value, "YYYY-MM-DD").format(
                                            "YYYY-MM-DD"
                                        );
                                        console.log(`${inTime_YYYYMMDD} ${inTime_HHmmss}`);

                                        return {
                                            ...prev,
                                            inTime: `${inTime_YYYYMMDD} ${inTime_HHmmss}`,
                                        };
                                    });
                                }}
                            />
                        </Text>

                        <Text
                            as="label"
                            size="2"
                            style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}
                        >
                            时刻
                            <input
                                className={`border rounded-sm p-1 text-base bg-gray-100 `}
                                type="time"
                                step="1"
                                value={dayjs(selectedDutyRow?.inTime, "YYYY-MM-DD HH:mm:ss").format("HH:mm:ss")}
                                onChange={(e) => {
                                    console.log(e.target.value);

                                    setSelectedDutyRow((prev) => {
                                        const inTime_YYYYMMDD = dayjs(prev.inTime, "YYYY-MM-DD HH:mm:ss").format(
                                            "YYYY-MM-DD"
                                        );
                                        // const inTime_HHmmss = dayjs(e.target.value,"HH:mm:ss").format("HH:mm:ss");
                                        const inTime_HHmmss = e.target.value;
                                        console.log(`${inTime_YYYYMMDD} ${inTime_HHmmss}`);

                                        return {
                                            ...prev,
                                            inTime: `${inTime_YYYYMMDD} ${inTime_HHmmss}`,
                                        };
                                    });
                                }}
                            />
                        </Text>
                    </div>
                    <div className="flex flex-row  items-center gap-4 ">
                        <div className="flex flex-row gap-2">
                            <label className="text-justify  self-center  font-semibold">结束时间</label>
                            <div className="flex flex-row col-span-3">
                                <Text
                                    as="label"
                                    size="2"
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    日期
                                    <input
                                        className="border rounded-sm p-1 text-base bg-gray-100"
                                        type="date"
                                        value={dayjs(selectedDutyRow?.outTime, "YYYY-MM-DD HH:mm:ss").format(
                                            "YYYY-MM-DD"
                                        )}
                                        onChange={(e) => {
                                            setSelectedDutyRow((prev) => {
                                                const outTime_HHmmss = dayjs(
                                                    prev.outTime,
                                                    "YYYY-MM-DD HH:mm:ss"
                                                ).format("HH:mm:ss");
                                                const outTime_YYYYMMDD = e.target.value;

                                                return {
                                                    ...prev,
                                                    outTime: `${outTime_YYYYMMDD} ${outTime_HHmmss}`,
                                                };
                                            });
                                        }}
                                    />
                                </Text>
                                <Text
                                       as="label"
                                       size="2"
                                       style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}
                                >
                                    时刻
                                    <input
                                        className="border rounded-sm p-1 text-base bg-gray-100"
                                        type="time"
                                        step="1"
                                        value={dayjs(selectedDutyRow?.outTime, "YYYY-MM-DD HH:mm:ss").format(
                                            "HH:mm:ss"
                                        )}
                                        onChange={(e) => {
                                            setSelectedDutyRow((prev) => {
                                                const outTime_YYYYMMDD = dayjs(
                                                    prev.inTime,
                                                    "YYYY-MM-DD HH:mm:ss"
                                                ).format("YYYY-MM-DD");
                                                // const inTime_HHmmss = dayjs(e.target.value,"HH:mm:ss").format("HH:mm:ss");
                                                const outTime_HHmmss = e.target.value;
                                                return {
                                                    ...prev,
                                                    outTime: `${outTime_YYYYMMDD} ${outTime_HHmmss}`,
                                                };
                                            });
                                        }}
                                    />
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-4">
                    <label htmlFor="username" className="text-justify  self-start font-semibold">
                        关联数据
                    </label>
                    <div className="flex flex-col col-span-3">
                        {JSON.stringify(selectedDutyRow?.relatedDutyTableRowId)}
                    </div>
                </div>
                {/* 提示信息 */}
                <div>
                    <span className="text-red-500 font-semibold">{errorLog}</span>
                </div>
                <Button
                    className="border  border-red-600"
                    disabled={!canSave || errorLog}
                    onClick={() => {
                        fetch(API_URL.duty + "/" + selectedDutyRow.id, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(selectedDutyRow),
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                console.log("Success:", data);
                                if (data.success) {
                                    mutate();
                                }
                                setErrorLog("");
                            }).ch;
                    }}
                >
                    保存修改
                </Button>
                <Button color="red" className="border  border-red-600">
                    删除此条目
                </Button>
            </div>
        </Theme>
    );
}

export default EditDutyRecord;
