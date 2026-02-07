import { Button, Flex, Checkbox, CheckboxGroup, Text, TextField, Radio, RadioGroup } from "@radix-ui/themes";
import React, { useState } from "react";
import { API_URL } from "../../../../utils/const/Const";
import useSWR, { mutate } from "swr";
import { usePage, SERVER_URL, FETCHER } from "@utils";
import { PencilLine, Trash2, SquarePlus, Check } from "lucide-react";

function PositionSetting() {
    const { data: positions } = useSWR(API_URL.positions, FETCHER);

    const [editingRow, setEditingRow] = useState({});

    const [newPosition, setNewPosition] = useState(null);

    const handleSave = () => {
        // 在这里处理保存逻辑，例如更新状态或发送API请求
        console.log("Saving data for position:", editingRow);
        setEditingRow(null);
        if (!editingRow?.id) {
            // 没有ID 就是新ID
            fetch(`${API_URL.query_positions}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editingRow),
            })
                .then((response) => response.json())
                .then((data) => {
                    // console.log("Data updated successfully:", data);
                    setEditingRow({});
                })
                .then(() => {
                    mutate(API_URL.query_positions);
                });
        } else if (editingRow?.id) {
            // 没有ID 就是新ID
            fetch(`${API_URL.query_positions}/${editingRow.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editingRow),
            })
                .then((response) => response.json())
                .then((data) => {
                    // console.log("Data updated successfully:", data);
                    setEditingRow({});
                })
                .then(() => {
                    mutate(API_URL.query_positions);
                });
        } else {
            console.log("No ID found for editing row.");
        }
    };

    const handleChange = (e, field) => {
        setEditingRow((prev) => {
            return {
                ...prev,
                [field]: e.target.value,
            };
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold text-red-300">部分席位名称被历史执勤数据使用，无法删除</h1>
            <table className="border-collapse border rounded-lg border-gray-400 table-auto ">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-2 py-1">序号</th>
                        <th className="border border-gray-300 px-2 py-1 w-[8rem] max-w-[8rem]">席位名称</th>
                        <th className="border border-gray-300 px-2 py-1">是否配置主/副班</th>
                        <th className="border border-gray-300 px-2 py-1">是否前端显示</th>
                        <th className="border border-gray-300 px-2 py-1">编辑</th>
                    </tr>
                </thead>
                <tbody>
                    {positions?.map((position, index) => {
                        return (
                            <tr key={index} style={{ gap: "0.25rem" }}>
                                <td className="border border-gray-300 px-2 py-1">{position.id}</td>
                                <td className="border border-gray-300 px-2 py-1 ">
                                    {editingRow?.id === position.id ? (
                                        <input
                                            className="border-2 border-blue-600 rounded-lg px-2 py-1 w-full disabled:cursor-not-allowed"
                                            type="text"
                                            value={editingRow.position}
                                            onChange={(e) => handleChange(e, "position")}
                                        />
                                    ) : (
                                        position.position
                                    )}
                                </td>
                                <td className="border border-gray-300 px-2 py-1">
                                    {editingRow?.id === position.id ? (
                                        <label
                                            htmlFor={`${position.id}dutyType`}
                                            className="flex justify-items-center gap-1 text-blue-600 font-bold"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`${position.id}dutyType`}
                                                value={editingRow.dutyType}
                                                checked={editingRow.dutyType !== null}
                                                onChange={(e) => {
                                                    setEditingRow((prev) => {
                                                        return {
                                                            ...prev,
                                                            dutyType: e.target.checked ? `主班,副班` : null,
                                                        };
                                                    });
                                                }}
                                            />
                                            配置主副班
                                        </label>
                                    ) : (
                                        position.dutyType
                                    )}
                                </td>
                                <td className="border border-gray-300 px-2 py-1">
                                    {editingRow?.id === position.id ? (
                                        <label
                                            htmlFor={`${position.id}display`}
                                            className="flex justify-items-center gap-1 text-blue-600 font-bold"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`${position.id}display`}
                                                value={editingRow.display}
                                                onChange={(e) => {
                                                    setEditingRow((prev) => {
                                                        return {
                                                            ...prev,
                                                            display: prev.display === 1 ? 0 : 1,
                                                        };
                                                    });
                                                }}
                                                checked={editingRow.display}
                                            />
                                            显示
                                        </label>
                                    ) : (
                                        <>{position.display === 1 ? "是" : "否"}</>
                                    )}
                                </td>
                                <td className="border border-gray-300 px-2 py-1">
                                    {editingRow?.id === position.id ? (
                                        <Button onClick={() => handleSave(position.id)}>
                                            <Check />
                                            保存
                                        </Button>
                                    ) : (
                                        <Button color="gray" onClick={() => setEditingRow(position)}>
                                            <PencilLine />
                                            修改
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {newPosition && (
                        <tr style={{ gap: "0.25rem" }}>
                            <td className="border border-gray-300 px-2 py-1"></td>
                            <td className="border border-gray-300 px-2 py-1">
                                <input
                                    className="border-2 border-blue-600 rounded-lg px-2 py-1 w-[8rem]"
                                    type="text"
                                    value={newPosition?.position}
                                    maxLength={7}
                                    onChange={(e) => {
                                        setNewPosition((prev) => {
                                            return {
                                                ...prev,
                                                position: e.target.value,
                                            };
                                        });
                                    }}
                                />
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                                <label
                                    htmlFor={`new-dutyType`}
                                    className="flex justify-items-center gap-1 text-blue-600 font-bold"
                                >
                                    <input
                                        type="checkbox"
                                        id={`new-dutyType`}
                                        value={newPosition?.dutyType}
                                        checked={newPosition?.dutyType !== null}
                                        onChange={(e) => {
                                            if (newPosition?.dutyType === null) {
                                                setNewPosition((prev) => {
                                                    return {
                                                        ...prev,
                                                        dutyType: `主班,副班`,
                                                    };
                                                });
                                            } else {
                                                setNewPosition((prev) => {
                                                    return {
                                                        ...prev,
                                                        dutyType: null,
                                                    };
                                                });
                                            }
                                        }}
                                    />
                                    配置主副班
                                </label>
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                                <label
                                    htmlFor={`new-display`}
                                    className="flex justify-items-center gap-1 text-blue-600 font-bold"
                                >
                                    <input
                                        type="checkbox"
                                        id={`new-display`}
                                        value={newPosition?.display}
                                        onChange={(e) => {
                                            setNewPosition((prev) => {
                                                return {
                                                    ...prev,
                                                    display: prev.display === 1 ? 0 : 1,
                                                };
                                            });
                                        }}
                                        checked={newPosition?.display}
                                    />
                                    显示
                                </label>
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                                <Button
                                    onClick={() => {
                                        fetch(`${SERVER_URL}/positions`, {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify(newPosition),
                                        })
                                            .then((response) => response.json())
                                            .then((data) => {
                                                console.log("Data updated successfully:", data);
                                                setNewPosition(null);
                                            })
                                            .then(() => {
                                                mutate(API_URL.query_positions);
                                            });
                                    }}
                                >
                                    <Check />
                                    保存
                                </Button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="flex justify-end">
                <Button
                    color="green"
                    disabled={newPosition}
                    onClick={() => {
                        setNewPosition({
                            position: null,
                            dutyType: null,
                            display: 0,
                        });
                    }}
                >
                    <SquarePlus />
                    新建
                </Button>
            </div>
        </div>
    );
}

export default PositionSetting;
