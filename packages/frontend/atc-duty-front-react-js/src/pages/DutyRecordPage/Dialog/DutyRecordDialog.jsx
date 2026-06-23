import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button, Theme } from "@radix-ui/themes";
import dayjs from "dayjs";
import { dialogStore } from "../../../store/dialog.store";
import { useDutyStore } from "../../../store/duty.store";
import { useAppStore } from "../../../store/app.store";

function getUserPositionPermission(user, positionName) {
    const info = user?.position?.find((p) => p.position === positionName);

    return {
        canDuty: !!info,

        canMain: info?.dutyType?.includes("主班") ?? false,

        canSub: info?.dutyType?.includes("副班") ?? false,

        canTeach: info?.roleType === "教员",

        canStudent: info?.roleType === "见习",

        info,
    };
}

function DutyRecordDialog({ selectedUser }) {
    const { dutyDialogOpen, dutyDialogMode, dutyDialogRecord, dutyDialogUser, closeDutyDialog } = dialogStore();
    const { positions } = useAppStore();
    const { updateDuty, deleteDuty, createDuty } = useDutyStore();

    const dialogRef = useRef(null);
    const isEdit = dutyDialogMode === "edit";

    const [editingDutyRecord, setEditingDutyRecord] = useState({});
    const [isEditingRelated, setIsEditingRelated] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (dutyDialogOpen && !dialog.open) {
            dialog.showModal();
        } else if (!dutyDialogOpen && dialog.open) {
            dialog.close();
        }
    }, [dutyDialogOpen]);

    const { canSave, errorLog } = useMemo(() => {
        if (!dutyDialogOpen) {
            return {
                canSave: false,
                errorLog: null,
            };
        }

        if (dayjs(editingDutyRecord?.inTime).isAfter(dayjs(editingDutyRecord?.outTime))) {
            return {
                canSave: false,
                errorLog: "开始时间不能晚于结束时间",
            };
        }

        if (dayjs(editingDutyRecord?.outTime).diff(dayjs(editingDutyRecord?.inTime), "hour", true) > 6) {
            return {
                canSave: false,
                errorLog: "单次打卡时间不能超过6小时",
            };
        }

        if (editingDutyRecord?.roleType !== null && !editingDutyRecord?.relatedDutyTableRowId) {
            return {
                canSave: false,
                errorLog: "教员或学员必须关联另一方考勤",
            };
        }

        return {
            canSave: JSON.stringify(dutyDialogRecord) !== JSON.stringify(editingDutyRecord),
            errorLog: null,
        };
    }, [editingDutyRecord, dutyDialogRecord, dutyDialogOpen]);

    useEffect(() => {
        if (isEditingRelated && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingRelated]);

    const handleAddRelatedId = () => {
        setIsEditingRelated(false);
        if (!newRelatedDutyRecordId) return;
        setEditingDutyRecord((prev) => {
            const current = prev.relatedDutyTableRowId || "";
            return {
                ...prev,
                relatedDutyTableRowId: current ? current + newRelatedDutyRecordId + ";" : newRelatedDutyRecordId + ";",
            };
        });
        setNewRelatedDutyRecordId("");
    };

    const handleRemoveRelatedId = (index) => {
        const ids = (editingDutyRecord?.relatedDutyTableRowId || "").split(";").filter(Boolean);
        const updated = ids.filter((_, i) => i !== index);
        setEditingDutyRecord((prev) => ({
            ...prev,
            relatedDutyTableRowId: updated.length > 0 ? updated.join(";") : null,
        }));
    };

    const handleSave = async () => {
        let result;
        if (isEdit) {
            result = await updateDuty(editingDutyRecord.id, editingDutyRecord);
        } else {
            result = await createDuty(editingDutyRecord);
        }
        if (result) closeDutyDialog();
    };

    const handleDelete = async () => {
        const result = await deleteDuty(dutyDialogRecord.id);
        if (result) closeDutyDialog();
    };

    const handleReset = () => {
        if (isEdit && dutyDialogRecord) {
            setEditingDutyRecord({ ...dutyDialogRecord });
        } else if (!isEdit && dutyDialogUser) {
            setEditingDutyRecord(buildEmpty(dutyDialogUser));
        }
        setErrorLog(null);
    };

    const handleClose = () => {
        closeDutyDialog();
    };

    return (
        <dialog
            ref={dialogRef}
            className="rounded-lg shadow-xl border p-0 w-full max-w-[80%] backdrop:bg-black/50 m-auto"
            onClose={handleClose}
            onClick={(e) => {
                if (e.target === dialogRef.current) handleClose();
            }}
            style={{ margin: "auto" }}
        >
            <div className="max-h-[90vh] overflow-y-auto p-6">
                {JSON.stringify(dutyDialogOpen)}
                {JSON.stringify(dutyDialogMode)}
                {JSON.stringify(dutyDialogRecord?.id)}
                {JSON.stringify(dutyDialogUser?.username)}
                <h2 className="text-lg font-bold mb-1 mx-auto text-center text-blue-700">
                    {isEdit ? "修改执勤记录" : "新增执勤记录"}
                </h2>
                <p className="text-sm text-gray-500 ">
                    {isEdit
                        ? "此功能仅能修改执勤记录，如果此条目具备教员资格，请先检查或修改学员记录。"
                        : "为当前用户新增一条执勤记录。"}
                </p>

                <Theme accentColor="indigo">
                    <div className="m-auto text-nowrap flex flex-col gap-2 py-2">
                        <div className="flex flex-row items-start gap-2">
                            {isEdit && (
                                <label className="font-bold">
                                    执勤数据库ID:<span className="px-1 text-blue-500">{dutyDialogRecord?.id}</span>
                                </label>
                            )}
                            <label className="font-bold">
                                用户ID:<span className="px-1 text-blue-500">{selectedUser?.id}</span>
                            </label>
                            <label className="font-bold">
                                姓名:<span className="px-1 text-blue-500">{selectedUser?.username}</span>
                            </label>
                        </div>

                        <div className="flex flex-row items-start gap-2">
                            <label className="font-bold">席位</label>
                            <div className="flex flex-col flex-wrap gap-2 items-start">
                                <div className="flex flex-row flex-wrap gap-2 items-start">
                                    {positions.map((item, index) => {
                                        const permission = getUserPositionPermission(dutyDialogUser, item.position);
                                        return (
                                            <div
                                                key={index}
                                                className=" flex flex-col gap-1 justify-start border border-gray-200 bg-gray-100 px-[0.5rem] py-1 rounded"
                                            >
                                                <label className="inline-flex gap-1 items-center">
                                                    <input
                                                        value={item.position}
                                                        type="radio"
                                                        name="position-radio"
                                                        disabled={!permission.canDuty}
                                                        checked={item.position === dutyDialogRecord?.position}
                                                        onChange={(e) => {
                                                            setEditingDutyRecord((prev) => {
                                                                return {
                                                                    ...prev,
                                                                    position: e.target.value,
                                                                };
                                                            });
                                                        }}
                                                    />
                                                    {item.position}
                                                </label>
                                                {item.dutyType && (
                                                    <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                                                        {["主班", "副班"].map((x, i) => {
                                                            const disabled =
                                                                (x === "主班" && !permission.canMain) ||
                                                                (x === "副班" && !permission.canSub);
                                                            return (
                                                                <label key={i} className="inline-flex gap-1">
                                                                    <input
                                                                        type="radio"
                                                                        disabled={disabled}
                                                                        checked={
                                                                            x === editingDutyRecord?.dutyType &&
                                                                            item.position ===
                                                                                editingDutyRecord?.position
                                                                        }
                                                                        value={x}
                                                                        name={`${index}isMainOrCo-radio`}
                                                                        onChange={() =>
                                                                            setEditingDutyRecord((prev) => ({
                                                                                ...prev,
                                                                                dutyType: x,
                                                                            }))
                                                                        }
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
                                                            const disabled =
                                                                (y === "教员" && !permission.canTeach) ||
                                                                (y === "见习" && !permission.canStudent);
                                                            return (
                                                                <label key={i} className="inline-flex gap-1">
                                                                    <input
                                                                        type="radio"
                                                                        value={y}
                                                                        disabled={disabled}
                                                                        checked={
                                                                            y === editingDutyRecord?.roleType &&
                                                                            item.position ===
                                                                                editingDutyRecord?.position
                                                                        }
                                                                        name={`${index}isTeacherOrStudent`}
                                                                        onChange={() =>
                                                                            setEditingDutyRecord((prev) => ({
                                                                                ...prev,
                                                                                roleType: y,
                                                                            }))
                                                                        }
                                                                    />
                                                                    {y}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row items-start gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-start gap-2">
                                    <label className="text-justify self-center font-semibold">开始时间</label>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm">日期</span>
                                        <input
                                            className="border rounded-sm p-1 text-base bg-gray-100"
                                            type="date"
                                            value={dayjs(editingDutyRecord?.inTime, "YYYY-MM-DD HH:mm:ss").format(
                                                "YYYY-MM-DD"
                                            )}
                                            onChange={(e) => {
                                                setEditingDutyRecord((prev) => {
                                                    const t = dayjs(prev.inTime, "YYYY-MM-DD HH:mm:ss").format(
                                                        "HH:mm:ss"
                                                    );
                                                    return { ...prev, inTime: `${e.target.value} ${t}` };
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm">时刻</span>
                                        <input
                                            className="border rounded-sm p-1 text-base bg-gray-100"
                                            type="time"
                                            step="1"
                                            value={dayjs(editingDutyRecord?.inTime, "YYYY-MM-DD HH:mm:ss").format(
                                                "HH:mm:ss"
                                            )}
                                            onChange={(e) => {
                                                setEditingDutyRecord((prev) => {
                                                    const d = dayjs(prev.inTime, "YYYY-MM-DD HH:mm:ss").format(
                                                        "YYYY-MM-DD"
                                                    );
                                                    return { ...prev, inTime: `${d} ${e.target.value}` };
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-row items-start gap-2">
                                    <label className="text-justify self-center font-semibold">结束时间</label>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm">日期</span>
                                        <input
                                            className="border rounded-sm p-1 text-base bg-gray-100"
                                            type="date"
                                            value={dayjs(editingDutyRecord?.outTime, "YYYY-MM-DD HH:mm:ss").format(
                                                "YYYY-MM-DD"
                                            )}
                                            onChange={(e) => {
                                                setEditingDutyRecord((prev) => {
                                                    const t = dayjs(prev.outTime, "YYYY-MM-DD HH:mm:ss").format(
                                                        "HH:mm:ss"
                                                    );
                                                    return { ...prev, outTime: `${e.target.value} ${t}` };
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm">时刻</span>
                                        <input
                                            className="border rounded-sm p-1 text-base bg-gray-100"
                                            type="time"
                                            step="1"
                                            value={dayjs(editingDutyRecord?.outTime, "YYYY-MM-DD HH:mm:ss").format(
                                                "HH:mm:ss"
                                            )}
                                            onChange={(e) => {
                                                setEditingDutyRecord((prev) => {
                                                    const d = dayjs(prev.outTime, "YYYY-MM-DD HH:mm:ss").format(
                                                        "YYYY-MM-DD"
                                                    );
                                                    return { ...prev, outTime: `${d} ${e.target.value}` };
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-start gap-4 bg-slate-100 p-2 rounded-lg">
                                <div>
                                    <label className="text-justify self-start font-semibold">
                                        关联数据ID <span className="text-sm text-red-500">(教员或学员的数据ID)</span>
                                    </label>
                                    <div className="flex flex-row flex-wrap gap-1 mt-1">
                                        {(() => {
                                            const related = editingDutyRecord?.relatedDutyTableRowId;
                                            if (!related) return null;
                                            return related
                                                .split(";")
                                                .filter(Boolean)
                                                .map((rId, index) => (
                                                    <label
                                                        key={index}
                                                        className="flex flex-row flex-nowrap items-center border border-blue-200 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {rId}
                                                        <button
                                                            className="ml-1 text-red-300 hover:text-red-600 hover:font-extrabold"
                                                            onClick={() => handleRemoveRelatedId(index)}
                                                        >
                                                            X
                                                        </button>
                                                    </label>
                                                ));
                                        })()}
                                        {!isEditingRelated ? (
                                            <label className="flex flex-row flex-nowrap items-center border border-blue-200 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                <button
                                                    className="mr-1 text-red-300 hover:text-red-600 hover:font-extrabold"
                                                    onClick={() => setIsEditingRelated(true)}
                                                >
                                                    +
                                                </button>
                                                添加
                                            </label>
                                        ) : (
                                            <input
                                                className="border border-blue-500 rounded-sm px-2 w-[10rem]"
                                                type="number"
                                                ref={inputRef}
                                                value={newRelatedDutyRecordId}
                                                onChange={(e) => setNewRelatedDutyRecordId(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleAddRelatedId();
                                                    if (e.key === "Escape") {
                                                        setIsEditingRelated(false);
                                                        setNewRelatedDutyRecordId("");
                                                    }
                                                }}
                                                onBlur={handleAddRelatedId}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-red-500 font-semibold">{errorLog}</span>
                        </div>

                        <div className="flex flex-row gap-4 justify-end">
                            <Button disabled={!canSave || !!errorLog} onClick={handleSave}>
                                {isEdit ? "保存修改" : "保存新增"}
                            </Button>
                            {isEdit && (
                                <Button color="red" onClick={handleDelete}>
                                    删除此条目
                                </Button>
                            )}
                            <Button color="gray" variant="soft" onClick={handleReset}>
                                重新填写
                            </Button>
                            <Button variant="outline" onClick={handleClose}>
                                关闭
                            </Button>
                        </div>
                    </div>
                </Theme>
            </div>
        </dialog>
    );
}

export default DutyRecordDialog;
