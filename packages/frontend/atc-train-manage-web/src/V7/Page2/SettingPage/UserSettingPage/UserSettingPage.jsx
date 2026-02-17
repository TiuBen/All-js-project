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

    // 1. 声明状态
    const [localUsers, setLocalUsers] = useState([]); // 注意：改名避免混淆
    const [isSorting, setIsSorting] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);

    useEffect(() => {
        console.log("localUsers", localUsers);
    }, [localUsers]);
    // 2. 当 SWR 的 users 加载完成，且 localUsers 还未初始化（或非排序模式），同步数据
    useEffect(() => {
        if (users && users.length > 0) {
            // 按 rank 升序排列（如果 rank 不存在，默认为 0 或放最后）
            if (users?.length) {
                const sorted = [...users].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
                setLocalUsers(sorted);
            }
        }
    }, [users]); // 只依赖 users，不依赖 isSorting

    // 处理拖拽开始
    const handleDragStart = (e, index) => {
        e.dataTransfer.setData("text/plain", index.toString());
        setDraggedIndex(index);
        e.currentTarget.classList.add("opacity-50");
    };

    // 处理拖拽进入（允许放置）
    const handleDragOver = (e) => {
        e.preventDefault(); // 必须阻止默认，否则 drop 不会触发
    };

    // 处理拖拽到某个元素上
    const handleDragEnter = (e, index) => {
        if (index !== draggedIndex) {
            setHoverIndex(index);
        }
    };

    // 处理释放（drop）
    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        const fromIndex = draggedIndex;
        const toIndex = targetIndex;

        if (fromIndex === null || fromIndex === toIndex) {
            resetDragState();
            return;
        }

        // 更新 users 顺序（基于当前 users 状态）
        setLocalUsers((prevUsers) => {
            const newUsers = [...prevUsers];
            const [movedItem] = newUsers.splice(fromIndex, 1);
            newUsers.splice(toIndex, 0, movedItem);

            // 更新 rank：按新索引赋值（从 1 开始）
            const updatedUsers = newUsers.map((user, idx) => ({
                ...user,
                rank: idx + 1,
            }));

            // 同步 selectedUser 的 rank（如果它被移动了）
            // if (selectedUser) {
            //     const updatedSelected = updatedUsers.find((u) => u.id === selectedUser.id);
            //     if (updatedSelected) {
            //         setSelectedUser(updatedSelected);
            //     }
            // }

            // 标记需要保存
            // setNeedSave(true);
            // setRawSelectedUser((prev) => {
            //     // 如果 rawSelectedUser 存在，也更新它的 rank
            //     if (prev && prev.id) {
            //         const updatedRaw = updatedUsers.find((u) => u.id === prev.id);
            //         return updatedRaw || prev;
            //     }
            //     return prev;
            // });

            resetDragState();
            return updatedUsers;
        });
    };

    const resetDragState = () => {
        setDraggedIndex(null);
        setHoverIndex(null);
        // 移除所有临时样式（如果有）
        document.querySelectorAll(".draggable-item").forEach((el) => {
            el.classList.remove("opacity-50", "border-dashed", "border-blue-400");
        });
    };

    // 渲染函数
    const renderUserList = () => {
        if (!localUsers.length) return null;

        if (isSorting) {
            // 拖拽排序模式
            return (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: "0.6rem",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    {localUsers.map((item, index) => (
                        <div
                            key={index}
                            draggable
                            className={`draggable-item border px-3 py-1 rounded cursor-grab bg-white hover:bg-gray-50 relative ${
                                hoverIndex === index ? "border-blue-400 border-dashed" : ""
                            }`}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragLeave={() => {
                                if (hoverIndex === index) setHoverIndex(null);
                            }}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={resetDragState}
                            style={{ minHeight: "28px" }}
                        >
                            <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {index + 1}
                            </span>
                            {item.username}
                        </div>
                    ))}
                </div>
            );
        } else {
            // 普通 RadioGroup 模式
            return (
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
                        const user = localUsers.find((u) => String(u.id) === value);
                        if (needSave) {
                            window.alert("请先保存");
                        } else {
                            setSelectedUser(user);
                            setRawSelectedUser(user);
                        }
                    }}
                >
                    {localUsers.map((item, index) => (
                        <RadioGroup.Item
                            key={index}
                            value={String(item.id)} // RadioGroup 需要字符串 value
                            className="hover:font-bold hover:text-blue-700"
                            checked={selectedUser?.id === item.id}
                        >
                            {item.username}
                        </RadioGroup.Item>
                    ))}
                </RadioGroup.Root>
            );
        }
    };

    return (
        <div className=" flex-1 items-center content-start">
            {/* <h1 className="text-2xl font-bold">用户管理</h1> */}
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <fieldset className="border  rounded-md  p-2">
                    <legend className="text-lg font-bold  inline-flex gap-4 items-center">
                        选择用户 {/* 排序控制按钮 */}
                        <div className=" inline-block">
                            {!isSorting ? (
                                <Button color="red" size="1" onClick={() => setIsSorting(true)}>
                                    调整顺序
                                </Button>
                            ) : (
                                <Button
                                    size="1"
                                    color="green"
                                    onClick={(e) => {
                                        setIsSorting(false);
                                        // 可选：自动保存
                                        // handleSaveSortedUsers();
                                        e.preventDefault();
                                        const batchPayload = localUsers.map((user) => ({
                                            id: user.id,
                                            username: user.username,
                                            rank: user.rank,
                                        }));

                                        fetch(`${API_URL.users}/batch-update-rank`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(batchPayload),
                                        })
                                            .then((res) => res.json())
                                            .then(() => {
                                            
                                                // ✅ 关键：触发 SWR 重新请求 API_URL.users
                                                mutate(API_URL.users); // 简写，等价于 mutate(key, undefined, { revalidate: true })
                                                setNeedSave(false);
                                                setIsSorting(false); // 退出排序模式
                                                alert("排序已保存");
                                            })
                                            .catch((err) => {
                                                console.error(err);
                                                alert("保存失败");
                                            });
                                    }}
                                >
                                    保存排序
                                </Button>
                            )}
                        </div>
                    </legend>
                    {/* 用户列表 */}
                    {renderUserList()}
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
