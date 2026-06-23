import { Button } from "@radix-ui/themes";
import React, { useState, useEffect } from "react";
import { useUserStore } from "../../../store/user.store";
import { Minus, Plus } from "lucide-react";

function TeamSettingPage() {
    const { allDetailUsers, fetchAllDetailUsers, loading, updateTeam } = useUserStore();

    const [teamCount, setTeamCount] = useState(2);
    const [editedUser, setEditedUser] = useState([]);
    const [dragUser, setDragUser] = useState(null);
    const [dragSource, setDragSource] = useState(null);
    const [dropIndicator, setDropIndicator] = useState(null);
    const [needSave, setNeedSave] = useState(false);

    useEffect(() => {
        setNeedSave(JSON.stringify(allDetailUsers) !== JSON.stringify(editedUser));
    }, [allDetailUsers, editedUser]);

    // 1. 组件挂载时仅触发一次数据请求
    useEffect(() => {
        fetchAllDetailUsers();
    }, [fetchAllDetailUsers]);

    // 2. 当异步获取到全量用户数据时，将其同步到本地的编辑状态中（仅在本地无数据时初始化，防止覆盖拖拽进度）
    useEffect(() => {
        if (allDetailUsers && allDetailUsers.length > 0 && editedUser.length === 0) {
            setEditedUser(allDetailUsers);
            const maxTeam = Math.max(...allDetailUsers.map((item) => item.team ?? -1));
            setTeamCount(Math.max(maxTeam, 2));
        }
    }, [allDetailUsers, editedUser.length]);
    const handleDragStart = (user, source) => {
        setDragUser(user);
        setDragSource(source);
    };

    const handleDragEnd = () => {
        setDragUser(null);
        setDragSource(null);
        setDropIndicator(null);
    };

    const getTeamUsers = (teamId) => {
        return editedUser.filter((u) => u.team === teamId).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
    };

    const getUnassignedUsers = () => {
        return editedUser
            .filter((u) => u.team === null || u.team >= teamCount)
            .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
    };

    const getAllSorted = () => {
        return [...editedUser].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
    };

    const handleDropToZone = (targetTeamId) => {
        if (!dragUser || dragSource === "all") return;

        setEditedUser((prev) => prev.map((u) => (u.id === dragUser.id ? { ...u, team: targetTeamId } : u)));
        handleDragEnd();
    };

    const handleZoneDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
    };

    const handleReorderAll = (beforeUserId) => {
        if (!dragUser || dragSource !== "all") return;
        if (dragUser.id === beforeUserId) {
            handleDragEnd();
            return;
        }

        setEditedUser((prev) => {
            const sorted = [...prev].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
            const moved = sorted.find((u) => u.id === dragUser.id);
            const filtered = sorted.filter((u) => u.id !== dragUser.id);
            const insertIdx = filtered.findIndex((u) => u.id === beforeUserId);
            const reordered = [...filtered.slice(0, insertIdx), moved, ...filtered.slice(insertIdx)];
            return reordered.map((u, i) => ({ ...u, rank: i }));
        });

        handleDragEnd();
    };

    const handleReorderAllEnd = () => {
        if (!dragUser || dragSource !== "all") return;

        setEditedUser((prev) => {
            const sorted = [...prev].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
            const moved = sorted.find((u) => u.id === dragUser.id);
            const filtered = sorted.filter((u) => u.id !== dragUser.id);
            const reordered = [...filtered, moved];
            return reordered.map((u, i) => ({ ...u, rank: i }));
        });

        handleDragEnd();
    };

    const renderAllMembers = () => {
        const users = getAllSorted();
        return users.map((user, idx) => (
            <div
                key={user.id}
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", user.id.toString());
                    handleDragStart(user, "all");
                }}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => {
                    if (dragSource !== "all") return;
                    e.preventDefault();
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const midX = rect.left + rect.width / 2;
                    setDropIndicator({
                        userId: user.id,
                        zone: "all",
                        position: e.clientX < midX ? "before" : "after",
                    });
                }}
                onDragLeave={() => setDropIndicator(null)}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (dragSource !== "all" || !dragUser) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const midX = rect.left + rect.width / 2;
                    const insertBefore = e.clientX < midX;

                    setEditedUser((prev) => {
                        const sorted = [...prev].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
                        const moved = sorted.find((u) => u.id === dragUser.id);
                        const filtered = sorted.filter((u) => u.id !== dragUser.id);
                        let insertIdx = filtered.findIndex((u) => u.id === user.id);
                        if (!insertBefore) insertIdx += 1;
                        const reordered = [...filtered.slice(0, insertIdx), moved, ...filtered.slice(insertIdx)];
                        return reordered.map((u, i) => ({ ...u, rank: i }));
                    });
                    handleDragEnd();
                }}
                className="flex items-center"
            >
                {dropIndicator?.userId === user.id &&
                    dropIndicator?.zone === "all" &&
                    dropIndicator?.position === "before" && (
                        <div className="w-0.5 h-8 bg-blue-400 rounded-full mx-[-2px] flex-shrink-0" />
                    )}
                <div
                    className={`bg-blue-50 hover:bg-blue-400 hover:cursor-grabbing  text-sm  flex items-center justify-center flex-shrink-0 py-1 px-2  rounded select-none  gap-1 ${
                        dragUser?.id === user.id ? "opacity-40" : ""
                    }`}
                >
                    {idx + 1}､{user.username}
                </div>
                {dropIndicator?.userId === user.id &&
                    dropIndicator?.zone === "all" &&
                    dropIndicator?.position === "after" && (
                        <div className="w-0.5 h-8 bg-blue-600 rounded-full mx-[-2px] flex-shrink-0" />
                    )}
            </div>
        ));
    };

    const renderZoneCards = (users) => {
        return users.map((user, idx) => (
            <div
                key={user.id}
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", user.id.toString());
                    handleDragStart(user, "zone");
                }}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                className={`bg-blue-50 hover:bg-blue-400 hover:cursor-grabbing  py-1 px-2 text-sm rounded select-none flex items-center gap-1 ${
                    dragUser?.id === user.id ? "opacity-40" : ""
                }`}
            >
                {idx + 1}､{user.username}
            </div>
        ));
    };

    const handleSave = async () => {
        const data = editedUser.map((u) => ({
            id: u.id,
            team: u.team,
            rank: u.rank,
        }));
        // data.forEach((u) => {
        //     const user = data.find((d) => d.id === u.id);
        //     console.log(user.id, user.team, user.rank);
        // });
        console.log(data);
        await updateTeam(data);
        // fetchAllDetailUsers();
    };

    if (loading) return <div>加载中...</div>;

    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold text-blue-400">此处修改执勤界面</h1>
            <div className="flex flex-col gap-4">
                <fieldset className="border border-gray-300 rounded-md p-2">
                    <legend className="text-lg font-bold">设置班组数</legend>
                    <div>
                        <label className="text-lg font-bold">当前班组数：{teamCount}</label>
                        <div>
                            <button
                                type="button"
                                className=" hover:bg-blue-700  font-bold py-1 px-4 text-lg rounded"
                                disabled={teamCount <= 1}
                                onClick={() => {
                                    if (teamCount > 1) setTeamCount((prev) => prev - 1);
                                }}
                            >
                                <Minus />
                            </button>
                            <input
                                type="range"
                                max={8}
                                value={teamCount}
                                onChange={(e) => {
                                    e.preventDefault();
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value >= 1 && value <= 8) setTeamCount(value);
                                }}
                                className="border  border-green-500 rounded-md px-1 py-1 text-lg text-center"
                            />
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 text-lg rounded"
                                disabled={teamCount >= 8}
                                onClick={() => {
                                    if (teamCount < 8) setTeamCount((prev) => prev + 1);
                                }}
                            >
                                <Plus />
                            </button>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border border-gray-300 rounded-md p-2">
                    <legend className="text-lg font-bold">
                        全体成员 <span className="text-sm text-blue-700">(拖动排序)</span>
                    </legend>
                    <div className="flex flex-row gap-2 text-nowrap flex-wrap items-center min-h-[2.5rem]">
                        {renderAllMembers()}
                    </div>
                </fieldset>

                <fieldset
                    onDragOver={handleZoneDragOver}
                    onDrop={() => handleDropToZone(null)}
                    className="border border-gray-300 p-4 rounded min-h-[4rem]"
                >
                    <legend className="font-bold">未分组</legend>
                    <div className="flex flex-row gap-2 text-nowrap flex-wrap items-center">
                        {renderZoneCards(getUnassignedUsers())}
                        {getUnassignedUsers().length === 0 && (
                            <span className="text-gray-400 text-sm">将成员拖到此处</span>
                        )}
                    </div>
                </fieldset>

                {[...Array(teamCount).keys()].map((i) => (
                    <fieldset
                        key={i}
                        onDragOver={handleZoneDragOver}
                        onDrop={() => handleDropToZone(i)}
                        className="border border-gray-300 p-4 rounded min-h-[4rem]"
                    >
                        <legend className="font-bold">Team {i}</legend>
                        <div className="flex flex-row gap-2 text-nowrap flex-wrap items-center">
                            {renderZoneCards(getTeamUsers(i))}
                            {getTeamUsers(i).length === 0 && (
                                <span className="text-gray-400 text-sm">将成员拖到此处</span>
                            )}
                        </div>
                    </fieldset>
                ))}
            </div>
            <Button onClick={handleSave} disabled={!needSave}>
                保存
            </Button>
        </div>
    );
}

export default TeamSettingPage;
