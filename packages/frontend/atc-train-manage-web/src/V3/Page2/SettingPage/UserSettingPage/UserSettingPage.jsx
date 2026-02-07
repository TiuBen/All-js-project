import { Button, Flex, Checkbox, CheckboxGroup, Text, TextField, Radio, RadioGroup } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { API_URL } from "../../../../utils/const/Const";
import useSWR, { mutate } from "swr";
import { usePage, SERVER_URL, FETCHER } from "@utils";

function UserSettingPage() {
    const { data: positions } = useSWR(API_URL.query_positions, FETCHER);
    const { data: users } = useSWR(API_URL.users, FETCHER);
    const [selectedUserName, setSelectedUserName] = useState("");
    const { payload, setPayload } = usePage();

    const [selectedUserID, setSelectedUserID] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);

    const [needSave, setNeedSave] = useState(false);
    const [rawSelectedUser, setRawSelectedUser] = useState(null);

    useEffect(() => {
        fetch(`${API_URL.users}/${selectedUserID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setSelectedUser(data);
                setRawSelectedUser(data);
                console.log(data);
            })
            .catch((error) => {
                console.log("Error fetching data:", error);
            });
    }, [selectedUserID]);

    useEffect(() => {
        if (JSON.stringify(selectedUser) !== JSON.stringify(rawSelectedUser)) {
            setNeedSave(true);
        } else {
            setNeedSave(false);
        }
    }, [selectedUser, rawSelectedUser]);

    const [userPositionSetting, setUserPositionSetting] = useState([]);

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
                            if (needSave) {
                                window.alert("请先保存");
                            } else {
                                setSelectedUserID(value);
                            }
                        }}
                    >
                        {users &&
                            users.map((item, i) => {
                                return (
                                    <RadioGroup.Item
                                        value={item.id}
                                        key={i}
                                        style={{ gap: "0.25rem" }}
                                        className=" hover:font-bold hover:text-blue-700"
                                        checked={selectedUserID === item.id}
                                    >
                                        {item.username}
                                    </RadioGroup.Item>
                                );
                            })}
                    </RadioGroup.Root>
                </fieldset>
                <fieldset className="border  rounded-md  p-2">
                    <legend className="text-lg font-bold">席位权限</legend>
                    <div className="flex flex-row gap-2 flex-wrap">
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
                                            checked={selectedUser?.position?.some((x) => x.position === p)}
                                            onChange={(e) => {
                                                console.log(e.target.value);

                                                setSelectedUser((prev) => {
                                                    const prevPosition = prev.position ? [...prev.position] : [];
                                                    const positionExists = prevPosition.some((x) => x.position === p);

                                                    let newPosition;
                                                    if (positionExists) {
                                                        // Remove the position if it already exists
                                                        newPosition = prevPosition.filter(
                                                            (item) => item.position !== p
                                                        );
                                                    } else {
                                                        // Add the position if it doesn't exist
                                                        const newPositionObj = positions.find(
                                                            (pos) => pos.position === p
                                                        );
                                                        if (newPositionObj) {
                                                            newPosition = [
                                                                ...prevPosition,
                                                                { position: p, dutyType: null, roleType: null },
                                                            ];
                                                        } else {
                                                            newPosition = prevPosition; // Fallback in case the position is not found
                                                        }
                                                    }

                                                    return {
                                                        ...prev,
                                                        position: newPosition,
                                                    };
                                                });
                                            }}
                                        />
                                        {p}
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
                                                                !selectedUser?.position?.some((x) => x.position === p)
                                                            }
                                                            checked={selectedUser?.position?.some((v) => {
                                                                return v.position === p && v?.dutyType?.includes(x);
                                                            })}
                                                            onChange={(e) => {
                                                                setSelectedUser((prev) => {
                                                                    const updatedPosition = prev.position.map((pos) => {
                                                                        if (pos.position === p) {
                                                                            let dutyType = pos.dutyType || "";
                                                                            const dutyTypes = dutyType
                                                                                .split(",")
                                                                                .filter(Boolean);
                                                                            if (dutyTypes.includes(x)) {
                                                                                // Remove the duty type if it already exists
                                                                                dutyType = dutyTypes
                                                                                    .filter((dt) => dt !== x)
                                                                                    .join(",");
                                                                            } else {
                                                                                // Add the duty type if it doesn't exist
                                                                                dutyType = [...dutyTypes, x].join(",");
                                                                            }
                                                                            return {
                                                                                ...pos,
                                                                                dutyType,
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
                                                                !selectedUser?.position?.some((x) => x.position === p)
                                                            }
                                                            checked={selectedUser?.position?.some((x) => {
                                                                return x.position === p && x.roleType === y;
                                                            })}
                                                            onChange={(e) => {
                                                                console.log(e.target.value);

                                                                setSelectedUser((prev) => {
                                                                    const updatedPosition = prev.position.map((pos) => {
                                                                        if (pos.position === p) {
                                                                            let roleType = pos.roleType || "";
                                                                            if (roleType === y) {
                                                                                // Remove the duty type if it already exists
                                                                                roleType = "";
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
                <fieldset className="border  rounded-md p-2">
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
                </fieldset>

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
                        fetch(`${API_URL.users}/${selectedUserID}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(selectedUser),
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                console.log(data);
                                // setRawSelectedUser(null);
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
