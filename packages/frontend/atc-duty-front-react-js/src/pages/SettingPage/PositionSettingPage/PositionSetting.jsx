import { Button } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { useAppStore } from "../../../store/app.store";
import { PencilLine, SquarePlus, Check } from "lucide-react";

function PositionSetting() {
    const { positions, fetchPositions, createPosition, updatePosition } = useAppStore();

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    const [editRow, setEditRow] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [newPosition, setNewPosition] = useState(null);

    const handleEdit = (position) => {
        setEditRow(position.id);
        setEditedData({ ...position });
    };

    const handleSave = async (id) => {
        await updatePosition(id, editedData);
        setEditRow(null);
        setEditedData({});
        fetchPositions();
    };

    const handleChange = (e, field) => {
        setEditedData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleCreate = async () => {
        await createPosition(newPosition);
        setNewPosition(null);
        fetchPositions();
    };

    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold text-blue-400">部分席位名称被历史执勤数据使用，无法删除</h1>
            <table className="border-collapse border rounded-lg border-gray-400 table-auto">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-2 py-1">序号</th>
                        <th className="border border-gray-300 px-2 py-1">席位名称</th>
                        <th className="border border-gray-300 px-2 py-1">是否配置主/副班</th>
                        <th className="border border-gray-300 px-2 py-1">是否前端显示</th>
                        <th className="border border-gray-300 px-2 py-1">编辑</th>
                    </tr>
                </thead>
                <tbody>
                    {positions?.map((position) => (
                        <tr key={position.id} style={{ gap: "0.25rem" }}>
                            <td className="border border-gray-300 px-2 py-1">{position.id}</td>
                            <td className="border border-gray-300 px-2 py-1">
                                {editRow === position.id ? (
                                    <input
                                        className="border-2 border-blue-600 rounded-lg px-2 py-1"
                                        type="text"
                                        value={editedData.position}
                                        onChange={(e) => handleChange(e, "position")}
                                    />
                                ) : (
                                    position.position
                                )}
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                                {editRow === position.id ? (
                                    <label className="flex justify-items-center gap-1 text-blue-600 font-bold">
                                        <input
                                            type="checkbox"
                                            checked={editedData.dutyType !== null}
                                            onChange={() => {
                                                setEditedData((prev) => ({
                                                    ...prev,
                                                    dutyType: prev.dutyType === null ? "主班,副班" : null,
                                                }));
                                            }}
                                        />
                                        配置主副班
                                    </label>
                                ) : (
                                    position.dutyType
                                )}
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                                {editRow === position.id ? (
                                    <label className="flex justify-items-center gap-1 text-blue-600 font-bold">
                                        <input
                                            type="checkbox"
                                            checked={editedData.display === 1}
                                            onChange={() => {
                                                setEditedData((prev) => ({
                                                    ...prev,
                                                    display: prev.display === 1 ? 0 : 1,
                                                }));
                                            }}
                                        />
                                        显示
                                    </label>
                                ) : (
                                    <>{position.display === 1 ? "是" : "否"}</>
                                )}
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                                {editRow === position.id ? (
                                    <Button onClick={() => handleSave(position.id)}>
                                        <Check />
                                        保存
                                    </Button>
                                ) : (
                                    <Button color="gray" onClick={() => handleEdit(position)}>
                                        <PencilLine />
                                        修改
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {newPosition && (
                        <tr style={{ gap: "0.25rem" }}>
                            <td className="border border-gray-300 px-2 py-1"></td>
                            <td className="border border-gray-300 px-2 py-1">
                                <input
                                    className="border-2 border-blue-600 rounded-lg px-2 py-1"
                                    type="text"
                                    value={newPosition.position}
                                    onChange={(e) => {
                                        setNewPosition((prev) => ({ ...prev, position: e.target.value }));
                                    }}
                                />
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                                <label className="flex justify-items-center gap-1 text-blue-600 font-bold">
                                    <input
                                        type="checkbox"
                                        checked={newPosition.dutyType !== null}
                                        onChange={() => {
                                            setNewPosition((prev) => ({
                                                ...prev,
                                                dutyType: prev.dutyType === null ? "主班,副班" : null,
                                            }));
                                        }}
                                    />
                                    配置主副班
                                </label>
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                                <label className="flex justify-items-center gap-1 text-blue-600 font-bold">
                                    <input
                                        type="checkbox"
                                        checked={newPosition.display === 1}
                                        onChange={() => {
                                            setNewPosition((prev) => ({
                                                ...prev,
                                                display: prev.display === 1 ? 0 : 1,
                                            }));
                                        }}
                                    />
                                    显示
                                </label>
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                                <Button onClick={handleCreate}>
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
                    onClick={() => {
                        setNewPosition({
                            position: "",
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
