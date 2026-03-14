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
dayjs.extend(duration);
import useDialog from "../../../../utils/hooks/useDialog.js";

function EditDutyRecord() {
    const { selectedDutyRecord, positions } = useStore();
    const [editingDutyRecord, setEditingDutyRecord] = useState({});
    const [canSave, setCanSave] = useState(false);
    const [errorLog, setErrorLog] = useState(null);
    const [newRelatedDutyRecordId, setNewRelatedDutyRecordId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);
    const { dialogPayload, setDialogPayload } = useDialog();

    useEffect(() => {
        setEditingDutyRecord(selectedDutyRecord);
    }, [selectedDutyRecord]);

    useEffect(() => {
        if (JSON.stringify(selectedDutyRecord) !== JSON.stringify(editingDutyRecord)) {
            setCanSave(true);
        } else {
            setCanSave(false);
        }
        if (dayjs(editingDutyRecord?.inTime).isAfter(dayjs(editingDutyRecord?.outTime))) {
            setErrorLog("开始时间不能早于结束时间");
            setCanSave(false);
        } else if (dayjs(editingDutyRecord?.outTime).diff(dayjs(editingDutyRecord?.inTime), "hour", true) > 8.5) {
            setErrorLog("单次打卡时间不能超过8.5小时");
            setCanSave(false);
        } else if (editingDutyRecord?.roleType !== null && editingDutyRecord?.relatedDutyTableRowId === null) {
            setErrorLog("教员或学员必须关联另一方的考勤数据");
            setCanSave(false);
        } else {
            setErrorLog(null);
            setCanSave(true);
        }
    }, [selectedDutyRecord, editingDutyRecord, setCanSave]);

    // 自动聚焦到 input
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            // 可选：选中所有文本
            inputRef.current.select();
        }
    }, [isEditing]);

    // 保存编辑
    const handleSave = () => {
        setIsEditing(false);
        // 这里可以添加保存到后端等逻辑
        console.log("保存的值:", newRelatedDutyRecordId);
        setEditingDutyRecord((prev) => {
            if (prev.relatedDutyTableRowId === null) {
                return { ...prev, relatedDutyTableRowId: newRelatedDutyRecordId + ";" };
            } else {
                return { ...prev, relatedDutyTableRowId: prev.relatedDutyTableRowId + newRelatedDutyRecordId + ";" };
            }
        });
    };

    // 取消编辑
    const handleCancel = () => {
        setIsEditing(false);
        // 可选：恢复原始值
        // setValue(originalValue);
    };

    // 处理键盘事件
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    };

    // 处理输入框失去焦点
    const handleBlur = () => {
        handleSave(); // 或者 handleCancel() 根据需求决定
    };

    return (
        <Theme accentColor="indigo">
            <div className="m-auto  text-nowrap flex flex-col gap-2 py-2">
                <div className="flex flex-row items-start gap-2">
                    <label className="font-bold">
                        执勤数据库ID:<span className="px-1  text-blue-500">{selectedDutyRecord.id}</span>
                    </label>
                    <label className="font-bold">
                        用户ID:<span className="px-1 text-blue-500">{selectedDutyRecord.userId}</span>
                    </label>
                    <label className="font-bold">
                        姓名:<span className="px-1 text-blue-500">{selectedDutyRecord.username}</span>
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
                                        {item.canTeach !== 0 && (
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
                                        )}
                                    </div>

                                    //
                                );
                            })}
                        </div>
                        <label className="text-justify text-blue-600  font-semibold">不要勾选 教员或见习</label>
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
                                    min={dayjs(selectedDutyRecord?.inTime, "YYYY-MM-DD HH:mm:ss")
                                        .subtract(2, "days")
                                        .format("YYYY-MM-DD")}
                                    max={dayjs(selectedDutyRecord?.inTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD")}
                                    onChange={(e) => {
                                        console.log(e.target.value);

                                        setEditingDutyRecord((prev) => {
                                            const inTime_HHmmss = dayjs(prev.inTime, "YYYY-MM-DD HH:mm:ss").format(
                                                "HH:mm:ss"
                                            );
                                            const inTime_YYYYMMDD = e.target.value;

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
                                    value={dayjs(editingDutyRecord?.inTime, "YYYY-MM-DD HH:mm:ss").format("HH:mm:ss")}
                                    onChange={(e) => {
                                        console.log(e.target.value);

                                        setEditingDutyRecord((prev) => {
                                            const inTime_YYYYMMDD = dayjs(prev.inTime, "YYYY-MM-DD HH:mm:ss").format(
                                                "YYYY-MM-DD"
                                            );
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
                                            min={dayjs(selectedDutyRecord?.inTime, "YYYY-MM-DD HH:mm:ss")
                                                .subtract(2, "days")
                                                .format("YYYY-MM-DD")}
                                            max={dayjs(selectedDutyRecord?.inTime, "YYYY-MM-DD HH:mm:ss")
                                                .add(2, "days")
                                                .format("YYYY-MM-DD")}
                                            onChange={(e) => {
                                                setEditingDutyRecord((prev) => {
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
                                                setEditingDutyRecord((prev) => {
                                                    const outTime_YYYYMMDD = dayjs(
                                                        prev.inTime,
                                                        "YYYY-MM-DD HH:mm:ss"
                                                    ).format("YYYY-MM-DD");
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
                    <div className="flex flex-col items-start gap-4 bg-slate-100 p-2 rounded-lg">
                        <div>
                            <label htmlFor="username" className="text-justify  self-start font-semibold">
                                关联数据ID{" "}
                                <span className="text-sm text-red-500">(教员或学员的数据,需要修改对应项)</span>
                            </label>
                            <div className="flex flex-row ">
                                {Array.isArray(editingDutyRecord?.relatedDutyTableRowId) ? (
                                    editingDutyRecord?.relatedDutyTableRowId?.map((rId, index) => {
                                        return (
                                            <label
                                                key={index}
                                                className="flex flex-row flex-nowrap  items-center border-[1px] border-blue-200 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                            >
                                                {rId}
                                                <button
                                                    className="ml-1 text-red-300 hover:text-red-600 hover:font-extrabold"
                                                    onClick={() => {
                                                        // 获取当前标签数组
                                                        const currentTags = (
                                                            editingDutyRecord?.relatedDutyTableRowId || ""
                                                        )
                                                            .split(";")
                                                            .filter(Boolean);

                                                        // 过滤掉要删除的标签

                                                        const updatedTags = currentTags.filter((_, i) => i !== index);
                                                        const newValue =
                                                            updatedTags.length > 0 ? updatedTags.join(";") : null;

                                                        // 更新状态
                                                        setEditingDutyRecord((prev) => ({
                                                            ...prev,
                                                            relatedDutyTableRowId: newValue,
                                                        }));
                                                    }}
                                                >
                                                    X
                                                </button>
                                            </label>
                                        );
                                    })
                                ) : (
                                    <label className="flex flex-row flex-nowrap  items-center border-[1px] border-blue-200 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {editingDutyRecord?.relatedDutyTableRowId}
                                        <button
                                            className="ml-1 text-red-300 hover:text-red-600 hover:font-extrabold"
                                            onClick={() => {
                                                // 获取当前标签数组
                                                // const currentTags = (editingDutyRecord?.relatedDutyTableRowId || "")
                                                //     .split(";")
                                                //     .filter(Boolean);

                                                // // 过滤掉要删除的标签

                                                // const updatedTags = currentTags.filter((_, i) => i !== index);
                                                // const newValue = updatedTags.length > 0 ? updatedTags.join(";") : null;

                                                // // 更新状态
                                                // setEditingDutyRecord((prev) => ({
                                                //     ...prev,
                                                //     relatedDutyTableRowId: newValue,
                                                // }));
                                            }}
                                        >
                                            X
                                        </button>
                                    </label>
                                )}
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* 提示信息 */}
                <div>
                    <span className="text-red-500 font-semibold">{errorLog}</span>
                </div>
                <div className="flex flex-row gap-4 justify-end">
                    <Button
                        disabled={!canSave || errorLog}
                        onClick={() => {
                            fetch(API_URL.duty + "/" + selectedDutyRecord.id, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(editingDutyRecord),
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    console.log("Success:", data);
                                    // if (data.success) {
                                    //     mutate();
                                    // }
                                    setErrorLog("");
                                    setDialogPayload({ editSheetDisplay: false });
                                })
                                .catch((error) => {
                                    console.error("Error:", error);
                                });
                        }}
                    >
                        保存修改
                    </Button>
                    <Button
                        color="red"
                        onClick={() => {
                            fetch(API_URL.duty + "/" + selectedDutyRecord.id, {
                                method: "DELETE",
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    console.log("Success:", data);
                                    // if (data.success) {
                                    //     mutate();
                                    // }
                                    setErrorLog("");
                                })
                                .catch((error) => {
                                    console.error("Error:", error);
                                });
                            setDialogPayload({ editSheetDisplay: false });
                        }}
                    >
                        删除此条目
                    </Button>
                </div>
            </div>
        </Theme>
    );
}

export default EditDutyRecord;
