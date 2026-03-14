import {
    Button,
    Flex,
    Checkbox,
    CheckboxGroup,
    Text,
    TextField,
    Radio,
    RadioGroup,
    DropdownMenu,
} from "@radix-ui/themes";
import React, { useState, useEffect, useRef } from "react";
import { usePage, SERVER_URL, FETCHER } from "@utils";
import useSWR from "swr";
import { API_URL } from "../../../../utils/const/Const.js";
import { Theme } from "@radix-ui/themes";
import { Input } from "@/components/ui/input";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import useStore from "../../../../utils/store/userStore.js";
import useDialog from "../../../../utils/hooks/useDialog.js";

dayjs.extend(duration);

function EditDutyRecord() {
    const { positions, selectedUser } = useStore();
    const [editingDutyRecord, setEditingDutyRecord] = useState({
        userId: selectedUser.id,
        userName: selectedUser.username,
        position: null,
        dutyType: null,
        roleType: null,
        relatedDutyTableRowId: null,
        inTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        outTime: dayjs().add(2, "hour").format("YYYY-MM-DD HH:mm:ss"),
    });
    const [canSave, setCanSave] = useState(false);
    const [errorLog, setErrorLog] = useState(null);
    const [newRelatedDutyRecordId, setNewRelatedDutyRecordId] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);
    const [dutyIdCheckResult, setDutyIdCheckResult] = useState({});
    const { dialogPayload,setDialogPayload } = useDialog();

    // 检查数组里的每个 ID 是否存在
    const checkRelatedDutyIds = async (ids) => {
        const results = {};
        const newRoleStartTimes = [];
        const newRoleEndTimes = [];

        // 用 Promise.all 并行请求
        await Promise.all(
            ids.map(async (id) => {
                try {
                    const res = await fetch(`${API_URL.duty}/${id}`);
                    const data = await res.json();
                    console.log("检查结果:", id, data);
                    if (data && data.roleType === "见习") {
                        results[id] = true; // true / false
                        newRoleStartTimes.push(data.inTime);
                        newRoleEndTimes.push(data.outTime);
                    } else {
                        results[id] = false;
                    }
                } catch (error) {
                    console.error("检查失败:", id, error);
                    results[id] = false;
                }
            })
        );

        // 如果有见习，更新 editingDutyRecord
        if (newRoleStartTimes.length > 0) {
            setEditingDutyRecord((prev) => ({
                ...prev,
                roleStartTime: newRoleStartTimes,
                roleEndTime: newRoleEndTimes,
            }));
        }

        return results; // 返回 { 123: true, 456: false, ... }
    };

    useEffect(() => {
        if (dayjs(editingDutyRecord?.inTime).isAfter(dayjs(editingDutyRecord?.outTime))) {
            setErrorLog("开始时间不能早于结束时间");
            setCanSave(false);
        } else if (dayjs(editingDutyRecord?.outTime).diff(dayjs(editingDutyRecord?.inTime), "hour", true) > 8.5) {
            setErrorLog("单次打卡时间不能超过8.5小时");
            setCanSave(false);
        } else if (editingDutyRecord?.roleType === "教员" && editingDutyRecord?.relatedDutyTableRowId === null) {
            setErrorLog("教员或学员必须关联另一方的考勤数据");
            setCanSave(false);
        } else if (Object.values(dutyIdCheckResult).includes(false)) {
            setCanSave(false);
        } else {
            setErrorLog(null);
            setCanSave(true);
        }
    }, [dutyIdCheckResult, editingDutyRecord, setCanSave]);
    // 自动聚焦到 input
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            // 可选：选中所有文本
            inputRef.current.select();
        }
    }, [isEditing]);

    //
    useEffect(() => {
        if (editingDutyRecord?.relatedDutyTableRowId?.length > 0) {
            checkRelatedDutyIds(editingDutyRecord.relatedDutyTableRowId).then((res) => {
                console.log("检查结果:", res);
                // 例如：{ 101: true, 102: false }
                setDutyIdCheckResult(res);
            });
        }
    }, [editingDutyRecord?.relatedDutyTableRowId]);

    // 输入框回车时添加
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && newRelatedDutyRecordId.trim() !== "") {
            setEditingDutyRecord((prev) => ({
                ...prev,
                relatedDutyTableRowId: [
                    ...(prev.relatedDutyTableRowId || []),
                    newRelatedDutyRecordId, // 追加到数组
                ],
            }));
            setNewRelatedDutyRecordId(""); // 清空输入框
            setIsEditing(false);
        }
    };

    // 失焦时取消
    const handleBlur = () => {
        setNewRelatedDutyRecordId("");
        setIsEditing(false);
    };

    // 删除某一项
    const handleRemove = (index) => {
        setEditingDutyRecord((prev) => {
            const newArr = prev.relatedDutyTableRowId.filter((_, i) => i !== index);
            return {
                ...prev,
                relatedDutyTableRowId: newArr.length > 0 ? newArr : null,
            };
        });
    };

    return (
        <Theme accentColor="indigo">
            <div className="m-auto  text-nowrap flex flex-col gap-2 py-2">
                <div className="flex flex-row items-start gap-2">
                    <label className="font-bold">
                        用户ID:<span className="px-1 text-blue-500">{selectedUser.id}</span>
                    </label>
                    <label className="font-bold">
                        姓名:<span className="px-1 text-blue-500">{selectedUser?.username}</span>
                    </label>
                </div>
                <div className="flex flex-row items-start gap-2">
                    <label className=" font-bold">席位</label>
                    <div className=" flex flex-col flex-wrap gap-2 items-start">
                        <div className=" flex flex-row flex-wrap gap-2 items-start">
                            {positions.map((item, index) => {
                                const p = item.position;
                                return (
                                    //
                                    <div
                                        key={index}
                                        className="flex flex-col gap-1 justify-start   border border-gray-200 bg-gray-100 px-[0.5rem] py-1 rounded"
                                    >
                                        <label className="inline-flex gap-1 items-center">
                                            <input
                                                value={item.position}
                                                type="radio"
                                                name="position-radio"
                                                checked={item.position === editingDutyRecord?.position}
                                                onChange={(e) => {
                                                    setEditingDutyRecord((prev) => {
                                                        if (item.canTeach) {
                                                            return { ...prev, position: e.target.value };
                                                        } else {
                                                            return {
                                                                ...prev,
                                                                position: e.target.value,
                                                                roleType: null,
                                                                relatedDutyTableRowId: null,
                                                            };
                                                        }
                                                    });
                                                }}
                                            />
                                            {item.position}
                                        </label>
                                        {item.dutyType && (
                                            <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                                                {["主班", "副班"].map((x, i) => {
                                                    return (
                                                        <label key={i} className="inline-flex gap-1">
                                                            <input
                                                                type="radio"
                                                                checked={
                                                                    x === editingDutyRecord?.dutyType &&
                                                                    item.position === editingDutyRecord?.position
                                                                }
                                                                value={x}
                                                                name={`${index}isMainOrCo-radio`}
                                                                onChange={(e) => {
                                                                    setEditingDutyRecord((prev) => {
                                                                        return { ...prev, dutyType: e.target.value };
                                                                    });
                                                                }}
                                                            />
                                                            {x}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {/* {item.canTeach !== 0 && (
                                            <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                                                {["教员", "见习"].map((y, i) => {
                                                    return (
                                                        <label key={i} className="inline-flex gap-1">
                                                            <input
                                                                type="radio"
                                                                value={y}
                                                                checked={
                                                                    y === editingDutyRecord?.roleType &&
                                                                    item.position === editingDutyRecord?.position
                                                                }
                                                                name={`${index}isTeacherOrStudent`}
                                                                onChange={(e) => {
                                                                    setEditingDutyRecord({
                                                                        ...editingDutyRecord,
                                                                        roleType: e.target.value,
                                                                    });
                                                                }}
                                                            />
                                                            {y}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )} */}
                                    </div>

                                    //
                                );
                            })}
                        </div>
                        {/* <label className="text-justify text-blue-600  font-semibold">不要勾选 教员或见习</label> */}
                    </div>
                </div>
                <div className="flex flex-row items-center gap-2 ">
                    <label className=" font-bold">见习</label>
                    <div className="flex flex-row gap-1 justify-start   border border-gray-200 bg-gray-100 px-[0.5rem] py-1 rounded w-[4rem]">
                        <label className="inline-flex gap-1 items-center">
                            <input
                                value={"见习"}
                                type="checkbox"
                                name=""
                                checked={"见习" === editingDutyRecord?.roleType}
                                onChange={(e) => {
                                    setEditingDutyRecord((prev) => {
                                        if (editingDutyRecord?.roleType === "见习") {
                                            return { ...prev, roleType: null, relatedDutyTableRowId: null };
                                        } else {
                                            return {
                                                ...prev,
                                                roleType: "见习",
                                            };
                                        }
                                    });
                                }}
                            />
                            见习
                        </label>
                    </div>
                    <div className="flex flex-row gap-1 justify-start   border border-gray-200 bg-gray-100 px-[0.5rem] py-1 rounded w-[4rem]">
                        <label className="inline-flex gap-1 items-center">
                            <input
                                value={"教员"}
                                type="checkbox"
                                name=""
                                checked={editingDutyRecord?.roleType === "教员"}
                                onChange={(e) => {
                                    setEditingDutyRecord((prev) => {
                                        if (e.target.checked === false) {
                                            return { ...prev, relatedDutyTableRowId: null, roleType: null };
                                        } else {
                                            return {
                                                ...prev,
                                                roleType: "教员",
                                            };
                                        }
                                    });
                                }}
                            />
                            教员
                        </label>
                    </div>
                </div>

                <div className="flex flex-row  items-start gap-4 ">
                    <div className="flex flex-col gap-2 ">
                        <div className="flex flex-row items-start gap-2">
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
                                    value={dayjs(editingDutyRecord?.inTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD")}
                                    onChange={(e) => {
                                        console.log(e.target.value);

                                        const inTime_HHmmss = dayjs(
                                            editingDutyRecord.inTime,
                                            "YYYY-MM-DD HH:mm:ss"
                                        ).format("HH:mm:ss");
                                        const inTime_YYYYMMDD = e.target.value;
                                        setEditingDutyRecord((prev) => ({
                                            ...prev,
                                            inTime: `${inTime_YYYYMMDD} ${inTime_HHmmss}`,
                                        }));
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
                                    value={dayjs(editingDutyRecord?.inTime, "YYYY-MM-DD HH:mm:ss").format("HH:mm:ss")}
                                    onChange={(e) => {
                                        console.log(e.target.value);

                                        const inTime_YYYYMMDD = dayjs(
                                            editingDutyRecord.inTime,
                                            "YYYY-MM-DD HH:mm:ss"
                                        ).format("YYYY-MM-DD");
                                        const inTime_HHmmss = e.target.value;
                                        setEditingDutyRecord((prev) => ({
                                            ...prev,
                                            inTime: `${inTime_YYYYMMDD} ${inTime_HHmmss}`,
                                        }));
                                    }}
                                />
                            </Text>
                        </div>
                        <div className="flex flex-row   items-start gap-2 ">
                            <div className="flex flex-row gap-2">
                                <label className="text-justify  self-center  font-semibold">结束时间</label>
                                <div className="flex flex-row col-span-3 gap-2">
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
                                            value={dayjs(editingDutyRecord?.outTime, "YYYY-MM-DD HH:mm:ss").format(
                                                "YYYY-MM-DD"
                                            )}
                                            onChange={(e) => {
                                                const outTime_HHmmss = dayjs(
                                                    editingDutyRecord.outTime,
                                                    "YYYY-MM-DD HH:mm:ss"
                                                ).format("HH:mm:ss");
                                                const outTime_YYYYMMDD = e.target.value;
                                                setEditingDutyRecord((prev) => ({
                                                    ...prev,
                                                    outTime: `${outTime_YYYYMMDD} ${outTime_HHmmss}`,
                                                }));
                                            }}
                                        />
                                    </Text>
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
                                        时刻
                                        <input
                                            className="border rounded-sm p-1 text-base bg-gray-100"
                                            type="time"
                                            step="1"
                                            value={dayjs(editingDutyRecord?.outTime, "YYYY-MM-DD HH:mm:ss").format(
                                                "HH:mm:ss"
                                            )}
                                            onChange={(e) => {
                                                const outTime_YYYYMMDD = dayjs(
                                                    editingDutyRecord.outTime,
                                                    "YYYY-MM-DD HH:mm:ss"
                                                ).format("YYYY-MM-DD");
                                                const outTime_HHmmss = e.target.value;
                                                setEditingDutyRecord((prev) => ({
                                                    ...prev,
                                                    outTime: `${outTime_YYYYMMDD} ${outTime_HHmmss}`,
                                                }));
                                            }}
                                        />
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-4 bg-slate-100 p-2 rounded-lg">
                        <div>
                            <label htmlFor="username" className="text-justify  self-start font-semibold">
                                关联数据ID
                                <span className="text-sm text-red-500">(教员需要添加对应项)</span>
                            </label>
                            <div className="flex flex-row items-center gap-2">
                                {editingDutyRecord?.relatedDutyTableRowId?.map((rId, index) => {
                                    return (
                                        <label
                                            key={index}
                                            className={`flex flex-row flex-nowrap  items-center border-[1px] border-blue-200 bg-blue-100 
                                            text-blue-800 px-3 py-1 rounded-full text-sm  ${
                                                dutyIdCheckResult[rId] === false
                                                    ? "border-red-300 bg-red-100 text-red-800"
                                                    : "border-blue-200 bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            {rId}
                                            <button
                                                className="ml-1 text-red-300 hover:text-red-600 hover:font-extrabold"
                                                onClick={() => handleRemove(index)}
                                            >
                                                X
                                            </button>
                                        </label>
                                    );
                                })}
                                {isEditing === false ? (
                                    <label className="flex flex-row flex-nowrap  items-center border-[1px] border-blue-200 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        <button
                                            className="mr-1 text-red-300 hover:text-red-600 hover:font-extrabold"
                                            onClick={() => {
                                                setIsEditing(true);
                                            }}
                                        >
                                            +
                                        </button>
                                        添加
                                    </label>
                                ) : (
                                    <input
                                        className="border-[1px] border-blue-500 rounded-sm px-2 w-[10rem]"
                                        type="number"
                                        ref={inputRef}
                                        value={newRelatedDutyRecordId}
                                        onChange={(e) => setNewRelatedDutyRecordId(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={handleBlur}
                                    />
                                )}
                                <div className="text-sm text-red-500">回车确定</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 提示信息 */}
                <div className="text-wrap ">
                    <span className="text-red-500 font-semibold">{errorLog}</span>
                    {JSON.stringify(editingDutyRecord)}
                </div>
                <div className="flex flex-row gap-4 justify-end">
                    <Button
                        disabled={!canSave || errorLog}
                        onClick={() => {
                            const _editingDutyRecord = { ...editingDutyRecord };
                            if (editingDutyRecord.roleType === "见习") {
                                _editingDutyRecord.roleStartTime = _editingDutyRecord.inTime;
                                _editingDutyRecord.roleEndTime = _editingDutyRecord.outTime;
                            }
                            if (_editingDutyRecord.roleType === "教员") {
                                _editingDutyRecord.roleType = null;
                            }

                            fetch(API_URL.duty, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(_editingDutyRecord),
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    console.log("Success:", data);
                                    if (data.success) {
                                        // mutate();
                                    }
                                    setErrorLog("");
                                    setDialogPayload({ AddNewDutyRecordDialogDisplay: false });
                                })
                                .catch((error) => {
                                    console.error("Error:", error);
                                });
                        }}
                    >
                        保存修改
                    </Button>
                    <Button color="red">重新填写</Button>
                </div>
            </div>
        </Theme>
    );
}

export default EditDutyRecord;
