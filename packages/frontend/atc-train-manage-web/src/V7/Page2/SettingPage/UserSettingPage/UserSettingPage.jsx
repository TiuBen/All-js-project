import { Button, Flex, Checkbox, CheckboxGroup, Text, TextField, Radio, RadioGroup } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { API_URL } from "../../../../utils/const/Const";
import useSWR, { mutate } from "swr";
import { usePage, SERVER_URL, FETCHER } from "@utils";

function UserSettingPage() {
    const { data: positions } = useSWR(API_URL.positions, FETCHER);
    const { data: users } = useSWR(API_URL.users, FETCHER);
    const [selectedUser, setSelectedUser] = useState(null);

    const [needSave, setNeedSave] = useState(false);
    const [rawSelectedUser, setRawSelectedUser] = useState(null);

    useEffect(() => {
        if (JSON.stringify(selectedUser) !== JSON.stringify(rawSelectedUser)) {
            setNeedSave(true);
        } else {
            setNeedSave(false);
        }
    }, [selectedUser, rawSelectedUser]);

    useEffect(() => {
        console.log("users", users);
    }, [users]);


    return (
        <div className=" flex-1 items-center content-start">
            {/* <h1 className="text-2xl font-bold">用户管理</h1> */}
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <fieldset className="border  rounded-md  p-2">
                    <legend className="text-lg font-bold">选择用户</legend>
                    <RadioGroup.Root
                        name="example"
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: "0.6rem",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            alignContent: "flex-start",
                            width: "100%",
                            height: "100%",
                        }}
                        onValueChange={(value) => {
                            console.log(value);
                            if (needSave) {
                                window.alert("请先保存");
                            } else {
                                setSelectedUser(value);
                                setRawSelectedUser(value);
                            }
                        }}
                    >
                        {/* {users &&
                            users?.map((item, i) => {
                                return (
                                    <RadioGroup.Item
                                        value={item}
                                        key={i}
                                        style={{ gap: "0.25rem" }}
                                        className=" hover:font-bold hover:text-blue-700"
                                        checked={selectedUser?.id === i}
                                    >
                                        {item.username}
                                    </RadioGroup.Item>
                                );
                            })} */}
                    </RadioGroup.Root>
                </fieldset>
                <fieldset className="border  rounded-md  p-2">
                    <legend className="text-lg font-bold">席位权限</legend>
                    <div className="flex flex-row gap-2 flex-wrap">
                        {positions?.map((item, index) => {
                            return (
                                //
                                <div
                                    key={index}
                                    className="flex flex-col gap-1 justify-start  border border-gray-200 bg-gray-100 px-[0.5rem] py-1 rounded"
                                >
                                    <label className="inline-flex gap-1 items-center">
                                        <input
                                            value={item.position}
                                            type="checkbox"
                                            checked={selectedUser?.position?.some((x) => x.position === item.position)}
                                            onChange={(e) => {
                                                console.log(e.target.value);

                                                setSelectedUser((prev) => {
                                                    const prevPosition = prev.position ? [...prev.position] : [];
                                                    const currentPosition = item.position;
                                                    const positionExists = prevPosition.some(
                                                        (x) => x.position === currentPosition
                                                    );

                                                    if (positionExists) {
                                                        // Remove the position if it already exists
                                                        return {
                                                            ...prev,
                                                            position: prevPosition.filter(
                                                                (pos) => pos.position !== currentPosition
                                                            ),
                                                        };
                                                    } else {
                                                        // Add the position if it doesn't exist
                                                        return {
                                                            ...prev,
                                                            position: [
                                                                ...prevPosition,
                                                                {
                                                                    position: currentPosition,
                                                                    dutyType: null,
                                                                    roleType: null,
                                                                },
                                                            ],
                                                        };
                                                    }
                                                });
                                            }}
                                        />
                                        {item.position}
                                    </label>
                                    {item.dutyType !== null && (
                                        <div className="flex flex-col border border-gray-200 px-[0.2rem] rounded">
                                            {["主班", "副班"].map((x, i) => {
                                                return (
                                                    <label key={i} className="inline-flex gap-1">
                                                        <input
                                                            type="checkbox"
                                                            value={x}
                                                            name={`${index}isMainOrCo`}
                                                            disabled={
                                                                !selectedUser?.position?.find(
                                                                    (x) => x.position === item.position
                                                                )
                                                            }
                                                            checked={selectedUser?.position?.some((v) => {
                                                                return (
                                                                    v.position === item.position &&
                                                                    v?.dutyType?.includes(x)
                                                                );
                                                            })}
                                                            onChange={(e) => {
                                                                const tempP = selectedUser.position.find(
                                                                    (x) => x.position === item.position
                                                                );
                                                                console.log(tempP);
                                                                if (!tempP) return;

                                                                if (e.target.checked) {
                                                                    // ✅ 勾选：把 dutyType 加进去
                                                                    tempP.dutyType = Array.isArray(tempP.dutyType)
                                                                        ? [...new Set([...tempP.dutyType, x])]
                                                                        : [x];
                                                                } else {
                                                                    // ❌ 取消勾选：把 dutyType 移除
                                                                    tempP.dutyType = (tempP.dutyType || []).filter(
                                                                        (d) => d !== x
                                                                    );
                                                                }
                                                                console.log("更新后的 tempP:", tempP);
                                                                setSelectedUser((prev) => {
                                                                    return {
                                                                        ...prev,
                                                                        position: [...prev.position],
                                                                    };
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
                                                            name={`${index}isTeacherOrStudent`}
                                                            disabled={
                                                                !selectedUser?.position?.some(
                                                                    (x) => x.position === item.position
                                                                )
                                                            }
                                                            checked={selectedUser?.position?.some((x) => {
                                                                return x.position === item.position && x.roleType === y;
                                                            })}
                                                            onChange={(e) => {
                                                                console.log(e.target.value);

                                                                setSelectedUser((prev) => {
                                                                    const updatedPosition = prev.position.map((pos) => {
                                                                        if (pos.position === item.position) {
                                                                            let roleType = pos.roleType || "";
                                                                            if (roleType === y) {
                                                                                // Remove the duty type if it already exists
                                                                                roleType = null;
                                                                            } else {
                                                                                // Add the duty type if it doesn't exist
                                                                                roleType = y;
                                                                            }
                                                                            return {
                                                                                ...pos,
                                                                                roleType: roleType,
                                                                            };
                                                                        }
                                                                        return pos;
                                                                    });

                                                                    return {
                                                                        ...prev,
                                                                        position: updatedPosition,
                                                                    };
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
                </fieldset>
                {/* <fieldset className="border  rounded-md p-2">
                    <legend className="text-lg font-bold">岗位权限</legend>
                    <div className="flex flex-row gap-2 flex-wrap">
                        {["管制员", "教员", "见习", "领班"].map((item, index) => {
                            return (
                                <div
                                    key={index}
                                    className="flex flex-col gap-1 justify-start  border border-gray-200 bg-gray-100 px-[0.5rem] py-1 rounded"
                                >
                                    <label className="inline-flex gap-1 items-center">
                                        <input
                                            value={item}
                                            type="checkbox"
                                            checked={selectedUser?.roleType?.includes(item)}
                                            onChange={(e) => {
                                                setSelectedUser((prev) => {
                                                    let _roles = [...selectedUser.roleType];
                                                    if (_roles.includes(item)) {
                                                        _roles = _roles.filter((dt) => dt !== item);
                                                    } else {
                                                        _roles.push(item);
                                                    }

                                                    return {
                                                        ...prev,
                                                        roleType: _roles,
                                                    };
                                                });
                                            }}
                                        />
                                        {item}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </fieldset> */}

                <fieldset className="border  rounded-md p-2">
                    <legend className="text-lg font-bold">人脸识别照片</legend>
                    <div className="flex flex-1 flex-row gap-2">
                        <div className="w-[180px] h-[240px] border rounded-md">
                            <img src="" alt="系统人脸识别对比照" />
                        </div>
                        <div className="w-[180px] h-[240px] border rounded-md">新照片</div>
                        <Button className="flex-0 max-w-fit self-end">修改已存照片</Button>
                    </div>
                    {/* {JSON.stringify(selectedUser)} */}
                </fieldset>
                <Button
                    className="flex-0 max-w-fit self-end "
                    color="red"
                    disabled={!needSave}
                    onClick={(e) => {
                        fetch(`${API_URL.users}/${selectedUser.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(selectedUser),
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                console.log(data);
                                setRawSelectedUser(data);
                                // setSelectedUserID()
                            });
                        e.preventDefault();
                    }}
                >
                    保存
                </Button>
            </form>
        </div>
    );
}

export default UserSettingPage;
