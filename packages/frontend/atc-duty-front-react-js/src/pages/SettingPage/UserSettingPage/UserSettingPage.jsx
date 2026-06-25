import { Button, Radio, RadioGroup } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { useAppStore } from "../../../store/app.store";
import { useUserStore } from "../../../store/user.store";

function UserSettingPage() {
    const { positions, positionsLoading } = useAppStore();
    const { allDetailUsers, loading, updateUser, selectedUser, setSelectedUser } = useUserStore();

    const [needSave, setNeedSave] = useState(false);
    const [newSelectedUserValue, setNewSelectedUserValue] = useState(null);

    useEffect(() => {
        setNeedSave(JSON.stringify(selectedUser) !== JSON.stringify(newSelectedUserValue));
    }, [selectedUser, newSelectedUserValue]);

    useEffect(() => {
        console.log("selectedUser changed:", selectedUser);
        setNewSelectedUserValue(selectedUser);
    }, [selectedUser]);

    if (loading || positionsLoading) return <div>加载中...</div>;

    return (
        <div className="flex-1 items-center content-start">
            <h1 className="text-xl font-bold text-blue-400">此处修改管制员岗位资格</h1>

            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <fieldset className="border border-gray-300 rounded-md p-2">
                    <legend className="text-lg font-bold">选择用户</legend>
                    <RadioGroup.Root
                        name="user-select"
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: "0.6rem",
                            justifyContent: "flex-start",
                            alignItems: "center",
                        }}
                        value={selectedUser?.id || ""}
                        onValueChange={(id) => {
                            console.log("Selected user ID:", id);
                            const user = allDetailUsers.find((x) => x.id === id);
                            console.log("User selected:", user);
                            setSelectedUser(user);
                            setNewSelectedUserValue(user);
                        }}
                    >
                        {allDetailUsers.map((item) => (
                            <RadioGroup.Item
                                value={item.id}
                                key={item.id}
                                style={{ gap: "0.25rem" }}
                                className={`hover:font-bold hover:text-blue-700  ${
                                    selectedUser?.id === item.id ? "font-bold text-blue-700" : ""
                                }`}
                            >
                                {item.username}
                            </RadioGroup.Item>
                        ))}
                    </RadioGroup.Root>
                </fieldset>

                <fieldset className="border border-gray-300 rounded-md p-2">
                    <legend className="text-lg font-bold">席位权限</legend>
                    <div className="flex flex-row gap-2 flex-wrap">
                        {positions.map((item) => {
                            const p = item.position;
                            return (
                                <div
                                    key={p}
                                    className="flex flex-col gap-1 justify-start border border-gray-200 bg-gray-100 px-2 py-1 rounded"
                                >
                                    <label className="inline-flex gap-1 items-center">
                                        <input
                                            value={p}
                                            type="checkbox"
                                            checked={
                                                newSelectedUserValue?.position?.some((x) => x.position === p) ?? false
                                            }
                                            onChange={() => {
                                                setNewSelectedUserValue((prev) => {
                                                    const prevPosition = prev.position ? [...prev.position] : [];
                                                    const positionExists = prevPosition.some((x) => x.position === p);

                                                    let newPosition;
                                                    if (positionExists) {
                                                        newPosition = prevPosition.filter(
                                                            (item) => item.position !== p
                                                        );
                                                    } else {
                                                        newPosition = [
                                                            ...prevPosition,
                                                            { position: p, dutyType: null, roleType: null },
                                                        ];
                                                    }

                                                    return { ...prev, position: newPosition };
                                                });
                                            }}
                                        />
                                        {p}
                                    </label>
                                    {item.dutyType !== null && (
                                        <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                                            {["主班", "副班"].map((x) => (
                                                <label key={x} className="inline-flex gap-1">
                                                    <input
                                                        type="checkbox"
                                                        value={x}
                                                        disabled={
                                                            !newSelectedUserValue?.position?.some(
                                                                (v) => v.position === p
                                                            )
                                                        }
                                                        checked={
                                                            newSelectedUserValue?.position?.some(
                                                                (v) => v.position === p && v?.dutyType?.includes(x)
                                                            ) ?? false
                                                        }
                                                        onChange={() => {
                                                            setNewSelectedUserValue((prev) => {
                                                                const updatedPosition = prev.position.map((pos) => {
                                                                    if (pos.position === p) {
                                                                        let dutyType = pos.dutyType || "";
                                                                        const dutyTypes = dutyType
                                                                            .split(",")
                                                                            .filter(Boolean);
                                                                        if (dutyTypes.includes(x)) {
                                                                            dutyType = dutyTypes
                                                                                .filter((dt) => dt !== x)
                                                                                .join(",");
                                                                        } else {
                                                                            dutyType = [...dutyTypes, x].join(",");
                                                                        }
                                                                        return { ...pos, dutyType };
                                                                    }
                                                                    return pos;
                                                                });
                                                                return { ...prev, position: updatedPosition };
                                                            });
                                                        }}
                                                    />
                                                    {x}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {item.canTeach !== 0 && (
                                        <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                                            {["教员", "见习"].map((y) => (
                                                <label key={y} className="inline-flex gap-1">
                                                    <input
                                                        type="radio"
                                                        value={y}
                                                        disabled={
                                                            !newSelectedUserValue?.position?.some(
                                                                (x) => x.position === p
                                                            )
                                                        }
                                                        checked={
                                                            newSelectedUserValue?.position?.some(
                                                                (x) => x.position === p && x.roleType === y
                                                            ) ?? false
                                                        }
                                                        onChange={() => {
                                                            setNewSelectedUserValue((prev) => {
                                                                const updatedPosition = prev.position.map((pos) => {
                                                                    if (pos.position === p) {
                                                                        let roleType = pos.roleType || "";
                                                                        roleType = roleType === y ? "" : y;
                                                                        return { ...pos, roleType };
                                                                    }
                                                                    return pos;
                                                                });
                                                                return { ...prev, position: updatedPosition };
                                                            });
                                                        }}
                                                    />
                                                    {y}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </fieldset>

                <fieldset className="border border-gray-300 rounded-md p-2">
                    <legend className="text-lg font-bold">岗位权限</legend>
                    <div className="flex flex-row gap-2 flex-wrap">
                        {["管制员", "教员", "见习", "领班"].map((item) => (
                            <div
                                key={item}
                                className="flex flex-col gap-1 justify-start border border-gray-200 bg-gray-100 px-2 py-1 rounded"
                            >
                                <label className="inline-flex gap-1 items-center">
                                    <input
                                        value={item}
                                        type="checkbox"
                                        checked={newSelectedUserValue?.roleType?.includes(item) ?? false}
                                        onChange={() => {
                                            setNewSelectedUserValue((prev) => {
                                                let _roles = [...(prev.roleType || [])];
                                                if (_roles.includes(item)) {
                                                    _roles = _roles.filter((dt) => dt !== item);
                                                } else {
                                                    _roles.push(item);
                                                }
                                                return { ...prev, roleType: _roles };
                                            });
                                        }}
                                    />
                                    {item}
                                </label>
                            </div>
                        ))}
                    </div>
                </fieldset>

                <Button
                    className="flex-0 max-w-fit self-end"
                    color="red"
                    disabled={!needSave}
                    onClick={async () => {
                        await updateUser(selectedUser.id, newSelectedUserValue);
                        setNewSelectedUserValue(selectedUser);
                        setNeedSave(false);
                    }}
                >
                    保存
                </Button>
            </form>
        </div>
    );
}

export default UserSettingPage;
